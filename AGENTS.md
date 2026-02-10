# AI 에이전트 작업 가이드 (Guide for AI Agents)

이 문서는 AI 에이전트가 `palmjob` 프로젝트에서 작업을 수행할 때 필요한 가이드라인을 제공합니다. 작업을 시작하기 전에 반드시 이 문서를 숙지해 주세요.

## 1. 프로젝트 개요 (Project Overview)

- **서비스명**: PalmJob
- **설명**: 사용자가 손바닥 사진을 업로드하면 AI가 이를 분석하여 개인에게 어울리는 이색 직업을 추천해주는 재미 위주의 서비스입니다.
- **기술 스택**: TypeScript, Next.js (App Router), React, TailwindCSS, Redis, OpenAI API, Docker, Fly.io.

## 2. 프로젝트 구조 (Project Structure)

주요 디렉토리 구조는 다음과 같습니다.

- `src/app/`: Next.js App Router의 핵심 디렉토리입니다. 모든 페이지(UI) 및 API 라우트(백엔드 로직)가 이곳에 정의됩니다.
  - `src/app/api/`: 백엔드 API 엔드포인트.
- `src/components/`: Atomic Design 원칙에 따른 재사용 가능한 UI 컴포넌트 (`atoms`, `molecules`).
- `src/lib/`: 외부 서비스(OpenAI, Redis) 연동 로직 및 핵심 비즈니스 로직 모듈.
- `src/prompts/`: AI 모델과의 상호작용에 사용되는 텍스트 프롬프트 템플릿.
- `src/utils/`: 범용 헬퍼 함수.
- `src/types/`: 프로젝트 전반에서 사용되는 TypeScript 타입 정의.
- `public/`: 정적 에셋 (이미지, 폰트 등).
- `Dockerfile`, `fly.toml`: 배포 및 컨테이너화 설정.

## 3. 코딩 컨벤션 (Coding Conventions)

- **언어**: TypeScript를 사용하며, 타입 안정성을 최우선으로 합니다. 전역 타입은 `src/types`에서 관리합니다.
- **스타일링**: TailwindCSS를 사용하여 유틸리티 우선 방식으로 스타일을 적용합니다.
- **컴포넌트**: `src/components` 내부에 Atomic Design 원칙(`atoms`, `molecules`)에 따라 컴포넌트를 구성합니다.
- **경로 별칭**: `tsconfig.json`에 `@/*` 별칭이 설정되어 있습니다. `src` 디렉토리 내 모듈을 임포트할 때 `import ... from '@/components/...'`와 같이 절대 경로를 사용해 주세요.
- **린팅**: ESLint 규칙을 엄격히 준수합니다. 코드를 제출하기 전 `pnpm lint`를 실행하여 오류가 없는지 확인해야 합니다.
- **AI 프롬프트**: AI 관련 프롬프트는 `src/prompts` 디렉토리 내에 별도 `.ts` 또는 `.txt` 파일로 관리하여 코드와 분리합니다.
- **환경 변수**: `.env.local` 파일을 통해 관리하며, 코드에 하드코딩하지 않습니다.

## 4. 빌드 및 테스트 (Build & Test)

- **의존성 설치**: `pnpm install`
- **개발 서버 실행**: `pnpm dev`
  - **참고**: 로컬 개발 시 `docker-compose up -d` 명령어로 Redis 컨테이너를 먼저 실행해야 합니다.
- **프로덕션 빌드**: `pnpm build`
- **프로덕션 서버 시작**: `pnpm start`
- **린트 검사**: `pnpm lint`

**환경 변수 설정**:
프로젝트 루트에 `.env.local` 파일을 생성하고 `envs/env.example` 파일을 참고하여 `OPENAI_API_KEY`, `REDIS_URL` 등을 설정해야 합니다.

## 5. 주요 의존성 및 패턴 (Key Dependencies & Patterns)

- **Next.js App Router**: 프론트엔드 라우팅과 백엔드 API 라우트를 모두 `src/app` 디렉토리에서 통합 관리합니다.
- **Redis (ioredis)**: 분석 결과 및 이미지 데이터의 임시 캐시/저장소로 사용됩니다. 데이터는 일정 시간(30일) 후 자동 삭제됩니다.
- **OpenAI API**: 손금 분석(GPT) 및 이미지 생성(DALL-E)에 사용됩니다. 관련 로직은 `src/lib/openai.ts`와 `src/lib/dalle.ts`에 추상화되어 있습니다.
- **Serverless Functions**: Next.js API Routes (`src/app/api/.../route.ts`)를 사용하여 백엔드 로직을 서버리스 함수 형태로 구현합니다.
- **Atomic Design**: 컴포넌트를 `atoms`(가장 작은 단위)와 `molecules`(atoms의 조합)으로 나누어 재사용성과 유지보수성을 높입니다.

## 6. PR 및 커밋 규칙 (PR & Commit Rules)

### 커밋 메시지 (Commit Message)

Conventional Commits 형식을 따릅니다. 메시지는 한글로 작성합니다.

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 누락 등 (코드 로직 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드, 패키지 매니저 설정 등 기타 변경사항

**예시:**
```
feat: 손바닥 이미지 업로드 기능 추가
fix: 결과 페이지에서 OG 이미지가 깨지는 문제 수정
docs: AGENTS.md 파일 추가
```

### Pull Request (PR)

- PR 제목은 커밋 메시지와 같이 변경 사항을 명확히 요약해야 합니다.
- PR 본문에는 변경된 내용과 그 이유, 관련 이슈 번호를 반드시 포함해야 합니다.
- PR은 `main` 브랜치를 대상으로 생성합니다.
