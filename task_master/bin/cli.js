#!/usr/bin/env node

/**
 * @successbank/taskmaster-kit CLI
 * Task Master AI 빠른 설정 도구
 */

import('../dist/index.js').catch((err) => {
  console.error('Error loading CLI:', err.message);
  process.exit(1);
});
