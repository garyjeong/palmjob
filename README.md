# 🖐️ PalmJob

**손바닥 사진으로 찾는 나만의 이색 직업**

손바닥 사진을 업로드하면 AI가 분석하여 당신에게 어울리는 이색 직업을 추천해 드립니다.

> ⚠️ 본 서비스는 재미와 공유 목적이며, 과학적 진단이 아닙니다.

---

## ✨ 주요 기능

- 📸 **손바닥 사진 업로드**: 왼손/오른손 선택 후 사진 업로드
- 🎯 **이색 직업 추천**: AI 분석 기반 직업 추천
- 🎨 **결과 카드**: 3D 오브젝트 기반 공유용 결과 카드
- 🔗 **공유 기능**: 링크로 결과 공유, "나도 해보기" 유도

---

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, TailwindCSS 4
- **Deployment**: Fly.io

---

## 📁 프로젝트 구조

```
palmjob/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 업로드 페이지 (메인)
│   │   ├── analyzing/[id]/     # 분석 중 페이지
│   │   ├── result/[id]/        # 결과 페이지
│   │   └── share/[id]/         # 공유용 랜딩 페이지
│   ├── components/
│   │   ├── atoms/              # 기본 컴포넌트 (Button, Spinner)
│   │   ├── molecules/          # 조합 컴포넌트 (HandSelector, UploadArea)
│   │   ├── organisms/          # 복합 컴포넌트
│   │   └── templates/          # 레이아웃 템플릿
│   ├── hooks/                  # 커스텀 훅
│   ├── services/               # API 통신
│   ├── types/                  # TypeScript 타입
│   ├── utils/                  # 유틸리티
│   └── config/                 # 설정
├── docs/                       # 문서
├── public/                     # 정적 파일
└── envs/                       # 환경 설정
```

---

## 📄 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 손금 사진 업로드 페이지 (메인) |
| `/analyzing/[id]` | 분석 중 프로세스 페이지 |
| `/result/[id]` | 결과 페이지 |
| `/share/[id]` | 공유용 랜딩 페이지 |

---

## 🚀 시작하기

### 요구사항

- Node.js 20+
- pnpm 9+

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

### 환경 변수

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# AI Service
OPENAI_API_KEY=your-openai-api-key

# Redis
REDIS_URL=redis://localhost:6379
# 또는 Fly.io Redis
# REDIS_URL=redis://palmjob-redis.upstash.io:6379

# 이미지 저장 (선택적, 기본값: false)
# true로 설정하면 손바닥 이미지와 결과 카드 이미지를 Redis에 Base64로 저장
# 주의: 이미지 크기가 크므로 Redis 메모리 사용량이 증가합니다
ENABLE_IMAGE_STORAGE=false
```

---

## 📖 문서

- [CLAUDE.md](./CLAUDE.md) - AI 코딩 가이드
- [.cursorrules](./.cursorrules) - 프로젝트 규칙
- [docs/PRD.md](./docs/PRD.md) - 기획서 요약

---

## 🔒 개인정보 처리

- **손바닥 사진**: 분석 후 즉시 삭제, 저장하지 않음
- **결과 데이터**: 30일 보관 후 자동 삭제
- **개인정보 수집**: 없음 (로그인 불필요)

---

## 📄 라이선스

Private - All Rights Reserved
