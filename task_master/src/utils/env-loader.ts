/**
 * .env 파일에서 API 키 로드 유틸리티
 */

import fs from 'fs-extra';
import path from 'path';
import type { Provider } from '../types/index.js';

// 환경변수 이름과 프로바이더 매핑
const ENV_KEY_MAP: Record<string, Provider> = {
  ANTHROPIC_API_KEY: 'anthropic',
  OPENAI_API_KEY: 'openai',
  GOOGLE_API_KEY: 'google',
  PERPLEXITY_API_KEY: 'perplexity',
  MISTRAL_API_KEY: 'mistral',
  XAI_API_KEY: 'xai',
  OPENROUTER_API_KEY: 'openrouter',
};

/**
 * .env 파일 파싱
 */
function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  const lines = content.split('\n');
  for (const line of lines) {
    // 주석 및 빈 줄 스킵
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // KEY=VALUE 또는 KEY="VALUE" 또는 KEY='VALUE' 파싱
    // 먼저 = 위치 찾기
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex);
    let value = trimmed.substring(eqIndex + 1).trim();

    // 유효한 환경변수 키 형식인지 확인
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue;

    // 따옴표로 시작하는 경우 닫는 따옴표까지만 값으로 인식
    if (value.startsWith('"')) {
      const endQuote = value.indexOf('"', 1);
      if (endQuote !== -1) {
        value = value.substring(1, endQuote);
      } else {
        value = value.substring(1);
      }
    } else if (value.startsWith("'")) {
      const endQuote = value.indexOf("'", 1);
      if (endQuote !== -1) {
        value = value.substring(1, endQuote);
      } else {
        value = value.substring(1);
      }
    } else {
      // 따옴표가 없으면 공백이나 # 전까지만 값으로 인식
      const spaceIndex = value.search(/\s/);
      if (spaceIndex !== -1) {
        value = value.substring(0, spaceIndex);
      }
    }

    if (value) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 특정 경로의 .env 파일에서 API 키 로드
 */
export async function loadApiKeysFromEnvFile(envPath: string): Promise<Partial<Record<Provider, string>>> {
  const apiKeys: Partial<Record<Provider, string>> = {};

  try {
    if (await fs.pathExists(envPath)) {
      const content = await fs.readFile(envPath, 'utf-8');
      const envVars = parseEnvFile(content);

      for (const [envKey, provider] of Object.entries(ENV_KEY_MAP)) {
        const value = envVars[envKey];
        if (value && value.trim() !== '') {
          apiKeys[provider] = value;
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Failed to read ${envPath}:`, (error as Error).message);
  }

  return apiKeys;
}

/**
 * 현재 디렉토리 또는 상위 디렉토리에서 .env 파일 찾기
 */
export async function findEnvFile(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const envPath = path.join(currentDir, '.env');
    if (await fs.pathExists(envPath)) {
      return envPath;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * API 키를 찾을 수 있는 모든 위치 반환
 * 우선순위:
 * 1. 지정된 소스 경로
 * 2. 상위 디렉토리 탐색 (현재 → 루트)
 * 3. 홈 디렉토리 ~/.env
 * 4. ~/.taskmaster/.env
 */
export function getSearchPaths(sourcePath?: string): string[] {
  const searchPaths: string[] = [];
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';

  // 1. 명시적으로 지정된 소스 경로
  if (sourcePath) {
    searchPaths.push(path.join(sourcePath, '.env'));
  }

  // 2. 현재 디렉토리부터 상위로 탐색
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;
  while (currentDir !== root) {
    const envPath = path.join(currentDir, '.env');
    if (!searchPaths.includes(envPath)) {
      searchPaths.push(envPath);
    }
    currentDir = path.dirname(currentDir);
  }

  // 3. 홈 디렉토리
  if (homeDir) {
    const homeEnv = path.join(homeDir, '.env');
    if (!searchPaths.includes(homeEnv)) {
      searchPaths.push(homeEnv);
    }

    // 4. ~/.taskmaster/.env
    const taskmasterEnv = path.join(homeDir, '.taskmaster', '.env');
    if (!searchPaths.includes(taskmasterEnv)) {
      searchPaths.push(taskmasterEnv);
    }
  }

  return searchPaths;
}

/**
 * 소스 경로에서 API 키 로드 (여러 위치 자동 탐색)
 */
export async function loadApiKeysFromSource(sourcePath?: string): Promise<{
  apiKeys: Partial<Record<Provider, string>>;
  loadedFrom: string | null;
}> {
  const searchPaths = getSearchPaths(sourcePath);

  // 각 경로 시도
  for (const envPath of searchPaths) {
    const apiKeys = await loadApiKeysFromEnvFile(envPath);
    if (Object.keys(apiKeys).length > 0) {
      return { apiKeys, loadedFrom: envPath };
    }
  }

  return { apiKeys: {}, loadedFrom: null };
}

/**
 * 기본 소스 .env 경로 (taskmaster-kit가 설치된 프로젝트)
 */
export function getDefaultSourceEnvPath(): string {
  // 이 패키지가 위치한 디렉토리의 상위 (프로젝트 루트)
  return path.join(process.cwd(), '..', '.env');
}
