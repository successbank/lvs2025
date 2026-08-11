import sharp from 'sharp';

/**
 * 업로드 이미지 목표 용량 — 배너/슬라이더 기준 평균 600KB 수준을 유지한다.
 * 목표를 "상한"으로 두고 화질을 낮춰가며 처음 만족하는 결과를 채택하므로,
 * 원본이 작으면 그대로 작게 유지되고 큰 원본만 600KB 이하로 눌린다.
 */
export const TARGET_BYTES = 600 * 1024;

/** 화질 하강 단계 — 위에서부터 시도 */
const QUALITY_STEPS = [85, 78, 70, 62, 54, 46, 38, 30];

/** 가독성이 중요한 이미지(인증서·로고 등)용 — 더 높은 화질에서 시작 */
export const HIGH_QUALITY_STEPS = [90, 84, 78, 70, 62, 54, 46, 38];

/** 최저 화질로도 목표를 못 맞추면 가로폭을 이 비율로 줄여 재시도 */
const SHRINK_RATIO = 0.8;
const SHRINK_TRIES = 3;

/**
 * 이미지를 목표 용량 이하의 WebP로 변환한다.
 *
 * @param {Buffer} input 원본 이미지 버퍼
 * @param {object} [options]
 * @param {number} [options.width]  고정 리사이즈 가로 (height와 함께 사용)
 * @param {number} [options.height] 고정 리사이즈 세로
 * @param {string} [options.fit]      width/height 지정 시 fit 모드 (기본 cover)
 * @param {string} [options.position] width/height 지정 시 crop 기준점 (기본 center)
 * @param {boolean} [options.withoutEnlargement] width/height 지정 시 원본보다 확대하지 않음
 * @param {number} [options.maxWidth] 비율 유지 상한 가로폭 (width 미지정 시 사용, 확대 없음)
 * @param {number} [options.targetBytes] 목표 용량 (기본 TARGET_BYTES)
 * @param {number[]} [options.qualitySteps] 화질 하강 단계 (기본 QUALITY_STEPS)
 * @returns {Promise<{ buffer: Buffer, width: number, height: number, bytes: number, quality: number, withinTarget: boolean }>}
 */
export async function compressToTarget(input, options = {}) {
  const {
    width = null,
    height = null,
    fit = 'cover',
    position = 'center',
    withoutEnlargement = false,
    maxWidth = null,
    targetBytes = TARGET_BYTES,
    qualitySteps = QUALITY_STEPS,
  } = options;

  const metadata = await sharp(input).metadata();
  // 애니메이션 GIF/WebP는 전체 프레임을 유지해야 하므로 animated 모드로 처리한다.
  const animated = (metadata.pages || 1) > 1;

  const encode = async (scale, quality) => {
    let pipeline = sharp(input, animated ? { animated: true } : {});
    // EXIF 회전 정보 반영 (애니메이션은 rotate 미지원이라 제외)
    if (!animated) pipeline = pipeline.rotate();

    if (width) {
      pipeline = pipeline.resize(
        Math.max(1, Math.round(width * scale)),
        height ? Math.max(1, Math.round(height * scale)) : null,
        { fit, position, withoutEnlargement }
      );
    } else if (maxWidth) {
      const cap = Math.min(maxWidth, metadata.width || maxWidth);
      pipeline = pipeline.resize(Math.max(1, Math.round(cap * scale)), null, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const { data, info } = await pipeline
      .webp({ quality, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    return { buffer: data, width: info.width, height: info.height, bytes: data.length, quality };
  };

  let best = null;
  let scale = 1;

  for (let attempt = 0; attempt <= SHRINK_TRIES; attempt++) {
    for (const quality of qualitySteps) {
      const result = await encode(scale, quality);
      if (result.bytes <= targetBytes) {
        return { ...result, withinTarget: true };
      }
      if (!best || result.bytes < best.bytes) best = result;
    }
    scale *= SHRINK_RATIO;
  }

  // 목표를 끝내 못 맞춘 경우에도 가장 작은 결과를 반환한다 (업로드 실패보다 낫다).
  return { ...best, withinTarget: false };
}

/**
 * 리사이징이 필요한지 판단한다.
 * 이미 목표 용량 이하이고 가로폭 상한도 넘지 않으면 원본을 그대로 두어
 * 로고/도형 이미지의 재인코딩 손실을 피한다.
 */
export async function needsOptimization(input, { maxWidth = null, targetBytes = TARGET_BYTES } = {}) {
  if (input.length > targetBytes) return true;
  if (!maxWidth) return false;
  const { width } = await sharp(input).metadata();
  return (width || 0) > maxWidth;
}
