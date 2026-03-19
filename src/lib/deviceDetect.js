import { UAParser } from 'ua-parser-js';

export function parseUserAgent(userAgentString) {
  if (!userAgentString) {
    return { deviceType: 'desktop', browser: null, os: null };
  }

  const parser = new UAParser(userAgentString);
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  let deviceType = 'desktop';
  if (device.type === 'mobile') deviceType = 'mobile';
  else if (device.type === 'tablet') deviceType = 'tablet';

  return {
    deviceType,
    browser: browser.name || null,
    os: os.name || null,
  };
}

const BOT_PATTERN = /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|bingpreview|yandex|baidu|duckduck|semrush|ahref/i;

export function isBot(userAgentString) {
  if (!userAgentString) return false;
  return BOT_PATTERN.test(userAgentString);
}

export function anonymizeIp(ip) {
  if (!ip) return null;
  if (ip.includes('.')) {
    return ip.replace(/\.\d+$/, '.0');
  }
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 2) {
      parts[parts.length - 1] = '0';
      parts[parts.length - 2] = '0';
      return parts.join(':');
    }
  }
  return ip;
}
