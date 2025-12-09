/**
 * .taskmaster/config.json 템플릿 생성기
 */

import type { ModelRole, ModelConfig, ProjectConfig } from '../types/index.js';

export interface TaskmasterConfigOptions {
  projectName: string;
  models: Record<ModelRole, ModelConfig>;
  responseLanguage?: string;
}

/**
 * .taskmaster/config.json 설정 생성
 */
export function generateTaskmasterConfig(options: TaskmasterConfigOptions): ProjectConfig {
  const { projectName, models, responseLanguage = 'Korean' } = options;

  return {
    models: {
      main: {
        provider: models.main.provider,
        model: models.main.model,
        maxTokens: 65536,
        temperature: 0.2,
      },
      research: {
        provider: models.research.provider,
        model: models.research.model,
        maxTokens: 8700,
        temperature: 0.1,
      },
      fallback: {
        provider: models.fallback.provider,
        model: models.fallback.model,
        maxTokens: 16384,
        temperature: 0.2,
      },
    },
    global: {
      projectName,
      responseLanguage,
      logLevel: 'info',
      debug: false,
      defaultNumTasks: 10,
      defaultSubtasks: 5,
      defaultPriority: 'medium',
      enableCodebaseAnalysis: true,
      enableProxy: false,
      anonymousTelemetry: true,
      defaultTag: 'master',
    },
  };
}

/**
 * .taskmaster/config.json 문자열 생성
 */
export function generateTaskmasterConfigString(options: TaskmasterConfigOptions): string {
  const config = generateTaskmasterConfig(options);
  return JSON.stringify(config, null, 2);
}
