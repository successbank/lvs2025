/**
 * 템플릿 생성기 단위 테스트
 */

import {
  generateMcpConfig,
  generateMcpConfigString,
  generateEnvFile,
  generateClaudeMd,
  generateTaskmasterConfig,
} from '../../src/templates/index.js';

describe('Template Generators', () => {
  const mockApiKeys = {
    anthropic: 'sk-ant-test-key',
    openai: 'sk-proj-test-key',
    google: 'AIzaTestKey123',
    perplexity: 'pplx-test-key',
  };

  const mockModels = {
    main: { provider: 'google' as const, model: 'gemini-3-pro-preview' },
    research: { provider: 'perplexity' as const, model: 'sonar-pro' },
    fallback: { provider: 'openai' as const, model: 'gpt-4o' },
  };

  describe('generateMcpConfig', () => {
    it('should generate valid MCP config object', () => {
      const config = generateMcpConfig({ apiKeys: mockApiKeys });

      expect(config.mcpServers).toBeDefined();
      expect(config.mcpServers['task-master-ai']).toBeDefined();
      expect(config.mcpServers['task-master-ai'].command).toBe('npx');
      expect(config.mcpServers['task-master-ai'].args).toContain('task-master-ai');
    });

    it('should include provided API keys in env', () => {
      const config = generateMcpConfig({ apiKeys: mockApiKeys });
      const env = config.mcpServers['task-master-ai'].env;

      expect(env.ANTHROPIC_API_KEY).toBe(mockApiKeys.anthropic);
      expect(env.OPENAI_API_KEY).toBe(mockApiKeys.openai);
      expect(env.GOOGLE_API_KEY).toBe(mockApiKeys.google);
      expect(env.PERPLEXITY_API_KEY).toBe(mockApiKeys.perplexity);
    });

    it('should not include undefined API keys', () => {
      const config = generateMcpConfig({ apiKeys: { anthropic: 'sk-ant-only' } });
      const env = config.mcpServers['task-master-ai'].env;

      expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-only');
      expect(env.OPENAI_API_KEY).toBeUndefined();
    });

    it('should generate valid JSON string', () => {
      const jsonString = generateMcpConfigString({ apiKeys: mockApiKeys });

      expect(() => JSON.parse(jsonString)).not.toThrow();

      const parsed = JSON.parse(jsonString);
      expect(parsed.mcpServers['task-master-ai']).toBeDefined();
    });
  });

  describe('generateEnvFile', () => {
    it('should generate .env content with provided keys', () => {
      const content = generateEnvFile({ apiKeys: mockApiKeys });

      expect(content).toContain('ANTHROPIC_API_KEY="sk-ant-test-key"');
      expect(content).toContain('OPENAI_API_KEY="sk-proj-test-key"');
      expect(content).toContain('GOOGLE_API_KEY="AIzaTestKey123"');
      expect(content).toContain('PERPLEXITY_API_KEY="pplx-test-key"');
    });

    it('should comment out missing keys', () => {
      const content = generateEnvFile({ apiKeys: { anthropic: 'sk-ant-only' } });

      expect(content).toContain('ANTHROPIC_API_KEY="sk-ant-only"');
      expect(content).toContain('# OPENAI_API_KEY=');
      expect(content).toContain('# GOOGLE_API_KEY=');
    });

    it('should include header comments', () => {
      const content = generateEnvFile({ apiKeys: {} });

      expect(content).toContain('Task Master AI');
      expect(content).toContain('taskmaster-kit');
    });
  });

  describe('generateClaudeMd', () => {
    it('should generate CLAUDE.md with project name', () => {
      const content = generateClaudeMd({
        projectName: 'test-project',
        models: mockModels,
      });

      expect(content).toContain('test-project');
      expect(content).toContain('Task Master AI');
    });

    it('should include model configuration', () => {
      const content = generateClaudeMd({
        projectName: 'test',
        models: mockModels,
      });

      expect(content).toContain('google');
      expect(content).toContain('gemini-3-pro-preview');
      expect(content).toContain('perplexity');
      expect(content).toContain('sonar-pro');
    });

    it('should include project type and conventions', () => {
      const content = generateClaudeMd({
        projectName: 'test',
        models: mockModels,
        projectType: 'backend',
        projectDescription: 'Test API',
      });

      expect(content).toContain('backend');
      expect(content).toContain('Test API');
      expect(content).toContain('에러 핸들링');
    });

    it('should include custom tech stack', () => {
      const content = generateClaudeMd({
        projectName: 'test',
        models: mockModels,
        techStack: ['Node.js', 'PostgreSQL'],
      });

      expect(content).toContain('Node.js');
      expect(content).toContain('PostgreSQL');
    });

    it('should include quick commands', () => {
      const content = generateClaudeMd({
        projectName: 'test',
        models: mockModels,
      });

      expect(content).toContain('task-master list');
      expect(content).toContain('task-master next');
    });
  });

  describe('generateTaskmasterConfig', () => {
    it('should generate valid config object', () => {
      const config = generateTaskmasterConfig({
        projectName: 'test-project',
        models: mockModels,
      });

      expect(config.models).toBeDefined();
      expect(config.global).toBeDefined();
      expect(config.global.projectName).toBe('test-project');
    });

    it('should set correct model configuration', () => {
      const config = generateTaskmasterConfig({
        projectName: 'test',
        models: mockModels,
      });

      expect(config.models.main.provider).toBe('google');
      expect(config.models.main.model).toBe('gemini-3-pro-preview');
      expect(config.models.main.maxTokens).toBeDefined();
    });

    it('should use provided response language', () => {
      const config = generateTaskmasterConfig({
        projectName: 'test',
        models: mockModels,
        responseLanguage: 'English',
      });

      expect(config.global.responseLanguage).toBe('English');
    });

    it('should default to Korean', () => {
      const config = generateTaskmasterConfig({
        projectName: 'test',
        models: mockModels,
      });

      expect(config.global.responseLanguage).toBe('Korean');
    });
  });
});
