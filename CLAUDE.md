# PalmJob - Claude Code 가이드

**프로젝트**: PalmJob - 손바닥 사진 기반 이색 직업 추천 서비스  
**기술 스택**: Next.js 16, React 19, TypeScript 5, TailwindCSS

---

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (main)/            # 메인(업로드) 페이지 그룹
│   ├── result/[id]/       # 결과 화면 (동적 라우트)
│   ├── share/[id]/        # 공유 랜딩 페이지
│   ├── api/               # API Routes
│   │   ├── analyze/       # 손바닥 분석 API
│   │   └── result/        # 결과 조회 API
│   ├── layout.tsx         # 루트 레이아웃
│   └── globals.css        # 글로벌 스타일
├── components/             # React 컴포넌트 (Atomic Design)
│   ├── atoms/             # Button, Text, Icon, Spinner
│   ├── molecules/         # UploadArea, HandSelector, ResultCard
│   ├── organisms/         # Header, Footer, UploadForm, SharePanel
│   └── templates/         # MainLayout, ResultLayout
├── services/               # API 통신 레이어
│   ├── analyzeService.ts  # 손바닥 분석 서비스
│   └── resultService.ts   # 결과 조회 서비스
├── hooks/                  # 커스텀 훅
│   ├── useUpload.ts       # 파일 업로드 훅
│   └── useAnalysis.ts     # 분석 상태 관리 훅
├── utils/                  # 유틸리티 함수
│   ├── imageValidation.ts # 이미지 검증
│   └── shareUtils.ts      # 공유 링크 생성
├── config/                 # 설정
│   └── constants.ts       # 상수 정의
├── types/                  # TypeScript 타입
│   ├── analysis.ts        # 분석 관련 타입
│   └── result.ts          # 결과 관련 타입
└── styles/                 # 스타일
    └── themes/            # 테마 변수
```

---

## MUST 규칙 (필수)

### 아키텍처

- Next.js App Router 구조 준수 (`app/` 디렉토리)
- Server Component 기본, Client Component는 `'use client'` 지시어 필수
- 절대 경로 `@/` 사용 (상대 경로 최대 2단계)
- API Routes는 `app/api/` 디렉토리에 위치

### 컴포넌트

- Atomic Design 패턴 준수 (Atoms → Molecules → Organisms → Templates)
- 상위 계층은 하위 계층만 import
- 컴포넌트 파일명 PascalCase, Props 타입은 `ComponentNameProps`
- 각 디렉토리는 `index.ts`로 Barrel Export

### 데이터 처리 (⚠️ 중요)

- **손바닥 사진은 절대 저장하지 않음**
- 분석 완료 후 즉시 메모리에서 삭제
- 결과물만 30일 보관 (직업명, 결과 카드, 해석 문장)
- 개인정보 수집 금지 (로그인 없음)

### 스타일링

- TailwindCSS 사용
- 커스텀 스타일은 CSS 변수 기반
- 반응형 디자인 필수 (모바일 우선)

### 환경 변수

- 클라이언트 접근 가능 변수: `NEXT_PUBLIC_` 접두사 필수
- `.env.local`은 버전 관리 제외
- `envs/` 디렉토리에 환경별 설정 파일

---

## SHOULD 규칙 (권장)

- 컴포넌트 렌더링 최적화: 필요시 `React.memo` 사용
- 이미지 최적화: `next/image` 컴포넌트 사용
- 로딩 상태: Skeleton UI 또는 Spinner 제공
- 에러 바운더리: 주요 섹션에 에러 처리 적용
- 접근성: ARIA 속성 및 키보드 네비게이션 지원

---

## 화면별 핵심 로직

### 1. 메인(업로드) 화면

```typescript
// 필수 요소
- HandSelector: 왼손/오른손 선택 (필수)
- UploadArea: 파일 선택 + 드래그앤드롭
- GuideText: 촬영 가이드 3줄
- PrivacyNotice: 비저장 고지 문구
```

### 2. 대기(로딩) 화면

```typescript
// 필수 요소
- LoadingSpinner: 분석 중 표시
- ProgressText: 진행 상태 메시지
```

### 3. 결과 화면

```typescript
// 필수 요소
- ResultCard: 3D 오브젝트 기반 결과 카드
- JobTitle: 추천 직업명
- Interpretation: 해석 문장 (2문단)
- ShareButton: 공유 버튼 (링크 복사)
- RetryButton: "다시 해보기" 버튼
```

### 4. 결과 랜딩 화면 (공유용)

```typescript
// 필수 요소
- ResultCard: 결과 카드 표시
- CTAButton: "나도 해보기" 버튼
- ExpiryNotice: 만료 시 안내 메시지
```

---

## API 설계

### POST /api/analyze

```typescript
// Request
{
  hand: 'left' | 'right';
  image: File; // Base64 또는 FormData
}

// Response
{
  resultId: string;
  job: {
    title: string;
    cardImageUrl: string;
    interpretation: string;
  };
}
```

### GET /api/result/[id]

```typescript
// Response
{
  id: string;
  job: {
    title: string;
    cardImageUrl: string;
    interpretation: string;
  };
  createdAt: string;
  expiresAt: string;
}
```

---

## 참고 문서

- [.cursorrules](./.cursorrules) - 프로젝트 규칙
- [docs/PRD.md](./docs/PRD.md) - 기획서 요약
- [README.md](./README.md) - 프로젝트 개요

