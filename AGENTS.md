# AI 에이전트 작업 가이드 (AGENTS.md)

이 문서는 AI 코드 어시스턴트(Claude Code, Copilot 등)가 `palmjob` 리포지토리에서 효과적으로 작업할 수 있도록 돕기 위한 가이드입니다.

## 1. 프로젝트 개요 및 구조

### 개요
"PalmJob"은 사용자가 손바닥 사진을 업로드하면 AI가 이를 분석하여 개인에게 어울리는 이색 직업을 추천해주는 웹 서비스입니다. Next.js 기반의 모놀리식 아키텍처를 채택하고 있습니다.

### 주요 기술 스택
- **언어**: TypeScript 5
- **프레임워크**: Next.js 16 (App Router), React 19
- **스타일링**: TailwindCSS 4
- **데이터베이스/캐시**: Redis (ioredis)
- **AI 서비스**: OpenAI API (GPT 분석, DALL-E 이미지 생성)
- **배포**: Fly.io, Docker
- **패키지 관리**: pnpm
- **코드 품질**: ESLint, PostCSS

### 주요 디렉토리 구조
```
.
├── src/
│   ├── app/                    # Next.js App Router (페이지 및 API 라우트)
│   │   ├── api/                # 백엔드 API 엔드포인트
│   │   │   ├── analyze/        # (POST) 손금 분석 요청 처리
│   │   │   ├── result/[id]/    # (GET) 분석 결과 조회
│   │   │   └── og/[id]/        # (GET) 동적 OG 이미지 생성
│   │   ├── (main)/             # 메인 페이지 그룹
│   │   ├── analyzing/[id]/     # 분석 중 페이지 (UI)
│   │   ├── result/[id]/        # 결과 페이지 (UI)
│   │   ├── share/[id]/         # 공유 페이지 (UI)
│   │   └── layout.tsx          # 루트 레이아웃
│   ├── components/             # 재사용 UI 컴포넌트 (Atomic Design)
│   │   ├── atoms/              # 기본 요소 (Button, Input, Card 등)
│   │   └── molecules/          # 조합 요소 (업로드 폼, 결과 카드 등)
│   ├── lib/                    # 핵심 비즈니스 로직 및 외부 서비스 연동
│   │   ├── openai.ts           # OpenAI API 클라이언트 및 추상화
│   │   ├── dalle.ts            # DALL-E 이미지 생성 로직
│   │   ├── redis.ts            # Redis 클라이언트 및 캐시 관리
│   │   └── validator.ts        # 손바닥 이미지 유효성 검사
│   ├── prompts/                # AI 프롬프트 템플릿 (텍스트 파일)
│   ├── types/                  # 전역 TypeScript 타입 정의
│   └── utils/                  # 범용 헬퍼 함수 (URL 처리, 스토리지 등)
├── public/                     # 정적 에셋 (이미지, 폰트, robots.txt)
├── docs/                       # 프로젝트 문서 (기획서, PRD, 가이드)
├── envs/                       # 환경 변수 예시 (env.example)
├── test-images/                # 개발/테스트용 예시 이미지
├── Dockerfile                  # 프로덕션 Docker 이미지 빌드 설정
├── docker-compose.yml          # 로컬 개발용 Redis 컨테이너 설정
├── next.config.ts              # Next.js 설정
├── tsconfig.json               # TypeScript 컴파일러 설정
├── eslint.config.mjs           # ESLint 규칙 정의
├── fly.toml                    # Fly.io 배포 설정
└── package.json                # 프로젝트 메타데이터, 스크립트, 의존성
```

### 데이터 흐름
1. **분석 요청**: 사용자가 손바닥 사진 업로드 → `api/analyze`에서 유효성 검사 후 OpenAI 호출
2. **결과 저장**: 분석 결과를 Redis에 저장 (30일 후 자동 삭제)
3. **결과 조회**: `api/result/[id]`를 통해 결과 데이터 반환
4. **이미지 생성**: `api/og/[id]`에서 동적 OG 이미지 생성 (소셜 공유용)
5. **사진 삭제**: 분석 후 손바닥 사진은 즉시 삭제 (개인정보 보호)

## 2. 코딩 컨벤션

