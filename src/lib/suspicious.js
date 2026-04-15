// 가입 정보에서 의심 패턴을 탐지한다.
// 탐지된 플래그 배열을 반환하며, 비어 있으면 정상으로 간주한다.

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com',
  'guerrillamail.com', 'throwawaymail.com', 'yopmail.com', 'trashmail.com',
  'sharklasers.com', 'maildrop.cc', 'dispostable.com', 'getnada.com',
  'emailondeck.com', 'fakeinbox.com', 'tempr.email',
]);

const HANGUL_REGEX = /[\uAC00-\uD7AF]/;
const LATIN_LETTER_REGEX = /[A-Za-z]/;
const DIGIT_REGEX = /\d/;

export function detectSuspicion({ name, email, phone, company }) {
  const flags = [];

  const local = (email || '').split('@')[0] || '';
  const domain = ((email || '').split('@')[1] || '').toLowerCase();

  // Gmail dot trick: local-part에 dot이 3개 이상이면 봇 회피 패턴 의심
  if ((domain === 'gmail.com' || domain === 'googlemail.com') && (local.match(/\./g) || []).length >= 3) {
    flags.push('GMAIL_DOT_TRICK');
  }

  // Disposable email 차단
  if (DISPOSABLE_DOMAINS.has(domain)) {
    flags.push('DISPOSABLE_EMAIL');
  }

  // 이름 검사: 한글이 전혀 없고 라틴 글자만 15자 이상 연속이면 랜덤 문자열로 간주
  const trimmedName = (name || '').trim();
  if (trimmedName.length >= 15 && !HANGUL_REGEX.test(trimmedName) && LATIN_LETTER_REGEX.test(trimmedName) && !trimmedName.includes(' ')) {
    flags.push('RANDOM_NAME');
  }

  // 전화번호 검사: 값이 있는데 숫자 비율이 절반 미만이면 봇 의심
  if (phone && phone.length > 0) {
    const digits = (phone.match(/\d/g) || []).length;
    if (digits === 0 || digits / phone.length < 0.5) {
      flags.push('RANDOM_PHONE');
    }
  }

  // 회사 검사: 한글 없이 라틴 글자 15자 이상이고 공백 없음 → 랜덤 문자열
  const trimmedCompany = (company || '').trim();
  if (trimmedCompany.length >= 15 && !HANGUL_REGEX.test(trimmedCompany) && LATIN_LETTER_REGEX.test(trimmedCompany) && !trimmedCompany.includes(' ')) {
    flags.push('RANDOM_COMPANY');
  }

  return flags;
}

export function formatFlags(flags) {
  const labels = {
    GMAIL_DOT_TRICK: 'Gmail dot 회피',
    DISPOSABLE_EMAIL: '일회용 이메일',
    RANDOM_NAME: '랜덤 이름',
    RANDOM_PHONE: '랜덤 전화',
    RANDOM_COMPANY: '랜덤 회사',
  };
  return flags.map(f => labels[f] || f);
}
