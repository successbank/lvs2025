/**
 * 템플릿 모듈 통합 export
 */

export { generateMcpConfig, generateMcpConfigString } from './mcp-json.js';
export type { McpTemplateOptions } from './mcp-json.js';

export { generateEnvFile } from './env.js';
export type { EnvTemplateOptions } from './env.js';

export { generateClaudeMd } from './claude-md.js';
export type { ClaudeMdOptions } from './claude-md.js';

export { generateTaskmasterConfig, generateTaskmasterConfigString } from './taskmaster-config.js';
export type { TaskmasterConfigOptions } from './taskmaster-config.js';