### 2.1 네이밍 규칙
- **컴포넌트 파일명**: `PascalCase` (예: `ResultCard.tsx`, `PalmUploadForm.tsx`)
- **컴포넌트 함수명**: `PascalCase` (예: `export default function ResultCard()`)
- **변수/함수명**: `camelCase` (예: `const analyzeResult = ...`, `function getUserResult()`)
- **상수**: `UPPER_SNAKE_CASE` (예: `const API_TIMEOUT = 30000`)
- **타입/인터페이스**: `PascalCase` (예: `type PalmAnalysisResult`, `interface UserResponse`)
- **파일명 (비컴포넌트)**: `camelCase` (예: `openai.ts`, `validator.ts`)

### 2.2 포맷팅 및 스타일
- **들여쓰기**: 스페이스 2칸 (ESLint 자동 적용)
- **세미콜론**: 필수 (ESLint 규칙)
- **따옴표**: 작은따옴표 (`'`) 기본 사용
- **린팅**: `pnpm lint --fix` 실행하여 ESLint 및 Prettier 규칙 자동 적용
- **스타일링**: TailwindCSS 유틸리티 클래스 직접 사용 (별도 CSS 파일 작성 지양)

### 2.3 경로 및 임포트
- **경로 별칭**: `@/*`를 사용하여 `src` 디렉토리 모듈 임포트
  - ✅ `import { redis } from '@/lib/redis';`
  - ❌ `import { redis } from '../../../lib/redis';`
- **임포트 순서**: 외부 라이브러리 → 내부 모듈 → 타입 순으로 정렬

### 2.4 TypeScript 규칙
- **명시적 타입**: 함수 매개변수 및 반환값에 타입 명시
  ```typescript
  async function analyzeImage(imageBase64: string): Promise<PalmAnalysisResult> {
    // 구현
  }
  ```
- **타입 정의**: 재사용되는 타입은 `src/types` 디렉토리에서 중앙 관리
- **any 사용 금지**: 필요시 `unknown` 또는 구체적 타입 사용

### 2.5 컴포넌트 작성
- **함수형 컴포넌트**: React Functional Component 사용 (클래스 컴포넌트 금지)
- **Props 타입화**: `interface Props { ... }` 정의 후 사용
  ```typescript
  interface ResultCardProps {
    jobTitle: string;
    description: string;
    imageUrl: string;
  }

  export default function ResultCard({ jobTitle, description, imageUrl }: ResultCardProps) {
    return <div>...</div>;
  }
  ```
- **Atomic Design**: `atoms`(Button, Input, Badge 등) → `molecules`(forms, cards 등) 계층 준수

### 2.6 API 라우트
- **메서드별 함수**: `export async function GET()`, `export async function POST()` 정의
- **에러 처리**: 모든 에러 상황에 대해 적절한 HTTP 상태 코드 및 에러 메시지 반환
  ```typescript
  export async function POST(req: Request) {
    try {
      // 로직
    } catch (error) {
      console.error('Error in /api/analyze:', error);
      return Response.json(
        { error: 'Analysis failed' },
        { status: 500 }
      );
    }
  }
  ```
- **입력 검증**: 요청 데이터 유효성 검사 필수

### 2.7 환경 변수
- **공개 변수**: `NEXT_PUBLIC_` 접두사 사용 (브라우저 노출 가능)
- **비공개 변수**: 접두사 없이 정의 (서버 전용)
- **필수 변수 명시**: `.env.local` 파일 생성 시 참고할 `envs/env.example` 제공
  ```
  # 필수
  OPENAI_API_KEY=sk_test_...
  REDIS_URL=redis://localhost:6379
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```

## 3. 빌드/테스트 명령어

### 3.1 개발 환경
```bash
# 의존성 설치
pnpm install

# 환경 변수 설정 (envs/env.example 참고)
cp envs/env.example .env.local
# .env.local 파일 수정하여 실제 API 키 및 Redis URL 입력

# 로컬 Redis 실행 (Docker 필수)
docker-compose up -d

# 개발 서버 시작 (기본 포트: 4000)
pnpm dev
```

### 3.2 프로덕션 환경
```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 확인
pnpm start
```

