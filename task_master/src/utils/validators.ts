/**
 * 입력 검증 유틸리티
 */

import type { Provider } from '../types/index.js';
import { API_KEY_PATTERNS } from '../types/index.js';

/**
 * API 키 포맷 검증
 */
export function validateApiKey(provider: Provider, key: string): boolean {
  if (!key || typeof key !== 'string') return false;

  const pattern = API_KEY_PATTERNS[provider];
  if (!pattern) return key.length > 10; // 알려지지 않은 프로바이더는 기본 검증

  return pattern.test(key);
}

/**
 * API 키 포맷 검증 (프롬프트용 - 오류 메시지 반환)
 */
export function validateApiKeyWithMessage(provider: Provider, key: string): string | true {
  if (!key || key.trim() === '') {
    return '비어있거나 공백 입력됨 (스킵하려면 Enter)';
  }

  if (!validateApiKey(provider, key)) {
    const examples: Record<Provider, string> = {
      anthropic: 'sk-ant-...',
      openai: 'sk-proj-...',
      google: 'AIza...',
      perplexity: 'pplx-...',
      mistral: '...',
      xai: 'xai-...',
      openrouter: 'sk-or-...',
    };
    return `잘못된 ${provider} API 키 형식입니다. 예: ${examples[provider]}`;
  }

  return true;
}

/**
 * 프로바이더 이름 검증
 */
export function isValidProvider(provider: string): provider is Provider {
  return ['anthropic', 'openai', 'google', 'perplexity', 'mistral', 'xai', 'openrouter'].includes(provider);
}

/**
 * 모델 역할 검증
 */
export function isValidModelRole(role: string): role is 'main' | 'research' | 'fallback' {
  return ['main', 'research', 'fallback'].includes(role);
}

/**
 * 디렉토리 경로 검증
 */
export function isValidPath(dirPath: string): boolean {
  // 기본적인 경로 검증
  if (!dirPath || typeof dirPath !== 'string') return false;
  if (dirPath.includes('\0')) return false; // null byte 방지

  return true;
}

/**
 * 프로젝트 이름 검증
 */
export function validateProjectName(name: string): string | true {
  if (!name || name.trim() === '') {
    return '프로젝트 이름을 입력해주세요';
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return '프로젝트 이름은 영문, 숫자, 하이픈, 언더스코어만 사용 가능합니다';
  }

  if (name.length > 50) {
    return '프로젝트 이름은 50자 이하여야 합니다';
  }

  return true;
}
