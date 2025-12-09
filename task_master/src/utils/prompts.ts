/**
 * 대화형 프롬프트 유틸리티
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import type { Provider, ModelRole, GlobalConfig } from '../types/index.js';
import { MODEL_PRESETS } from '../types/index.js';
import { validateApiKeyWithMessage, isValidProvider } from './validators.js';
import { loadGlobalCredentials } from './credentials.js';

// 프로바이더 표시 이름
const PROVIDER_NAMES: Record<Provider, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI (GPT)',
  google: 'Google (Gemini)',
  perplexity: 'Perplexity',
  mistral: 'Mistral',
  xai: 'xAI (Grok)',
  openrouter: 'OpenRouter',
};

// 필수 프로바이더 (최소 하나는 필요)
const REQUIRED_PROVIDERS: Provider[] = ['anthropic', 'openai', 'google', 'perplexity'];

export interface InitPromptResult {
  useGlobalKeys: boolean;
  apiKeys: Partial<Record<Provider, string>>;
  modelPreset: string;
  saveToGlobal: boolean;
  projectName: string;
}

/**
 * init 명령어용 대화형 프롬프트
 */
export async function promptForInit(skipPrompts: boolean = false): Promise<InitPromptResult> {
  // 비대화형 모드
  if (skipPrompts) {
    const globalConfig = await loadGlobalCredentials();
    return {
      useGlobalKeys: true,
      apiKeys: Object.fromEntries(
        Object.entries(globalConfig.providers).map(([k, v]) => [k, v?.apiKey])
      ) as Partial<Record<Provider, string>>,
      modelPreset: 'default',
      saveToGlobal: false,
      projectName: 'my-project',
    };
  }

  console.log(chalk.bold('\n📋 Task Master AI 설정을 시작합니다.\n'));

  // 1. 전역 키 사용 여부
  const globalConfig = await loadGlobalCredentials();
  const hasGlobalKeys = Object.keys(globalConfig.providers).length > 0;

  let useGlobalKeys = false;
  if (hasGlobalKeys) {
    const { useGlobal } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useGlobal',
        message: '저장된 전역 API 키를 사용하시겠습니까?',
        default: true,
      },
    ]);
    useGlobalKeys = useGlobal;
  }

  // 2. API 키 수집
  const apiKeys: Partial<Record<Provider, string>> = {};

  if (useGlobalKeys) {
    // 전역 키 사용
    for (const [provider, config] of Object.entries(globalConfig.providers)) {
      if (config?.apiKey) {
        apiKeys[provider as Provider] = config.apiKey;
      }
    }
  } else {
    // 새로운 키 입력
    console.log(chalk.yellow('\n💡 필요한 프로바이더의 API 키만 입력하세요. (스킵하려면 Enter)\n'));

    for (const provider of REQUIRED_PROVIDERS) {
      const existingKey = globalConfig.providers[provider]?.apiKey || '';
      const masked = existingKey ? ` (기존: ${existingKey.substring(0, 7)}...)` : '';

      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: `${PROVIDER_NAMES[provider]} API Key${masked}:`,
          mask: '*',
          validate: (input: string) => {
            if (!input || input.trim() === '') return true; // 빈 값 허용 (스킵)
            return validateApiKeyWithMessage(provider, input);
          },
        },
      ]);

      if (apiKey && apiKey.trim() !== '') {
        apiKeys[provider] = apiKey;
      } else if (existingKey) {
        apiKeys[provider] = existingKey;
      }
    }
  }

  // 3. 모델 프리셋 선택
  const { modelPreset } = await inquirer.prompt([
    {
      type: 'list',
      name: 'modelPreset',
      message: '모델 프리셋을 선택하세요:',
      choices: [
        {
          name: '기본 (Gemini 3 Pro + Perplexity + GPT-4o)',
          value: 'default',
        },
        {
          name: '고성능 (Claude Opus 4.5 + Deep Research + Gemini)',
          value: 'performance',
        },
        {
          name: '경제적 (Gemini Flash + Sonar + GPT-4o Mini)',
          value: 'economy',
        },
      ],
      default: 'default',
    },
  ]);

  // 4. 프로젝트 이름
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '프로젝트 이름:',
      default: 'my-project',
      validate: (input: string) => {
        if (!input || input.trim() === '') return '프로젝트 이름을 입력해주세요';
        return true;
      },
    },
  ]);

  // 5. 전역 저장 여부
  let saveToGlobal = false;
  if (!useGlobalKeys && Object.keys(apiKeys).length > 0) {
    const { save } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'save',
        message: '입력한 API 키를 전역으로 저장하시겠습니까?',
        default: true,
      },
    ]);
    saveToGlobal = save;
  }

  return {
    useGlobalKeys,
    apiKeys,
    modelPreset,
    saveToGlobal,
    projectName,
  };
}

/**
 * API 키 입력 프롬프트 (단일)
 */
export async function promptForApiKey(provider: Provider): Promise<string | null> {
  if (!isValidProvider(provider)) {
    console.error(chalk.red(`알 수 없는 프로바이더: ${provider}`));
    return null;
  }

  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: `${PROVIDER_NAMES[provider]} API Key:`,
      mask: '*',
      validate: (input: string) => validateApiKeyWithMessage(provider, input),
    },
  ]);

  return apiKey || null;
}

/**
 * 모델 선택 프롬프트
 */
export async function promptForModel(role: ModelRole): Promise<{ provider: Provider; model: string } | null> {
  const roleNames: Record<ModelRole, string> = {
    main: '메인 모델',
    research: '리서치 모델',
    fallback: '폴백 모델',
  };

  const choices = [
    { name: 'Gemini 3 Pro Preview', value: { provider: 'google' as Provider, model: 'gemini-3-pro-preview' } },
    { name: 'Claude Sonnet 4.5', value: { provider: 'anthropic' as Provider, model: 'claude-sonnet-4-5' } },
    { name: 'Claude Opus 4.5', value: { provider: 'anthropic' as Provider, model: 'claude-opus-4-5' } },
    { name: 'GPT-4o', value: { provider: 'openai' as Provider, model: 'gpt-4o' } },
    { name: 'Perplexity Sonar Pro', value: { provider: 'perplexity' as Provider, model: 'sonar-pro' } },
  ];

  const { selection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: `${roleNames[role]}을 선택하세요:`,
      choices,
    },
  ]);

  return selection;
}
