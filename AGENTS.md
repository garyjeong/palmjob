# AI 에이전트 작업 가이드 (AGENTS.md)

이 문서는 AI 코드 어시스턴트(Claude Code, Copilot 등)가 `palmjob` 리포지토리에서 작업을 수행할 때 필요한 가이드라인을 제공합니다.

## 1. 프로젝트 개요 및 구조

### 개요

**PalmJob**은 사용자가 손바닥 사진을 업로드하면 AI가 이를 분석하여 이색 직업을 추천해주는 웹 서비스입니다.

- **목적**: 재미와 공유 목적의 서비스 (과학적 진단 아님)
- **주요 기술 스택**: TypeScript 5, Next.js 16 (App Router), React 19, TailwindCSS 4, Redis, OpenAI API, Docker
- **아키텍처**: Next.js App Router 기반의 모놀리식 아키텍처 (프런트엔드와 백엔드 API 통합)
- **배포**: Fly.io, Docker

### 핵심 기능

1. **손바닥 사진 업로드 및 분석**: 사용자가 손바닥 이미지를 업로드 → OpenAI API를 통한 손금 분석
2. **결과 조회**: 분석 결과를 Redis에서 조회하여 동적으로 렌더링
3. **소셜 공유**: Open Graph 이미지 생성을 통한 카드 공유 기능

### 디렉토리 구조

```
src/
├── app/                          # Next.js App Router (페이지 + API)
│   ├── (pages)/                  # 페이지 라우팅
│   │   ├── page.tsx              # 메인 페이지
│   │   ├── analyzing/[id]/       # 분석 진행 중 페이지
│   │   ├── result/[id]/          # 결과 페이지
│   │   └── share/[id]/           # 공유 페이지
│   ├── api/                      # API 라우트 (백엔드)
│   │   ├── analyze/              # 손금 분석 요청 처리
│   │   ├── result/[id]/          # 분석 결과 조회
│   │   └── og/[id]/              # Open Graph 이미지 생성
│   └── layout.tsx
├── components/                   # UI 컴포넌트 (Atomic Design)
│   ├── atoms/                    # 기본 컴포넌트 (Button, Input 등)
│   └── molecules/                # 조합 컴포넌트 (Form, Card 등)
├── lib/                          # 핵심 로직 및 외부 연동
│   ├── openai.ts                 # OpenAI LLM API 래퍼
│   ├── dalle.ts                  # DALL-E 이미지 생성 API 래퍼
│   ├── redis.ts                  # Redis 연결 및 캐시 관리
│   ├── validation.ts             # 이미지 유효성 검사
│   └── ...
├── prompts/                      # AI 프롬프트 템플릿 관리
│   └── palm-analysis.txt         # 손금 분석 프롬프트
├── utils/                        # 범용 헬퍼 함수
│   └── ...
├── types/                        # TypeScript 타입 정의
│   └── index.ts
public/                           # 정적 에셋
docs/                             # 프로젝트 문서
envs/
└── env.example                   # 환경 변수 예제
```

### 데이터 흐름

```
사용자 입력 (손바닥 사진)
        ↓
  [POST /api/analyze]
        ↓
  이미지 유효성 검사 + Base64 인코딩
        ↓
  OpenAI API 호출 (손금 분석)
        ↓
  Redis 저장 (결과 + 이미지 임시 저장)
        ↓
  [GET /result/[id] + /api/result/[id]]
        ↓
  결과 페이지 렌더링
        ↓
  [GET /api/og/[id]] (소셜 공유시)
        ↓
Open Graph 이미지 동적 생성
```

## 2. 코딩 컨벤션

### 2.1 언어 및 파일명

