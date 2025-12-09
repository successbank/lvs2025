/**
 * config 명령어 - 전역 설정 및 자격증명 관리
 */

import chalk from 'chalk';
import type { ConfigOptions, Provider, ModelRole } from '../types/index.js';
import { isValidProvider, isValidModelRole } from '../utils/validators.js';
import { promptForApiKey, promptForModel } from '../utils/prompts.js';
import {
  loadGlobalCredentials,
  saveGlobalCredentials,
  maskApiKey,
  getGlobalConfigPath,
} from '../utils/credentials.js';

/**
 * config 명령어 실행
 */
export async function configCommand(options: ConfigOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n⚙️  Task Master 전역 설정 관리\n'));

  if (options.show) {
    await showConfig();
  } else if (options.setKey) {
    await setApiKey(options.setKey as string);
  } else if (options.setModel) {
    await setModel(options.setModel as string);
  } else {
    // 도움말 표시
    console.log(chalk.yellow('사용법:'));
    console.log(chalk.gray('  taskmaster-kit config --show'));
    console.log(chalk.gray('    현재 전역 설정 표시\n'));
    console.log(chalk.gray('  taskmaster-kit config --set-key <provider>'));
    console.log(chalk.gray('    API 키 설정 (anthropic, openai, google, perplexity)\n'));
    console.log(chalk.gray('  taskmaster-kit config --set-model <role>'));
    console.log(chalk.gray('    기본 모델 설정 (main, research, fallback)'));
  }
}

/**
 * 현재 설정 표시
 */
async function showConfig(): Promise<void> {
  const config = await loadGlobalCredentials();
  const configPath = getGlobalConfigPath();

  console.log(chalk.gray(`설정 파일: ${configPath}\n`));

  // API 키 상태
  console.log(chalk.bold('📋 API 키 상태:'));

  const providers: Provider[] = ['anthropic', 'openai', 'google', 'perplexity', 'mistral', 'xai', 'openrouter'];
  const providerNames: Record<Provider, string> = {
    anthropic: 'Anthropic (Claude)',
    openai: 'OpenAI (GPT)',
    google: 'Google (Gemini)',
    perplexity: 'Perplexity',
    mistral: 'Mistral',
    xai: 'xAI (Grok)',
    openrouter: 'OpenRouter',
  };

  for (const provider of providers) {
    const providerConfig = config.providers[provider];
    const hasKey = providerConfig?.apiKey && providerConfig.apiKey.length > 0;
    const status = hasKey ? chalk.green('✓ 설정됨') : chalk.gray('✗ 없음');
    const masked = hasKey ? chalk.gray(` (${maskApiKey(providerConfig!.apiKey)})`) : '';

    console.log(`  ${providerNames[provider].padEnd(20)} ${status}${masked}`);
  }

  // 기본 모델 설정
  console.log(chalk.bold('\n🤖 기본 모델 설정:'));
  console.log(`  Main:     ${chalk.cyan(config.defaults.main.provider)}/${chalk.white(config.defaults.main.model)}`);
  console.log(`  Research: ${chalk.cyan(config.defaults.research.provider)}/${chalk.white(config.defaults.research.model)}`);
  console.log(`  Fallback: ${chalk.cyan(config.defaults.fallback.provider)}/${chalk.white(config.defaults.fallback.model)}`);

  console.log('');
}

/**
 * API 키 설정
 */
async function setApiKey(providerInput: string): Promise<void> {
  if (!isValidProvider(providerInput)) {
    console.log(chalk.red(`❌ 알 수 없는 프로바이더: ${providerInput}`));
    console.log(chalk.gray('사용 가능한 프로바이더: anthropic, openai, google, perplexity, mistral, xai, openrouter'));
    return;
  }

  const provider = providerInput as Provider;
  const apiKey = await promptForApiKey(provider);

  if (!apiKey) {
    console.log(chalk.yellow('API 키 설정이 취소되었습니다.'));
    return;
  }

  // 설정 로드 및 업데이트
  const config = await loadGlobalCredentials();
  config.providers[provider] = { apiKey };

  // 저장
  await saveGlobalCredentials(config);

  console.log(chalk.green(`\n✅ ${provider} API 키가 저장되었습니다.`));
  console.log(chalk.gray(`   ${maskApiKey(apiKey)}`));
}

/**
 * 기본 모델 설정
 */
async function setModel(roleInput: string): Promise<void> {
  if (!isValidModelRole(roleInput)) {
    console.log(chalk.red(`❌ 알 수 없는 역할: ${roleInput}`));
    console.log(chalk.gray('사용 가능한 역할: main, research, fallback'));
    return;
  }

  const role = roleInput as ModelRole;
  const selection = await promptForModel(role);

  if (!selection) {
    console.log(chalk.yellow('모델 설정이 취소되었습니다.'));
    return;
  }

  // 설정 로드 및 업데이트
  const config = await loadGlobalCredentials();
  config.defaults[role] = selection;

  // 저장
  await saveGlobalCredentials(config);

  console.log(chalk.green(`\n✅ ${role} 모델이 설정되었습니다.`));
  console.log(chalk.gray(`   ${selection.provider}/${selection.model}`));
}