### 3.3 코드 품질
```bash
# 린팅 (ESLint 검사)
pnpm lint

# 린팅 + 자동 수정
pnpm lint --fix

# 타입 체크
pnpm tsc --noEmit
```

### 3.4 테스트
- **현재 테스트 프레임워크**: 미설정 (향후 추가 예정)
- **테스트 이미지**: `test-images/` 디렉토리의 예시 이미지 활용

## 4. 주요 의존성 및 패턴

### 4.1 핵심 라이브러리
| 패키지 | 용도 | 버전 |
|--------|------|------|
| `next` | 프레임워크 | 16.x |
| `react` | UI 라이브러리 | 19.x |
| `typescript` | 타입 안정성 | 5.x |
| `tailwindcss` | 스타일링 | 4.x |
| `ioredis` | Redis 클라이언트 | ^5.0 |
| `openai` | OpenAI API 클라이언트 | ^4.0 |

### 4.2 아키텍처 패턴

#### 모놀리식 구조
- 프론트엔드(React 페이지)와 백엔드(API 라우트)가 단일 Next.js 프로젝트에서 관리됨
- **장점**: 배포 단순화, 코드 공유 용이
- **주의**: API 라우트와 페이지 컴포넌트 로직 분리 필수

#### Atomic Design 패턴
- **atoms**: 재사용 가능한 기본 UI 요소 (Button, Input, Badge, Card)
- **molecules**: 여러 atoms을 조합한 컴포넌트 (forms, result cards)
- **organisms** (선택): 복잡한 컴포넌트 조합 (페이지 섹션)

#### 프롬프트 분리
- AI와의 상호작용 프롬프트를 `src/prompts/` 디렉토리에 텍스트 파일로 관리
- 프롬프트 변경 시 코드 변경 없이 별도 파일 수정으로 처리
- 예: `src/prompts/palmAnalysis.txt` → `src/lib/openai.ts`에서 로드

#### 환경 변수 주입
- 민감한 정보(API 키, Redis URL)는 `.env.local`을 통해 주입
- 배포 환경별 설정 변경 시 재빌드 불필요
- 공개 정보는 `NEXT_PUBLIC_` 접두사로 브라우저에 노출

### 4.3 데이터 캐싱 전략
- **Redis 사용**: 분석 결과 임시 저장 (30일 후 자동 삭제)
- **이미지 처리**: 분석 후 손바닥 사진 즉시 삭제 (Base64 형태로 임시 저장 가능)
- **캐시 키 구조**: `analysis:{id}` (예: `analysis:550e8400-e29b-41d4-a716-446655440000`)

### 4.4 API 응답 형식
```typescript
// 성공 응답
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "jobTitle": "AI 손금 감정사",
  "description": "...",
  "imageUrl": "https://..."
}

// 에러 응답
{
  "error": "Analysis failed",
  "message": "Invalid image format"
}
```

## 5. PR/커밋 규칙

### 5.1 커밋 메시지
**Conventional Commits** 규칙을 따릅니다.

#### 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 타입 (type)
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링 (기능 변화 없음)
- `docs`: 문서 수정 (README, AGENTS.md 등)
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등, 로직 변화 없음)
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 설정, 의존성 업데이트 등

#### 범위 (scope)
- `api`: API 라우트 변경
- `ui`: 사용자 인터페이스 컴포넌트
- `lib`: 비즈니스 로직 라이브러리
- `types`: 타입 정의
- `config`: 설정 파일 변경

#### 주제 (subject)
- 명령조로 작성 (예: "Add", "Fix", "Update") → 현재형으로 시작
- 50자 이내
- 마침표 생략
- 영어 또는 한국어 통일

#### 예시
```
feat(api): 손금 분석 결과에 직업 아이콘 추가

손금 분석 결과에 OpenAI API를 통해 취업 아이콘을
동적으로 생성하여 시각적 피드백 개선

Closes #42

feat(ui): 결과 페이지 모바일 반응형 개선

모바일 환경에서 결과 카드 레이아웃 개선
이미지 크기 최적화 추가

feat(lib): Redis 캐시 전략 개선

analysis 결과 캐시 만료 시간 기본값을 30일로 설정
수동 캐시 정리 로직 추가

fix(api): /api/analyze에서 이미지 검증 오류 수정

Base64 인코딩된 이미지 유효성 검사 로직 개선
파일 크기 제한 검증 추가

docs: AGENTS.md 파일 추가

AI 에이전트 작업 가이드 문서 초안 작성
프로젝트 구조, 컨벤션, 명령어 정리
```