- **언어**: 모든 코드는 **TypeScript**로 작성합니다.
- **파일명**:
  - 컴포넌트: `PascalCase` + `.tsx` (예: `ResultCard.tsx`)
  - 유틸/라이브러리: `kebab-case` + `.ts` (예: `openai-client.ts`)
  - 페이지/라우트: 디렉토리명 기반 (예: `page.tsx`, `route.ts`)

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | `PascalCase` | `ResultCard`, `UploadForm` |
| 변수, 함수 | `camelCase` | `getUserResult`, `validateImage` |
| 타입, 인터페이스 | `PascalCase` | `AnalysisResult`, `UserInput` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_IMAGE_SIZE`, `API_TIMEOUT` |
| 환경 변수 | `UPPER_SNAKE_CASE` | `OPENAI_API_KEY`, `REDIS_URL` |
| 클래스 | `PascalCase` | `RedisClient` |

### 2.3 코드 스타일

- **포맷팅**: ESLint 규칙을 따릅니다. 커밋 전 `pnpm lint`를 필수 실행합니다.
- **Prettier**: 자동 포맷팅이 설정되어 있습니다.
- **import 순서**:
  1. React/Next.js 라이브러리
  2. 외부 라이브러리 (예: `ioredis`, `openai`)
  3. 내부 모듈 (예: `@/lib`, `@/components`)
  4. 타입 (예: `type { ... } from`)

```typescript
// Good
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { analyzeImage } from '@/lib/openai';
import type { AnalysisResult } from '@/types';

// Bad
import type { AnalysisResult } from '@/types';
import { analyzeImage } from '@/lib/openai';
import Redis from 'ioredis';
import React from 'react';
```

### 2.4 경로 별칭

`tsconfig.json`에 `@/*` → `src/*` 매핑이 설정되어 있습니다. 상대 경로 대신 별칭을 사용해주세요.

```typescript
// Good
import { redis } from '@/lib/redis';
import Button from '@/components/atoms/Button';

// Bad
import { redis } from '../../lib/redis';
import Button from '../../../../components/atoms/Button';
```

### 2.5 스타일링

- **방식**: TailwindCSS 유틸리티 클래스 우선
- **원칙**: 새로운 CSS 파일 추가보다 기존 유틸리티 조합 활용
- **예시**:
  ```typescript
  // Good
  <div className="flex flex-col gap-4 p-6 rounded-lg bg-white shadow-md">
    ...
  </div>

  // Bad (CSS 파일 추가)
  // styles.css
  .custom-card { /* ... */ }
  ```

### 2.6 TypeScript 타입 지정

- 모든 함수 파라미터와 반환값에 타입을 명시합니다.
- `any` 사용을 최소화합니다.
- 반복되는 타입은 `src/types/index.ts`에 정의합니다.

```typescript
// Good
function analyzeImage(imageBuffer: Buffer): Promise<AnalysisResult> {
  // ...
}

// Bad
function analyzeImage(imageBuffer: any): any {
  // ...
}
```

### 2.7 에러 처리

- 모든 비동기 작업에서 try-catch를 사용합니다.
- 의미 있는 에러 메시지를 제공합니다.
- 클라이언트에는 민감한 정보를 노출하지 않습니다.

```typescript
// Good
try {
  const result = await openai.analyze(image);
  return NextResponse.json(result);
} catch (error) {
  console.error('Analysis failed:', error);
  return NextResponse.json(
    { error: 'Failed to analyze image' },
    { status: 500 }
  );
}
```

### 2.8 주석 작성

- 복잡한 로직에만 주석을 추가합니다.
- 함수/클래스는 JSDoc 형식으로 문서화합니다.

```typescript
/**
 * 손바닥 이미지를 검증하고 OpenAI API를 호출합니다.
 * @param imageBuffer - 이미지 파일 버퍼
 * @param maxSize - 최대 파일 크기 (바이트)
 * @returns 분석 결과 객체
 * @throws 이미지 유효성 검사 실패 시 에러
 */
