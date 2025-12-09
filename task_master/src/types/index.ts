/**
 * 타입 정의
 */

// API 키 프로바이더
export type Provider = 'anthropic' | 'openai' | 'google' | 'perplexity' | 'mistral' | 'xai' | 'openrouter';

// 모델 역할
export type ModelRole = 'main' | 'research' | 'fallback';

// API 키 설정
export interface ProviderConfig {
  apiKey: string;
  encrypted?: boolean;
}

// 모델 설정
export interface ModelConfig {
  provider: Provider;
  model: string;
}

// 전역 설정 구조
export interface GlobalConfig {
  version: string;
  providers: Partial<Record<Provider, ProviderConfig>>;
  defaults: Record<ModelRole, ModelConfig>;
}

// 프로젝트 설정
export interface ProjectConfig {
  models: {
    main: ModelConfig & { maxTokens?: number; temperature?: number };
    research: ModelConfig & { maxTokens?: number; temperature?: number };
    fallback: ModelConfig & { maxTokens?: number; temperature?: number };
  };
  global: {
    projectName: string;
    responseLanguage: string;
    [key: string]: unknown;
  };
}

// MCP 서버 설정
export interface McpServerConfig {
  type?: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface McpConfig {
  mcpServers: {
    'task-master-ai': McpServerConfig;
    [key: string]: McpServerConfig;
  };
}

// Init 명령어 옵션
export interface InitOptions {
  useGlobalKeys?: boolean;
  skipPrompts?: boolean;
  models?: 'default' | 'performance' | 'economy';
  force?: boolean;
  source?: string; // .env 파일을 찾을 소스 경로
  // 프로젝트 커스터마이징 옵션
  name?: string; // 프로젝트 이름
  type?: ProjectType; // 프로젝트 타입
  description?: string; // 프로젝트 설명
  tech?: string; // 기술 스택 (쉼표 구분)
}

// Config 명령어 옵션
export interface ConfigOptions {
  setKey?: Provider;
  setModel?: ModelRole;
  show?: boolean;
}

// 모델 프리셋
export const MODEL_PRESETS: Record<string, Record<ModelRole, ModelConfig>> = {
  default: {
    main: { provider: 'google', model: 'gemini-3-pro-preview' },
    research: { provider: 'perplexity', model: 'sonar-pro' },
    fallback: { provider: 'openai', model: 'gpt-4o' },
  },
  performance: {
    main: { provider: 'anthropic', model: 'claude-opus-4-5' },
    research: { provider: 'perplexity', model: 'sonar-deep-research' },
    fallback: { provider: 'google', model: 'gemini-3-pro-preview' },
  },
  economy: {
    main: { provider: 'google', model: 'gemini-2.0-flash' },
    research: { provider: 'perplexity', model: 'sonar' },
    fallback: { provider: 'openai', model: 'gpt-4o-mini' },
  },
};

// API 키 포맷 검증 패턴
export const API_KEY_PATTERNS: Record<Provider, RegExp> = {
  anthropic: /^sk-ant-[a-zA-Z0-9_-]+$/,
  openai: /^sk-(proj-)?[a-zA-Z0-9_-]+$/,
  google: /^AIza[a-zA-Z0-9_-]+$/,
  perplexity: /^pplx-[a-zA-Z0-9]+$/,
  mistral: /^[a-zA-Z0-9]+$/,
  xai: /^xai-[a-zA-Z0-9]+$/,
  openrouter: /^sk-or-[a-zA-Z0-9_-]+$/,
};

// 프로젝트 타입
export type ProjectType = 'backend' | 'frontend' | 'fullstack' | 'api' | 'cli' | 'library' | 'mobile' | 'devops' | 'data' | 'custom';

// 프로젝트 타입별 기본 설정
export const PROJECT_TYPE_CONFIGS: Record<ProjectType, {
  description: string;
  techStack: string[];
  conventions: string[];
}> = {
  backend: {
    description: 'Backend API 서버 프로젝트',
    techStack: ['Node.js', 'Express/Fastify', 'Database', 'REST/GraphQL'],
    conventions: [
      '모든 API는 에러 핸들링을 포함해야 함',
      '데이터베이스 쿼리는 트랜잭션 사용 권장',
      'API 응답은 일관된 포맷 유지',
      '환경변수로 설정 관리',
    ],
  },
  frontend: {
    description: 'Frontend 웹 애플리케이션',
    techStack: ['React/Vue/Svelte', 'TypeScript', 'CSS/Tailwind', 'State Management'],
    conventions: [
      '컴포넌트는 재사용 가능하게 설계',
      '상태 관리는 최소화',
      '접근성(a11y) 고려',
      '반응형 디자인 적용',
    ],
  },
  fullstack: {
    description: 'Fullstack 웹 애플리케이션',
    techStack: ['Next.js/Nuxt/SvelteKit', 'TypeScript', 'Database', 'API'],
    conventions: [
      '서버/클라이언트 코드 명확히 분리',
      'API 라우트는 /api 하위에 구성',
      '공통 타입은 shared 디렉토리에',
      'SSR/SSG 적절히 활용',
    ],
  },
  api: {
    description: 'REST/GraphQL API 서비스',
    techStack: ['API Framework', 'OpenAPI/GraphQL Schema', 'Authentication', 'Rate Limiting'],
    conventions: [
      'API 버저닝 적용 (/v1, /v2)',
      'OpenAPI/Swagger 문서화',
      '인증/인가 미들웨어 사용',
      '요청/응답 로깅',
    ],
  },
  cli: {
    description: 'CLI 도구',
    techStack: ['Node.js/Python/Go', 'Commander/Click/Cobra', 'Terminal UI'],
    conventions: [
      '명확한 --help 메시지',
      '종료 코드 올바르게 사용',
      '진행 상황 표시',
      '설정 파일 지원',
    ],
  },
  library: {
    description: '라이브러리/패키지',
    techStack: ['TypeScript/JavaScript', 'Build Tools', 'Documentation'],
    conventions: [
      'API는 안정적이고 하위 호환',
      '타입 정의 포함',
      'README에 사용법 명시',
      '테스트 커버리지 유지',
    ],
  },
  mobile: {
    description: '모바일 애플리케이션',
    techStack: ['React Native/Flutter', 'Mobile UI', 'Native APIs'],
    conventions: [
      '플랫폼별 가이드라인 준수',
      '오프라인 지원 고려',
      '배터리 효율 고려',
      '다양한 화면 크기 지원',
    ],
  },
  devops: {
    description: 'DevOps/인프라 프로젝트',
    techStack: ['Docker', 'Kubernetes', 'Terraform/Ansible', 'CI/CD'],
    conventions: [
      'Infrastructure as Code',
      '시크릿 관리 철저',
      '롤백 가능한 배포',
      '모니터링/알림 설정',
    ],
  },
  data: {
    description: '데이터 파이프라인/분석',
    techStack: ['Python', 'Pandas/Spark', 'SQL', 'Visualization'],
    conventions: [
      '데이터 검증 필수',
      '재현 가능한 파이프라인',
      '데이터 리니지 추적',
      '결과물 문서화',
    ],
  },
  custom: {
    description: '커스텀 프로젝트',
    techStack: [],
    conventions: [],
  },
};
