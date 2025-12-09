/**
 * validators.ts 단위 테스트
 */

import {
  validateApiKey,
  validateApiKeyWithMessage,
  isValidProvider,
  isValidModelRole,
  validateProjectName,
} from '../../src/utils/validators.js';

describe('Validators Utility', () => {
  describe('validateApiKey', () => {
    it('should validate Anthropic API key format', () => {
      expect(validateApiKey('anthropic', 'sk-ant-api03-validkey123')).toBe(true);
      expect(validateApiKey('anthropic', 'sk-ant-invalid')).toBe(true);
      expect(validateApiKey('anthropic', 'invalid-key')).toBe(false);
    });

    it('should validate OpenAI API key format', () => {
      expect(validateApiKey('openai', 'sk-proj-abc123xyz')).toBe(true);
      expect(validateApiKey('openai', 'sk-abc123')).toBe(true);
      expect(validateApiKey('openai', 'invalid')).toBe(false);
    });

    it('should validate Google API key format', () => {
      expect(validateApiKey('google', 'AIzaSyA4rF4xdM5wugONu3V5t9HkqeHRCrWg4vg')).toBe(true);
      expect(validateApiKey('google', 'AIza123456789')).toBe(true);
      expect(validateApiKey('google', 'invalid-google-key')).toBe(false);
    });

    it('should validate Perplexity API key format', () => {
      expect(validateApiKey('perplexity', 'pplx-abc123xyz456')).toBe(true);
      expect(validateApiKey('perplexity', 'invalid')).toBe(false);
    });

    it('should return false for empty or null keys', () => {
      expect(validateApiKey('anthropic', '')).toBe(false);
      expect(validateApiKey('openai', null as unknown as string)).toBe(false);
    });
  });

  describe('validateApiKeyWithMessage', () => {
    it('should return true for valid keys', () => {
      expect(validateApiKeyWithMessage('anthropic', 'sk-ant-valid-key')).toBe(true);
    });

    it('should return error message for empty keys', () => {
      const result = validateApiKeyWithMessage('anthropic', '');
      expect(typeof result).toBe('string');
      expect(result).toContain('비어있거나');
    });

    it('should return error message for invalid format', () => {
      const result = validateApiKeyWithMessage('anthropic', 'invalid');
      expect(typeof result).toBe('string');
      expect(result).toContain('잘못된');
    });
  });

  describe('isValidProvider', () => {
    it('should return true for valid providers', () => {
      expect(isValidProvider('anthropic')).toBe(true);
      expect(isValidProvider('openai')).toBe(true);
      expect(isValidProvider('google')).toBe(true);
      expect(isValidProvider('perplexity')).toBe(true);
      expect(isValidProvider('mistral')).toBe(true);
      expect(isValidProvider('xai')).toBe(true);
      expect(isValidProvider('openrouter')).toBe(true);
    });

    it('should return false for invalid providers', () => {
      expect(isValidProvider('invalid')).toBe(false);
      expect(isValidProvider('')).toBe(false);
      expect(isValidProvider('ANTHROPIC')).toBe(false); // Case sensitive
    });
  });

  describe('isValidModelRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidModelRole('main')).toBe(true);
      expect(isValidModelRole('research')).toBe(true);
      expect(isValidModelRole('fallback')).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(isValidModelRole('invalid')).toBe(false);
      expect(isValidModelRole('')).toBe(false);
      expect(isValidModelRole('MAIN')).toBe(false); // Case sensitive
    });
  });

  describe('validateProjectName', () => {
    it('should return true for valid project names', () => {
      expect(validateProjectName('my-project')).toBe(true);
      expect(validateProjectName('my_project')).toBe(true);
      expect(validateProjectName('myProject123')).toBe(true);
    });

    it('should return error for empty names', () => {
      const result = validateProjectName('');
      expect(typeof result).toBe('string');
      expect(result).toContain('입력');
    });

    it('should return error for invalid characters', () => {
      const result = validateProjectName('my project!');
      expect(typeof result).toBe('string');
      expect(result).toContain('영문');
    });

    it('should return error for too long names', () => {
      const result = validateProjectName('a'.repeat(51));
      expect(typeof result).toBe('string');
      expect(result).toContain('50자');
    });
  });
});
