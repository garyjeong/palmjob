# AI 에이전트 작업 가이드

이 문서는 AI 에이전트(Claude Code 등)가 "PalmJob" 프로젝트에서 원활하게 작업을 수행할 수 있도록 돕는 가이드입니다. 작업을 시작하기 전에 반드시 이 문서를 숙지해주세요.

## 1. 프로젝트 개요

"PalmJob"은 사용자가 손바닥 사진을 업로드하면 AI가 이를 분석하여 개인에게 어울리는 이색 직업을 추천해주는 웹 서비스입니다. Next.js App Router를 기반으로 한 모놀리식 아키텍처를 채택하고 있으며, 프런트엔드와 백엔드 API가 단일 리포지토리에서 관리됩니다.

- **주요 기술 스택:** TypeScript, Next.js (App Router), React, TailwindCSS, Redis, OpenAI API
- **핵심 기능:**
    - 손바닥 이미지 업로드
    - AI 기반 손금 분석 및 직업 추천
    - 분석 결과 카드 생성 및 소셜 공유 (Open Graph)

## 2. 프로젝트 구조

주요 디렉토리 구조는 다음과 같습니다. 새로운 파일을 추가할 때는 이 구조를 따라주세요.

- `src/app/`: Next.js App Router의 핵심 디렉토리.
    - `api/`: 백엔드 API 라우트 (OpenAI 연동, 결과 조회, OG 이미지 생성 등).
    - `(pages)/`: 사용자에게 보여지는 UI 페이지 컴포넌트 (`/`, `/result/[id]` 등).
- `src/components/`: 재사용 가능한 UI 컴포넌트.
    - `atoms/`: 가장 작은 단위의 컴포넌트 (Button, Input 등).
    - `molecules/`: atom들을 조합한 컴포넌트 (Uploader, ResultCard 등).
- `src/lib/`: 외부 서비스 연동 및 핵심 비즈니스 로직 (Redis, OpenAI 클라이언트 등).
- `src/prompts/`: OpenAI API에 전달할 프롬프트 템플릿.
- `src/utils/`: 범용 헬퍼 함수.
- `src/types/`: 전역 TypeScript 타입 정의.
- `public/`: 정적 에셋 (이미지, 폰트 등).
- `envs/`: 환경 변수 예시 파일 (`.env.example`).

## 3. 코딩 컨벤션

코드의 일관성과 품질 유지를 위해 다음 규칙을 준수합니다.

- **언어:** **TypeScript 5**를 사용하며, 가능한 모든 곳에 명시적인 타입을 사용합니다. `any` 타입 사용은 지양합니다.
- **스타일링:** **TailwindCSS 4**를 사용합니다. JSX/TSX 파일 내에 유틸리티 클래스를 직접 적용합니다. 별도의 CSS 파일 작성은 지양합니다.
- **컴포넌트:**
    - 파일명과 컴포넌트명은 `PascalCase`를 사용합니다. (예: `ResultCard.tsx`)
    - Atomic Design 패턴에 따라 `atoms`와 `molecules`로 분리하여 작성합니다.
- **파일 네이밍:** 컴포넌트를 제외한 파일(lib, utils 등)은 `kebab-case`를 사용합니다. (예: `redis-client.ts`)
- **경로 별칭:** `src` 디렉토리 내부 모듈을 임포트할 때는 `@/*` 경로 별칭을 사용합니다. (예: `import { redis } from '@/lib/redis';`)
- **린팅:** 코드를 작성한 후 항상 `pnpm lint` 명령어를 실행하여 린팅 오류를 수정합니다. ESLint 규칙은 `eslint.config.mjs` 파일을 따릅니다.

## 4. 빌드 및 테스트 명령어

개발 환경 설정 및 실행을 위한 주요 명령어입니다.

1.  **의존성 설치:**
    ```bash
    pnpm install
    ```
2.  **환경 변수 설정:**
    - `envs/env.example` 파일을 복사하여 프로젝트 루트에 `.env.local` 파일을 생성합니다.
    - `OPENAI_API_KEY`, `REDIS_URL` 등 필수 값을 채워넣습니다.
3.  **로컬 Redis 실행 (Docker 필요):**
    ```bash
    docker-compose up -d
    ```
4.  **개발 서버 실행:**
    ```bash
    pnpm dev
    ```
5.  **프로덕션 빌드:**
    ```bash
    pnpm build
    ```
6.  **린트 검사:**
    ```bash
    pnpm lint
    ```

## 5. 주요 의존성 및 패턴

- **Next.js App Router:** 페이지 라우팅과 API 라우트를 모두 `src/app` 디렉토리에서 관리합니다. 서버 컴포넌트와 클라이언트 컴포넌트를 적절히 활용합니다.
- **Redis (ioredis):** 분석 요청 ID를 키로 하여 분석 결과와 같은 임시 데이터를 저장하는 캐시/데이터베이스로 사용됩니다. 데이터는 30일 후 자동으로 만료됩니다.
- **OpenAI API:**
    - `src/lib/openai.ts`와 `src/lib/dalle.ts`를 통해 API와 상호작용합니다.
    - AI에 전달되는 프롬프트는 `src/prompts` 디렉토리에서 템플릿으로 관리됩니다. 프롬프트 수정이 필요할 경우 해당 디렉토리의 파일을 수정합니다.
- **상태 관리:** 간단한 클라이언트 사이드 상태는 React의 `useState`, `useContext`를 사용합니다. 복잡한 전역 상태 관리 라이브러리는 현재 사용하지 않습니다.

## 6. PR 및 커밋 규칙

- **브랜치 전략:**
    - 기능 개발: `feat/{기능-이름}` (예: `feat/kakao-share`)
    - 버그 수정: `fix/{버그-내용}` (예: `fix/image-upload-error`)
- **커밋 메시지:** [Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.
    - 형식: `<type>(<scope>): <subject>`
    - 예시:
        - `feat(api): 손금 분석 결과 캐싱 기능 추가`
        - `fix(ui): 모바일에서 공유 버튼이 잘리는 문제 수정`
        - `docs(readme): 프로젝트 실행 방법 업데이트`
        - `refactor(openai): 프롬프트 엔지니어링 개선`
- **PR (Pull Request):**
    - `main` 브랜치를 대상으로 PR을 생성합니다.
    - PR 본문에는 변경 사항을 명확하게 요약하여 작성합니다.
    - PR을 올리기 전, `pnpm lint`를 실행하여 모든 린팅 오류가 없는지 확인합니다.