function validateAndAnalyze(
  imageBuffer: Buffer,
  maxSize: number = 5 * 1024 * 1024
): Promise<AnalysisResult> {
  // ...
}
```

## 3. 빌드/테스트/실행 명령어

### 3.1 사전 요구사항

- **Node.js**: 20.x 이상
- **pnpm**: 9.x 이상
- **Docker** (옵션): 로컬 Redis 실행용

### 3.2 초기 설정

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp envs/env.example .env.local
# .env.local 파일을 편집하여 필수 값 입력:
# - OPENAI_API_KEY: OpenAI API 키
# - REDIS_URL: Redis 연결 URL (기본: redis://localhost:6379)
# - NEXT_PUBLIC_API_URL: 클라이언트에서 사용할 API URL

# 3. Redis 컨테이너 실행 (처음 1회 또는 필요시)
docker-compose up -d

# 확인: docker-compose ps
```

### 3.3 개발 명령어

```bash
# 개발 서버 실행
pnpm dev
# 접속: http://localhost:4000

# 코드 린팅 (커밋 전 필수)
pnpm lint

# 린트 자동 수정
pnpm lint --fix
```

### 3.4 프로덕션 명령어

```bash
# 프로덕션 빌드
pnpm build

# 빌드된 애플리케이션 실행
pnpm start

# Docker 빌드
docker build -t palmjob:latest .

# Docker 실행
docker run -p 3000:3000 --env-file .env.local palmjob:latest
```

### 3.5 테스트 데이터

- `test-images/` 디렉토리에 샘플 손바닥 이미지가 제공됩니다.
- 개발 및 수동 테스트 시 활용하세요.

## 4. 주요 의존성 및 패턴

### 4.1 Next.js App Router

- **페이지 라우팅**: `src/app` 디렉토리 구조가 자동으로 URL 라우팅이 됩니다.
- **API 라우트**: `route.ts` 파일이 API 엔드포인트가 됩니다.
- **서버 vs 클라이언트 컴포넌트**:
  - **서버 컴포넌트** (기본): 민감한 데이터 처리, 직접적인 DB/Redis 접근
  - **클라이언트 컴포넌트**: 상호작용이 필요한 부분 (`"use client"` 지시어 필수)

```typescript
// Server Component (기본)
export default function ResultPage({ params }: { params: { id: string } }) {
  // Redis 접근 가능
}

// Client Component
'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  // 상호작용 로직
}
```

### 4.2 Redis 패턴

```typescript
import { redis } from '@/lib/redis';

// 데이터 저장 (30일 TTL)
await redis.setex(`analysis:${id}`, 30 * 24 * 60 * 60, JSON.stringify(result));

// 데이터 조회
const data = await redis.get(`analysis:${id}`);
const result = JSON.parse(data);

// 데이터 삭제
await redis.del(`analysis:${id}`);
```

### 4.3 OpenAI API 패턴

```typescript
import { openai } from '@/lib/openai';

// 프롬프트 기반 분석
const analysis = await openai.createChatCompletion({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]
});

// 이미지 생성 (DALL-E)
const imageUrl = await dalle.generateImage(prompt);
```

### 4.4 환경 변수 관리

```typescript
// src/lib/config.ts (예)
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY!,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
} as const;

export default config;

// 사용처
import config from '@/lib/config';
const client = new Redis(config.redisUrl);
```

**중요**: 민감한 정보(API 키, DB URL)는 `.env.local`을 통해 관리하고 절대 코드에 하드코딩하지 마세요.

### 4.5 상태 관리 패턴

- **복잡한 전역 상태 관리 라이브러리 사용 금지** (예: Redux)
- **기본 Hooks 우선 사용**: `useState`, `useContext`, `useReducer`
- **URL 상태 활용**: `useSearchParams()`, `useRouter()` (동적 필터링 등)

```typescript
'use client';

import { useState } from 'react';

export function AnalysisCard({ resultId }: { resultId: string }) {
  const [isSharing, setIsSharing] = useState(false);
  // 상태 관리
}
```

## 5. PR/커밋 규칙

### 5.1 커밋 메시지 형식

**Conventional Commits** 형식을 따릅니다.

```
<type>(<scope>): <subject>

<body>

<footer>
```

**주요 규칙**:
- **type**: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`
- **scope**: 변경 영역 (예: `api`, `components`, `lib`)
- **subject**: 50자 이내, 한국어, 명령조
- **body** (선택): 무엇을, 왜 했는지 설명
- **footer** (선택): 관련 이슈 번호 (`Closes #123`)

