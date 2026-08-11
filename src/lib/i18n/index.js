import ko from './ko';
import en from './en';

const dicts = { ko, en };

/** 로케일 사전 반환 (기본 ko) */
export function getDict(locale) {
  return dicts[locale] || dicts.ko;
}

/** 날짜 포맷 — KR은 기존 toLocaleDateString('ko-KR')과 동일 출력 유지 */
export function formatDate(date, locale = 'ko', options) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', options);
}

export { localeFromPathname, stripLocale, withLocale, togglePath } from './localePath';
