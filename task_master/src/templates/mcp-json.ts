/**
 * .mcp.json 템플릿 생성기
 */

import type { Provider, McpConfig } from '../types/index.js';

export interface McpTemplateOptions {
  apiKeys: Partial<Record<Provider, string>>;
}

/**
 * .mcp.json 설정 생성
 */
export function generateMcpConfig(options: McpTemplateOptions): McpConfig {
  const { apiKeys } = options;

  const env: Record<string, string> = {};

  // API 키 매핑
  if (apiKeys.anthropic) {
    env.ANTHROPIC_API_KEY = apiKeys.anthropic;
  }
  if (apiKeys.openai) {
    env.OPENAI_API_KEY = apiKeys.openai;
  }
  if (apiKeys.google) {
    env.GOOGLE_API_KEY = apiKeys.google;
  }
  if (apiKeys.perplexity) {
    env.PERPLEXITY_API_KEY = apiKeys.perplexity;
  }
  if (apiKeys.mistral) {
    env.MISTRAL_API_KEY = apiKeys.mistral;
  }
  if (apiKeys.xai) {
    env.XAI_API_KEY = apiKeys.xai;
  }
  if (apiKeys.openrouter) {
    env.OPENROUTER_API_KEY = apiKeys.openrouter;
  }

  return {
    mcpServers: {
      'task-master-ai': {
        type: 'stdio',
        command: 'npx',
        args: ['-y', 'task-master-ai'],
        env,
      },
    },
  };
}

/**
 * .mcp.json 문자열 생성
 */
export function generateMcpConfigString(options: McpTemplateOptions): string {
  const config = generateMcpConfig(options);
  return JSON.stringify(config, null, '\t');
}
