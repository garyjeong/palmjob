# AI Agent Coding Guide (AGENTS.md)

이 문서는 AI 에이전트(Claude Code, GitHub Copilot 등)가 `palmjob` 프로젝트에서 원활하게 작업을 수행할 수 있도록 돕기 위한 가이드입니다. 프로젝트의 구조, 코딩 컨벤션, 주요 패턴 및 워크플로우를 숙지하고 기여해주세요.

## 1. 프로젝트 개요 및 구조

### 개요
**PalmJob**은 사용자가 손바닥 사진을 업로드하면 AI가 이를 분석하여 개인에게 어울리는 이색 직업을 추천해주는 웹 서비스입니다. Next.js 기반의 모놀리식 아키텍처를 채택하고 있습니다.

### 기술 스택
- **언어**: TypeScript 5
- **프레임워크**: Next.js 16 (App Router), React 19
- **UI/CSS**: TailwindCSS 4
- **데이터베이스/캐시**: Redis (ioredis)
- **AI 서비스**: OpenAI API (GPT, DALL-E)
- **배포**: Fly.io, Docker
- **패키지 관리**: pnpm
- **코드 품질**: ESLint

### 디렉토리 구조
- `src/app/`: Next.js App Router의 핵심 디렉토리.
  - `src/app/api/`: 백엔드 API 라우트. (예: `/api/analyze`)
  - `src/app/[page]/`: 사용자에게 보여지는 UI 페이지. (예: `/`, `/result/[id]`)
- `src/components/`: 재사용 가능한 UI 컴포넌트.
  - `atoms/`: 가장 작은 단위의 컴포넌트 (버튼, 인풋 등).
  - `molecules/`: atom 컴포넌트들을 조합한 컴포넌트.
- `src/lib/`: 외부 서비스(OpenAI, Redis) 연동, 핵심 비즈니스 로직.
- `src/prompts/`: AI 모델에 전달할 프롬프트 템플릿.
- `src/utils/`: 범용 헬퍼 함수.
- `src/types/`: 전역 TypeScript 타입 정의.
- `public/`: 이미지, 폰트 등 정적 에셋.
- `envs/`: 환경 변수 예시 파일 (`env.example`).
- `Dockerfile`, `fly.toml`: 배포 및 컨테이너 설정.

## 2. 코딩 컨벤션

### 네이밍
- **컴포넌트**: PascalCase (예: `ResultCard.tsx`)
- **변수/함수**: camelCase (예: `getUserResult`)
- **타입/인터페이스**: PascalCase (예: `interface AnalysisResult`)
- **파일/디렉토리**: kebab-case (예: `result-card/`)

### 포맷팅 및 스타일
- **린팅**: ESLint 규칙을 따릅니다. 코드를 제출하기 전 `pnpm lint` 명령어로 검사를 실행하세요.
- **스타일링**: TailwindCSS 유틸리티 클래스를 사용합니다. 별도의 CSS 파일 작성은 지양합니다.
- **타입스크립트**: 모든 코드에 대해 엄격한 타입 정의를 사용합니다. `any` 타입 사용을 최소화하고, `src/types`에 공용 타입을 정의하여 재사용합니다.
- **경로 별칭**: `src` 디렉토리는 `@` 별칭을 사용하여 임포트합니다. (예: `import { redis } from '@/lib/redis';`)

## 3. 빌드/테스트 명령어

- **의존성 설치**: `pnpm install`
- **개발 서버 실행**: `pnpm dev`
- **로컬 Redis 실행**: `docker-compose up -d`
- **프로덕션 빌드**: `pnpm build`
- **프로덕션 서버 실행**: `pnpm start`
- **린트 검사**: `pnpm lint`

**주의**: 개발 서버를 실행하기 전에 `envs/env.example` 파일을 복사하여 `.env.local` 파일을 생성하고, 필요한 환경 변수(OPENAI_API_KEY, REDIS_URL 등)를 반드시 설정해야 합니다.

## 4. 주요 의존성 및 패턴

- **Next.js App Router**: 페이지 및 API 라우팅에 사용됩니다. 서버 컴포넌트와 클라이언트 컴포넌트의 개념을 이해하고 적절히 사용하세요.
- **Atomic Design**: `src/components` 디렉토리에서 `atoms`와 `molecules` 구조를 따라 컴포넌트를 설계하여 재사용성을 극대화합니다.
- **프롬프트 분리**: AI 프롬프트는 로직과 분리하여 `src/prompts` 디렉토리에서 텍스트 파일로 관리합니다. 이를 통해 프롬프트 엔지니어링을 용이하게 합니다.
- **서버리스 함수**: 백엔드 로직은 Next.js의 API Routes (`src/app/api/.../route.ts`) 내에서 서버리스 함수 형태로 작성됩니다.
- **Redis 캐싱**: OpenAI API 호출 결과를 Redis에 캐싱하여 반복적인 요청을 방지하고 응답 속도를 향상시킵니다. 분석 결과는 ID를 키로 하여 저장됩니다.

## 5. PR/커밋 규칙

### 커밋 메시지
Conventional Commits 규칙을 따릅니다. 메시지 제목은 50자 이내의 한국어로 작성합니다.

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 기능 변경 없는 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드, 패키지 매니저 등 설정 변경

**예시**: `feat: 결과 페이지 공유 기능 추가`

### Pull Request (PR)
- PR 제목은 작업 내용을 명확하게 설명해야 합니다.
- 본문에는 변경 사항에 대한 요약과 관련 이슈 번호(예: `Closes #123`)를 기재합니다.
- PR을 생성하기 전, 로컬에서 `pnpm lint`와 `pnpm build`가 성공하는지 확인해야 합니다.
