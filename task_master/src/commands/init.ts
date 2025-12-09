/**
 * init 명령어 - Task Master AI 환경 초기화
 *
 * 핵심 기능: 상위 디렉토리나 홈 디렉토리에서 .env를 찾아 API 키 자동 적용
 */

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import type { InitOptions, Provider, ProjectType } from '../types/index.js';
import { MODEL_PRESETS } from '../types/index.js';
import { loadApiKeysFromSource, getSearchPaths } from '../utils/env-loader.js';
import {
  generateMcpConfigString,
  generateEnvFile,
  generateClaudeMd,
  generateTaskmasterConfigString,
} from '../templates/index.js';

/**
 * init 명령어 실행
 */
export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold.cyan('\n🚀 Task Master AI 환경 설정\n'));

  // 1. 기존 파일 확인
  const existingFiles = await checkExistingFiles(cwd);
  if (existingFiles.length > 0 && !options.force) {
    console.log(chalk.yellow('⚠️  다음 파일들이 이미 존재합니다:'));
    existingFiles.forEach((f) => console.log(chalk.gray(`   - ${f}`)));
    console.log(chalk.yellow('\n덮어쓰려면 --force 옵션을 사용하세요.'));
    return;
  }

  // 2. API 키 자동 탐색
  console.log(chalk.gray('🔍 API 키 탐색 중...'));

  const envResult = await loadApiKeysFromSource(options.source);
  let apiKeys: Partial<Record<Provider, string>> = {};

  if (envResult.loadedFrom && Object.keys(envResult.apiKeys).length > 0) {
    apiKeys = envResult.apiKeys;
    console.log(chalk.green(`   ✓ ${envResult.loadedFrom} 에서 API 키 발견`));

    // 발견된 키 목록 표시
    const providers = Object.keys(apiKeys);
    console.log(chalk.gray(`   ${providers.join(', ')}`));
  } else {
    console.log(chalk.yellow('   ⚠️  API 키를 찾을 수 없습니다.'));
    console.log(chalk.gray('\n   다음 위치에 .env 파일을 생성하세요:'));
    const searchPaths = getSearchPaths().slice(0, 3);
    searchPaths.forEach((p) => console.log(chalk.gray(`   - ${p}`)));
    console.log('');
  }

  // 3. 모델 프리셋
  const modelPreset = options.models || 'default';
  const models = MODEL_PRESETS[modelPreset] || MODEL_PRESETS.default;

  // 4. 디렉토리 생성
  console.log(chalk.gray('\n📁 설정 파일 생성 중...'));

  const taskmasterDir = path.join(cwd, '.taskmaster');
  await fs.ensureDir(path.join(taskmasterDir, 'tasks'));
  await fs.ensureDir(path.join(taskmasterDir, 'docs'));
  await fs.ensureDir(path.join(taskmasterDir, 'reports'));

  // 5. 프로젝트 정보 수집
  const projectName = options.name || path.basename(cwd);
  const projectType = options.type as ProjectType | undefined;
  const projectDescription = options.description;
  const techStack = options.tech ? options.tech.split(',').map((t) => t.trim()) : undefined;

  // 프로젝트 정보 표시
  if (projectType || projectDescription) {
    console.log(chalk.gray('\n📋 프로젝트 정보:'));
    if (projectName !== path.basename(cwd)) {
      console.log(chalk.gray(`   이름: ${projectName}`));
    }
    if (projectType) {
      console.log(chalk.gray(`   타입: ${projectType}`));
    }
    if (projectDescription) {
      console.log(chalk.gray(`   설명: ${projectDescription}`));
    }
    if (techStack && techStack.length > 0) {
      console.log(chalk.gray(`   기술: ${techStack.join(', ')}`));
    }
  }

  // 6. 파일 생성
  console.log(chalk.gray('\n📁 설정 파일 생성 중...'));

  // .mcp.json - Claude Code MCP 설정 (핵심!)
  const mcpContent = generateMcpConfigString({ apiKeys });
  await fs.writeFile(path.join(cwd, '.mcp.json'), mcpContent);
  console.log(chalk.green('   ✓ .mcp.json (Claude Code MCP 설정)'));

  // .env - CLI용
  const envContent = generateEnvFile({ apiKeys });
  await fs.writeFile(path.join(cwd, '.env'), envContent);
  console.log(chalk.green('   ✓ .env'));

  // CLAUDE.md - 프로젝트 커스터마이징 적용
  const claudeMdContent = generateClaudeMd({
    projectName,
    models,
    projectType,
    projectDescription,
    techStack,
  });
  await fs.writeFile(path.join(cwd, 'CLAUDE.md'), claudeMdContent);
  console.log(chalk.green('   ✓ CLAUDE.md'));

  // .taskmaster/config.json
  const taskmasterConfigContent = generateTaskmasterConfigString({
    projectName,
    models,
    responseLanguage: 'Korean',
  });
  await fs.writeFile(path.join(taskmasterDir, 'config.json'), taskmasterConfigContent);
  console.log(chalk.green('   ✓ .taskmaster/config.json'));

  // 6. .gitignore 업데이트
  await updateGitignore(cwd);
  console.log(chalk.green('   ✓ .gitignore'));

  // 7. 완료
  console.log(chalk.bold.green('\n✅ 설정 완료!\n'));

  if (Object.keys(apiKeys).length > 0) {
    console.log(chalk.cyan('Claude Code에서 MCP 사용 준비 완료'));
    console.log(chalk.gray('Claude Code를 재시작하면 task-master-ai MCP가 활성화됩니다.\n'));
  }
}

/**
 * 기존 파일 확인
 */
async function checkExistingFiles(cwd: string): Promise<string[]> {
  const filesToCheck = ['.mcp.json', '.env', 'CLAUDE.md', '.taskmaster'];
  const existing: string[] = [];

  for (const file of filesToCheck) {
    if (await fs.pathExists(path.join(cwd, file))) {
      existing.push(file);
    }
  }

  return existing;
}

/**
 * .gitignore 업데이트
 */
async function updateGitignore(cwd: string): Promise<void> {
  const gitignorePath = path.join(cwd, '.gitignore');
  const entriesToAdd = ['.env', '.mcp.json', 'node_modules/', '.DS_Store'];

  let content = '';
  if (await fs.pathExists(gitignorePath)) {
    content = await fs.readFile(gitignorePath, 'utf-8');
  }

  const lines = content.split('\n');
  const newEntries: string[] = [];

  for (const entry of entriesToAdd) {
    if (!lines.some((line) => line.trim() === entry)) {
      newEntries.push(entry);
    }
  }

  if (newEntries.length > 0) {
    const addition = '\n# Task Master AI\n' + newEntries.join('\n') + '\n';
    await fs.appendFile(gitignorePath, addition);
  }
}
