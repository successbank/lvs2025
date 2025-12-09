#!/usr/bin/env node
/**
 * @successbank/taskmaster-kit
 * Task Master AI 빠른 설정 도구
 *
 * 다른 서버/프로젝트에서 Task Master AI 환경을 단일 명령어로 즉시 구성
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';

const program = new Command();

// 패키지 정보
program
  .name('taskmaster-kit')
  .description(chalk.cyan('Task Master AI 빠른 설정 도구') + '\n  다른 서버/프로젝트에서 Task Master AI 환경을 단일 명령어로 즉시 구성')
  .version('1.0.0');

// init 명령어
program
  .command('init')
  .description('현재 프로젝트에 Task Master AI MCP 설정 (API 키 자동 탐색)')
  .option('-f, --force', '기존 설정 덮어쓰기')
  .option('-m, --models <preset>', '모델 프리셋 (default, performance, economy)', 'default')
  .option('--source <path>', 'API 키를 찾을 .env 경로 (생략시 자동 탐색)')
  // 프로젝트 커스터마이징 옵션
  .option('-n, --name <name>', '프로젝트 이름')
  .option('-t, --type <type>', '프로젝트 타입 (backend, frontend, fullstack, api, cli, library, mobile, devops, data, custom)')
  .option('-d, --description <desc>', '프로젝트 설명')
  .option('--tech <stack>', '기술 스택 (쉼표 구분, 예: "Node.js,TypeScript,PostgreSQL")')
  .action(initCommand);

// 파싱 및 실행
program.parse();

// 명령어 없이 실행 시 도움말 표시
if (!process.argv.slice(2).length) {
  console.log(chalk.bold.cyan('\n  🚀 Task Master AI Setup Kit\n'));
  program.outputHelp();
}
