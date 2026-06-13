# JihyunReminder

Apple Reminders 앱을 모티브로 한 웹 기반 태스크 관리 앱입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Backend** | Spring Boot 3.5.3, Java 21, JPA (H2 인메모리), Gradle Kotlin DSL |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, TanStack Query v5, Zustand v5 |

## 실행 방법

### 사전 요건

- Java 21+
- Node.js 20+ (v23 권장)
- pnpm 9 (`npm install -g pnpm@9`)

### 1. 백엔드 실행

```bash
# 프로젝트 루트에서
cd jihyunreminder   # 또는 프로젝트 루트
./gradlew bootRun
```

서버가 `http://localhost:8080` 에서 시작됩니다.

### 2. 프론트엔드 실행

```bash
cd frontend
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

### 동시 실행 (터미널 2개)

```bash
# 터미널 1 — 백엔드
./gradlew bootRun

# 터미널 2 — 프론트엔드
cd frontend && pnpm dev
```

## 주요 기능

- **목록 관리**: 목록 생성/수정/삭제, 색상 및 이모지 설정
- **리마인더 CRUD**: 제목, 메모, 마감일/시간, 우선순위
- **스마트 목록**: 오늘, 예정, 전체, 플래그됨, 완료됨
- **상세 패널**: 우측 슬라이드-인 패널에서 모든 속성 편집
- **하위 태스크**: 리마인더 내 체크리스트
- **검색**: 제목/메모 대소문자 무시 검색 + 결과 하이라이트
- **키보드 단축키**:
  - `Cmd/Ctrl + F` → 검색창 포커스
  - `Cmd/Ctrl + I` → 상세 패널 닫기
  - `Escape` → 상세 패널 닫기 / 검색 초기화
- **낙관적 업데이트**: 완료·플래그 토글, 생성/삭제 즉시 반영
- **반응형**: 모바일 햄버거 메뉴 + 드로어 사이드바

## API 문서

`openapi.yml` 파일을 참조하거나 [Swagger Editor](https://editor.swagger.io/) 에 붙여넣어 확인하세요.

## 환경 변수

`frontend/.env.local` 파일을 생성하고 아래 내용을 추가합니다:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> ⚠️ `.env.local` 은 `.gitignore`에 포함되어 있어 저장소에 커밋되지 않습니다.
