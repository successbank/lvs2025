/**
 * 타입 및 상수 테스트
 */

import { MODEL_PRESETS, API_KEY_PATTERNS } from '../../src/types/index.js';

describe('Types and Constants', () => {
  describe('MODEL_PRESETS', () => {
    it('should have default preset', () => {
      expect(MODEL_PRESETS.default).toBeDefined();
      expect(MODEL_PRESETS.default.main).toBeDefined();
      expect(MODEL_PRESETS.default.research).toBeDefined();
      expect(MODEL_PRESETS.default.fallback).toBeDefined();
    });

    it('should have performance preset', () => {
      expect(MODEL_PRESETS.performance).toBeDefined();
      expect(MODEL_PRESETS.performance.main.provider).toBe('anthropic');
    });

    it('should have economy preset', () => {
      expect(MODEL_PRESETS.economy).toBeDefined();
      expect(MODEL_PRESETS.economy.main.model).toContain('flash');
    });

    it('default preset should use google for main', () => {
      expect(MODEL_PRESETS.default.main.provider).toBe('google');
      expect(MODEL_PRESETS.default.main.model).toBe('gemini-3-pro-preview');
    });

    it('default preset should use perplexity for research', () => {
      expect(MODEL_PRESETS.default.research.provider).toBe('perplexity');
    });

    it('default preset should use openai for fallback', () => {
      expect(MODEL_PRESETS.default.fallback.provider).toBe('openai');
    });
  });

  describe('API_KEY_PATTERNS', () => {
    it('should have patterns for all major providers', () => {
      expect(API_KEY_PATTERNS.anthropic).toBeDefined();
      expect(API_KEY_PATTERNS.openai).toBeDefined();
      expect(API_KEY_PATTERNS.google).toBeDefined();
      expect(API_KEY_PATTERNS.perplexity).toBeDefined();
    });

    it('anthropic pattern should match valid keys', () => {
      expect(API_KEY_PATTERNS.anthropic.test('sk-ant-api03-valid123')).toBe(true);
      expect(API_KEY_PATTERNS.anthropic.test('invalid')).toBe(false);
    });

    it('openai pattern should match valid keys', () => {
      expect(API_KEY_PATTERNS.openai.test('sk-proj-valid123')).toBe(true);
      expect(API_KEY_PATTERNS.openai.test('sk-valid123')).toBe(true);
    });

    it('google pattern should match valid keys', () => {
      expect(API_KEY_PATTERNS.google.test('AIzaSyA4rF4xdM5wug')).toBe(true);
      expect(API_KEY_PATTERNS.google.test('invalid')).toBe(false);
    });

    it('perplexity pattern should match valid keys', () => {
      expect(API_KEY_PATTERNS.perplexity.test('pplx-abc123')).toBe(true);
      expect(API_KEY_PATTERNS.perplexity.test('invalid')).toBe(false);
    });
  });
});