**예시**:

```
feat(api): 손금 분석 결과 캐싱 기능 추가

- Redis를 활용한 30일 TTL 캐싱 구현
- 분석 후 이미지 즉시 삭제 처리

Closes #45
```

```
fix(components): 결과 카드 모바일 레이아웃 깨짐 수정

Tailwind breakpoint 적용으로 모바일 화면에서
텍스트가 잘리는 문제 해결
```

```
docs(readme): 환경 변수 설정 문서 업데이트
```

### 5.2 Pull Request (PR) 규칙

**PR 제목**: 주요 커밋과 동일한 형식

**PR 본문** (필수 포함 사항):

```markdown
## 변경 사항
- [ ] 새로운 기능 추가
- [ ] 버그 수정
- [ ] 리팩토링
- [ ] 문서 업데이트

## 설명
무엇을 변경했고, 왜 변경했는지 상세히 작성합니다.

## 테스트 방법
1. `pnpm dev` 실행
2. http://localhost:4000 접속
3. [테스트 절차]

## 체크리스트
- [ ] `pnpm lint` 통과
- [ ] 새로운 환경 변수가 필요하면 `envs/env.example` 업데이트
- [ ] TypeScript 타입 검사 통과
- [ ] 관련 문서 업데이트 완료

## 관련 이슈
Closes #[이슈번호]
```

**PR 생성 전 필수 확인**:

```bash
# 1. 린팅 검사
pnpm lint

# 2. 로컬 테스트
pnpm dev
# 수동으로 기능 테스트

# 3. 빌드 검증
pnpm build
```

### 5.3 코드 리뷰 가이드

- **PR 크기**: 가능한 작게 유지 (변경사항 < 400줄 권장)
- **분할 전략**: 큰 작업은 여러 PR로 나누기
- **설명 명확성**: 변경 이유가 명확해야 함

## 6. 주의사항

### 6.1 보안

- ❌ API 키, 토큰, 비밀번호를 코드에 하드코딩하지 마세요.
- ✅ 모든 민감한 정보는 환경 변수로 관리하세요.
- ❌ 클라이언트 컴포넌트에서 `process.env` (프라이빗)에 접근하지 마세요.
- ✅ `NEXT_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 접근 가능합니다.

### 6.2 이미지 처리

- 업로드 이미지는 유효성 검사 후 즉시 임시 저장 또는 처리합니다.
- 분석 완료 후 원본 이미지는 **즉시 삭제**합니다 (개인정보 보호).
- 결과 데이터는 30일 TTL로 자동 삭제됩니다.

### 6.3 성능

- Large Language Model (LLM) 호출은 시간이 소요되므로, 사용자에게 로딩 상태를 명확히 표시합니다.
- Redis 캐싱을 적극 활용하여 중복 요청을 방지합니다.
- 이미지 최적화: 네트워크 전송량 감소를 위해 필요시 리사이징합니다.

### 6.4 에러 처리

- 모든 API 라우트에서 명확한 HTTP 상태 코드를 반환합니다.
- 클라이언트에는 도움이 되는 에러 메시지를 제공합니다.
- 서버 로그에는 상세한 에러 정보를 기록합니다.

## 7. 유용한 링크

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TailwindCSS 공식 문서](https://tailwindcss.com/docs)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)
- [OpenAI API 문서](https://platform.openai.com/docs/api-reference)
- [Redis 공식 문서](https://redis.io/documentation)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 8. 질문/문제 해결

문제가 발생하면:

1. **에러 메시지 확인**: 개발 서버의 콘솔 로그 확인
2. **문서 검토**: 본 파일 및 `docs/` 디렉토리 문서 확인
3. **이슈 검색**: GitHub Issues에서 유사 사례 검색
4. **이슈 생성**: 이전 사례가 없으면 상세 정보와 함께 이슈 생성

---

**마지막 업데이트**: 2024년
**관리자**: palmjob 팀
