// 경로 ↔ 로케일 유틸 — ko(프리픽스 없음) / en(/en 프리픽스)

export function localeFromPathname(pathname) {
  return pathname === '/en' || pathname?.startsWith('/en/') ? 'en' : 'ko';
}

/** /en 프리픽스를 제거한 KR 기준 경로 반환 */
export function stripLocale(pathname) {
  if (pathname === '/en') return '/';
  if (pathname?.startsWith('/en/')) return pathname.slice(3);
  return pathname || '/';
}

/** KR 기준 경로에 로케일 프리픽스 적용 */
export function withLocale(path, locale) {
  const kr = stripLocale(path);
  if (locale !== 'en') return kr;
  return kr === '/' ? '/en' : `/en${kr}`;
}

// 게시글 상세는 언어별 DB가 달라 대응 글이 없다 → 목록으로 폴백.
// /support/consultation/write, /support/catalog/write 는 양쪽 모두 존재하므로 유지.
const BOARD_LIST_RE = /^(\/(?:support\/(?:notices|tech-guide|downloads|consultation|catalog)|about\/careers))\/([^/]+)$/;

/** ko|en 토글 대상 경로 계산 */
export function togglePath(pathname, targetLocale) {
  let kr = stripLocale(pathname);
  const m = BOARD_LIST_RE.exec(kr);
  if (m && m[2] !== 'write') {
    kr = m[1]; // 게시글 상세 → 목록
  }
  return withLocale(kr, targetLocale);
}
