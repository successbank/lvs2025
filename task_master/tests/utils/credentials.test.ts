/**
 * credentials.ts 단위 테스트
 */

import { encrypt, decrypt, maskApiKey, getDefaultGlobalConfig } from '../../src/utils/credentials.js';

describe('Credentials Utility', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const originalText = 'sk-ant-api03-test-key-12345';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should produce different encrypted outputs for same input (random IV)', () => {
      const text = 'test-api-key';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const text = 'sk-ant-api03-!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(text);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(text);
    });

    it('should handle unicode characters', () => {
      const text = '한글테스트-api-key-🔑';
      const encrypted = encrypt(text);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(text);
    });

    it('should throw error for invalid encrypted format', () => {
      expect(() => decrypt('invalid-format')).toThrow();
    });
  });

  describe('maskApiKey', () => {
    it('should mask API key correctly', () => {
      const key = 'sk-ant-api03-oKAI7Duv2FxF5KmBhV1g';
      const masked = maskApiKey(key);

      expect(masked.startsWith('sk-ant-')).toBe(true);
      expect(masked.includes('*')).toBe(true);
      // Last 4 chars should be visible
      expect(masked.endsWith(key.slice(-4))).toBe(true);
    });

    it('should handle short keys', () => {
      const key = 'short';
      const masked = maskApiKey(key);

      expect(masked).toBe('****');
    });

    it('should handle empty key', () => {
      const masked = maskApiKey('');

      expect(masked).toBe('****');
    });
  });

  describe('getDefaultGlobalConfig', () => {
    it('should return valid default config', () => {
      const config = getDefaultGlobalConfig();

      expect(config.version).toBe('1.0');
      expect(config.providers).toEqual({});
      expect(config.defaults.main).toBeDefined();
      expect(config.defaults.research).toBeDefined();
      expect(config.defaults.fallback).toBeDefined();
    });

    it('should have correct default models', () => {
      const config = getDefaultGlobalConfig();

      expect(config.defaults.main.provider).toBe('google');
      expect(config.defaults.main.model).toBe('gemini-3-pro-preview');
      expect(config.defaults.research.provider).toBe('perplexity');
      expect(config.defaults.fallback.provider).toBe('openai');
    });
  });
});
