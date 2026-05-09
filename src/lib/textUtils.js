// HTML 문자열에서 태그를 제거하고 plain text로 변환.
// 카드 영역의 product.description에 HTML이 섞여 있을 때 깨짐 방지용.
//
// stripHtml(html, maxLen = 120):
//   - 모든 태그 제거 (<br/>, <img>, <p> 등)
//   - HTML 엔티티 일부 디코드 (&nbsp; &amp; &lt; &gt; &quot;)
//   - 연속 공백 정리
//   - maxLen 초과 시 ... 추가
export function stripHtml(html, maxLen = 120) {
  if (!html) return '';
  const text = String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}

// 제품 카드용 짧은 설명. summary가 있으면 그대로(있는 그대로 사용),
// 없으면 description에서 HTML 제거 + 자르기. 모두 비면 fallback 반환.
export function pickProductSummary(product, fallback = '-', maxLen = 120) {
  if (product?.summary && String(product.summary).trim().length > 0) {
    return String(product.summary).trim();
  }
  const stripped = stripHtml(product?.description, maxLen);
  return stripped || fallback;
}
