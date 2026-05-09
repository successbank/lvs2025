// src/lib/mailer.js
//
// 문의(상담/카탈로그) 알림 메일 발송 — fire-and-forget 패턴
// 호출부: src/app/api/posts/route.js POST 핸들러 (트랜잭션 COMMIT 직후)
//
// 설계 원칙:
//  - SMTP 환경변수가 없거나 발송에 실패해도 요청 응답에 영향 주지 않음 (모든 에러는 console.error 로 격리)
//  - 수신자 배열 입력 시 빈 값/잘못된 형식은 자동 필터링
//  - transporter 는 모듈 스코프에서 lazy singleton 으로 생성 (lib/prisma.js 패턴 동일)

import nodemailer from 'nodemailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let cachedTransporter = null;
let cachedConfig = null;

/**
 * SMTP transporter 싱글톤. env 누락 시 null 반환 (throw 금지).
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  // env 변경 시 재생성 (Coolify 재배포 후 컨테이너는 새 env)
  const fingerprint = `${host}:${port}:${user}`;
  if (cachedTransporter && cachedConfig === fingerprint) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465=SMTPS, 587=STARTTLS
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { rejectUnauthorized: true },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  cachedConfig = fingerprint;
  return cachedTransporter;
}

function formatKstDateTime(input) {
  try {
    const d = input instanceof Date ? input : new Date(input);
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return String(input ?? '');
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(str, max = 500) {
  const s = String(str ?? '');
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

function buildSubject({ boardSlug, title }) {
  const label = boardSlug === 'consultation' ? '상담' : boardSlug === 'catalog' ? '카탈로그' : '문의';
  const safeTitle = String(title ?? '').slice(0, 80);
  return `[LVS 문의] [${label}] ${safeTitle}`;
}

function buildHtml({ post, boardSlug, attachmentCount, baseUrl }) {
  const label = boardSlug === 'consultation' ? '상담' : '카탈로그';
  const adminUrl = `${baseUrl}/admin/inquiries`;
  const previewContent = truncate(post.content, 500);

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>LVS 문의 알림</title></head>
<body style="margin:0;padding:24px;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans KR',sans-serif;color:#222;line-height:1.55;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:#1f3a8a;color:#fff;padding:20px 24px;">
      <div style="font-size:13px;opacity:.85;letter-spacing:.04em;">LVS 온라인 문의 알림</div>
      <div style="font-size:18px;font-weight:600;margin-top:4px;">[${escapeHtml(label)}] 새 문의가 등록되었습니다</div>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr><td style="padding:8px 0;color:#666;width:90px;">종류</td><td style="padding:8px 0;">${escapeHtml(label)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">제목</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(post.title)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">작성자</td><td style="padding:8px 0;">${escapeHtml(post.author || '-')}${post.company ? ` (${escapeHtml(post.company)})` : ''}</td></tr>
          ${post.contact_name ? `<tr><td style="padding:8px 0;color:#666;">담당자</td><td style="padding:8px 0;">${escapeHtml(post.contact_name)}</td></tr>` : ''}
          ${post.contact_email ? `<tr><td style="padding:8px 0;color:#666;">이메일</td><td style="padding:8px 0;">${escapeHtml(post.contact_email)}</td></tr>` : ''}
          ${post.contact_phone ? `<tr><td style="padding:8px 0;color:#666;">연락처</td><td style="padding:8px 0;">${escapeHtml(post.contact_phone)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#666;">작성일시</td><td style="padding:8px 0;">${escapeHtml(formatKstDateTime(post.created_at))}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">첨부파일</td><td style="padding:8px 0;">${attachmentCount > 0 ? `${attachmentCount}개 (관리자 페이지에서 다운로드)` : '없음'}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:18px;padding-top:18px;border-top:1px solid #eee;">
        <div style="color:#666;font-size:13px;margin-bottom:6px;">내용 (최대 500자)</div>
        <div style="white-space:pre-wrap;font-size:14px;background:#fafbfc;border:1px solid #eef0f2;border-radius:6px;padding:12px 14px;">${escapeHtml(previewContent)}</div>
      </div>
      <div style="margin-top:24px;text-align:center;">
        <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#1f3a8a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">관리자 페이지에서 보기</a>
      </div>
    </div>
    <div style="background:#f5f6f8;padding:14px 24px;font-size:12px;color:#888;border-top:1px solid #eef0f2;">
      본 메일은 lvs.co.kr 시스템에서 자동 발송된 알림입니다. 답장은 운영자에게 전달되지 않을 수 있습니다.
    </div>
  </div>
</body></html>`;
}

function buildText({ post, boardSlug, attachmentCount, baseUrl }) {
  const label = boardSlug === 'consultation' ? '상담' : '카탈로그';
  const lines = [
    `[LVS 문의] [${label}] 새 문의가 등록되었습니다`,
    '',
    `종류:       ${label}`,
    `제목:       ${post.title}`,
    `작성자:     ${post.author || '-'}${post.company ? ` (${post.company})` : ''}`,
  ];
  if (post.contact_name) lines.push(`담당자:     ${post.contact_name}`);
  if (post.contact_email) lines.push(`이메일:     ${post.contact_email}`);
  if (post.contact_phone) lines.push(`연락처:     ${post.contact_phone}`);
  lines.push(`작성일시:   ${formatKstDateTime(post.created_at)}`);
  lines.push(`첨부파일:   ${attachmentCount > 0 ? `${attachmentCount}개 (관리자 페이지에서 다운로드)` : '없음'}`);
  lines.push('');
  lines.push('내용 (최대 500자):');
  lines.push(truncate(post.content, 500));
  lines.push('');
  lines.push(`관리자 페이지: ${baseUrl}/admin/inquiries`);
  lines.push('');
  lines.push('— 본 메일은 lvs.co.kr 시스템에서 자동 발송된 알림입니다.');
  return lines.join('\n');
}

/**
 * 알림 메일 발송 (fire-and-forget).
 * @param {object} args
 * @param {object} args.post — 게시물 row (id, title, content, author, company, contact_*, created_at)
 * @param {string} args.boardSlug — 'consultation' | 'catalog'
 * @param {string[]} args.recipients — 수신자 배열 (빈 값/잘못된 형식 자동 필터)
 * @param {number} [args.attachmentCount=0]
 * @param {string} [args.baseUrl]
 */
export async function sendInquiryNotification({
  post,
  boardSlug,
  recipients,
  attachmentCount = 0,
  baseUrl,
}) {
  try {
    const validRecipients = (recipients || []).filter(
      (e) => typeof e === 'string' && EMAIL_RE.test(e.trim())
    ).map((e) => e.trim());

    if (validRecipients.length === 0) {
      console.info('[mailer] no recipient, skip');
      return;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.warn('[mailer] SMTP env missing, skip send');
      return;
    }

    const resolvedBase = baseUrl || process.env.NEXTAUTH_URL || 'https://lvs.co.kr';
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from,
      to: validRecipients,
      subject: buildSubject({ boardSlug, title: post.title }),
      html: buildHtml({ post, boardSlug, attachmentCount, baseUrl: resolvedBase }),
      text: buildText({ post, boardSlug, attachmentCount, baseUrl: resolvedBase }),
    });

    console.info(
      `[mailer] sent boardSlug=${boardSlug} postId=${post.id} to=${validRecipients.length}명 messageId=${info?.messageId || '?'}`
    );
  } catch (err) {
    // 절대 throw 하지 않음 — 호출부의 catch().catch(...)에 의존하지 않도록 내부에서 격리
    console.error('[mailer] send failed', err);
  }
}