### 5.2 Pull Request (PR)

#### PR 제목
커밋 메시지의 첫 줄과 동일 형식 (타입(범위): 주제)
```
feat(api): 손금 분석 결과에 직업 아이콘 추가
```

#### PR 본문 (마크다운)
```markdown
## 변경 사항 요약
손금 분석 결과에 DALL-E를 통해 생성된 직업 아이콘을 추가합니다.

## 변경 파일
- `src/app/api/analyze/route.ts`: 이미지 생성 로직 추가
- `src/lib/dalle.ts`: DALL-E 호출 함수 구현
- `src/components/atoms/ResultCard.tsx`: 아이콘 표시 UI

## 테스트 항목
- [x] 손금 분석 API 동작 확인
- [x] 결과 페이지 이미지 표시 확인
- [x] 모바일 환경 레이아웃 확인

## 관련 이슈
Closes #42
Related to #39, #40

## 추가 노트
RAIL 이미지 생성으로 인해 API 응답 시간 약 2초 증가합니다.
캐싱 고려 권장합니다.
```

#### PR 리뷰 체크리스트
- [ ] 코드가 프로젝트 컨벤션을 준수합니까?
- [ ] 모든 새로운 함수에 타입이 명시되어 있습니까?
- [ ] 에러 처리가 적절합니까?
- [ ] 불필요한 console.log 또는 디버그 코드가 없습니까?
- [ ] 보안 이슈가 없습니까? (API 키 하드코딩 등)
- [ ] 기존 테스트가 통과합니까?

### 5.3 코드 리뷰 가이드
- **AI 에이전트가 코드 작성 시**: AGENTS.md 준수 여부 확인
- **PR 병합 전**: 최소 1인 리뷰 필수
- **문서 업데이트**: 기능 추가 시 AGENTS.md 또는 README 동시 업데이트

## 6. 주의사항 및 보안

### 6.1 민감한 정보
- ❌ API 키, Redis URL을 코드에 하드코딩
- ✅ `.env.local` 또는 환경 변수로 관리
- `.env.local` 파일을 `.gitignore`에 포함시켜 커밋 방지

### 6.2 입력 검증
- 모든 사용자 입력 및 외부 API 응답 검증 필수
- 파일 업로드: 파일 크기, 형식 검증
- 쿼리 파라미터: 타입 및 범위 검증

### 6.3 에러 처리
- 모든 async 함수는 try-catch로 감싸기
- API 라우트: 모든 HTTP 상태 코드 명시
- 사용자 친화적 에러 메시지 제공
- 민감한 에러 정보는 서버 로그에만 기록

### 6.4 성능 최적화
- 이미지 업로드: 크기 제한 설정 (권장 5MB 이하)
- AI API 호출: 타임아웃 설정 (권장 30초)
- Redis: 캐시 유효 기간 설정 (기본 30일)
- 불필요한 API 호출 방지 (debouncing, memoization)

## 7. 문제 해결

### Redis 연결 오류
```bash
# Docker로 Redis 실행
docker-compose up -d

# Redis 상태 확인
docker ps | grep redis
```

### OpenAI API 에러
```typescript
// API 키 확인
console.log(process.env.OPENAI_API_KEY);
// Rate limit 대비: 재시도 로직 구현
```

### 포트 충돌
```bash
# Next.js 개발 서버 포트 변경
pnpm dev -- -p 3001
```

## 8. 유용한 리소스

- **Next.js 공식 문서**: https://nextjs.org/docs
- **React 공식 문서**: https://react.dev
- **TailwindCSS 문서**: https://tailwindcss.com/docs
- **OpenAI API 문서**: https://platform.openai.com/docs
- **Redis 명령어**: https://redis.io/commands
- **TypeScript 핸드북**: https://www.typescriptlang.org/docs/

---

**마지막 업데이트**: 2024년
**담당자**: Development Team
