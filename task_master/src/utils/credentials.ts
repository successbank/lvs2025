/**
 * 자격증명 관리 유틸리티
 * - AES-256 암호화/복호화
 * - 전역 설정 파일 관리
 */

import crypto from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import type { GlobalConfig, Provider } from '../types/index.js';

// 암호화 설정
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

// 기기별 고유 키 생성 (실제 구현에서는 더 안전한 방식 필요)
function getEncryptionKey(): Buffer {
  const machineId = os.hostname() + os.userInfo().username;
  return crypto.scryptSync(machineId, 'taskmaster-kit-salt', KEY_LENGTH);
}

/**
 * 텍스트 암호화
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // IV와 암호화된 데이터를 연결
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 텍스트 복호화
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');

  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * 전역 설정 디렉토리 경로
 */
export function getGlobalConfigDir(): string {
  return path.join(os.homedir(), '.taskmaster');
}

/**
 * 전역 설정 파일 경로
 */
export function getGlobalConfigPath(): string {
  return path.join(getGlobalConfigDir(), 'credentials.json');
}

/**
 * 기본 전역 설정 생성
 */
export function getDefaultGlobalConfig(): GlobalConfig {
  return {
    version: '1.0',
    providers: {},
    defaults: {
      main: { provider: 'google', model: 'gemini-3-pro-preview' },
      research: { provider: 'perplexity', model: 'sonar-pro' },
      fallback: { provider: 'openai', model: 'gpt-4o' },
    },
  };
}

/**
 * 전역 설정 로드
 */
export async function loadGlobalCredentials(): Promise<GlobalConfig> {
  const configPath = getGlobalConfigPath();

  try {
    if (await fs.pathExists(configPath)) {
      const data = await fs.readJson(configPath);

      // API 키 복호화
      const config: GlobalConfig = {
        ...data,
        providers: {},
      };

      for (const [provider, providerConfig] of Object.entries(data.providers || {})) {
        const pc = providerConfig as { apiKey: string; encrypted?: boolean };
        if (pc.encrypted && pc.apiKey) {
          config.providers[provider as Provider] = {
            apiKey: decrypt(pc.apiKey),
            encrypted: false,
          };
        } else {
          config.providers[provider as Provider] = pc;
        }
      }

      return config;
    }
  } catch (error) {
    console.warn('전역 설정 로드 실패, 기본값 사용:', (error as Error).message);
  }

  return getDefaultGlobalConfig();
}

/**
 * 전역 설정 저장 (API 키 암호화)
 */
export async function saveGlobalCredentials(config: GlobalConfig): Promise<void> {
  const configDir = getGlobalConfigDir();
  const configPath = getGlobalConfigPath();

  // 디렉토리 생성
  await fs.ensureDir(configDir);

  // API 키 암호화
  const encryptedConfig: GlobalConfig = {
    ...config,
    providers: {},
  };

  for (const [provider, providerConfig] of Object.entries(config.providers)) {
    if (providerConfig && providerConfig.apiKey) {
      encryptedConfig.providers[provider as Provider] = {
        apiKey: encrypt(providerConfig.apiKey),
        encrypted: true,
      };
    }
  }

  // 파일 저장
  await fs.writeJson(configPath, encryptedConfig, { spaces: 2 });

  // 파일 권한 설정 (소유자만 읽기/쓰기)
  await fs.chmod(configPath, 0o600);
}

/**
 * API 키 마스킹 (표시용)
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 10) return '****';
  return key.substring(0, 7) + '*'.repeat(Math.min(key.length - 7, 20)) + key.slice(-4);
}
