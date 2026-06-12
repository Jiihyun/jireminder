# PRD: JihyunReminder — Apple Reminder 웹 버전

> **버전**: v0.2  
> **작성일**: 2026-06-12  
> **상태**: 리뷰 대기 중

---

## 1. 개요 (Overview)

### 1.1 배경
Apple Reminder는 iOS/macOS에서만 최적의 경험을 제공한다. 플랫폼에 관계없이 브라우저에서 동일한 UX를 제공하는 웹 버전이 없어, 크로스 플랫폼 사용자에게 불편함이 존재한다.

### 1.2 목표
Apple Reminder의 핵심 기능을 웹에서 동일하게 경험할 수 있는 서비스를 개발한다.

### 1.3 범위
| 구분 | 내용 |
|------|------|
| **In Scope** | 리마인더 CRUD, 목록 관리, 우선순위, 마감일, 하위 태스크, 스마트 목록, 검색 |
| **Out of Scope** | 위치 기반 알림, 사용자 인증/회원가입, 모바일 앱, Apple 계정 연동 |

---

## 2. 사용자 스토리 (User Stories)

### 📋 목록 (List) 관리
- `US-01` 사용자는 리마인더를 그룹화할 **목록**을 생성/수정/삭제할 수 있다
- `US-02` 사용자는 목록에 **색상**과 **아이콘**을 지정할 수 있다
- `US-03` 사용자는 목록의 리마인더 **개수**를 확인할 수 있다

### ✅ 리마인더 (Reminder) 관리
- `US-04` 사용자는 특정 목록에 리마인더를 **추가**할 수 있다
- `US-05` 사용자는 리마인더의 **제목**, **메모**, **마감일/시간**, **우선순위**를 설정할 수 있다
- `US-06` 사용자는 리마인더를 **완료** 처리하거나 되돌릴 수 있다
- `US-07` 사용자는 리마인더에 **하위 태스크**를 추가할 수 있다
- `US-08` 사용자는 리마인더에 **플래그(중요 표시)** 를 설정할 수 있다
- `US-09` 사용자는 리마인더를 **다른 목록으로 이동**할 수 있다
- `US-10` 사용자는 완료된 리마인더를 **삭제**할 수 있다

### 🔍 스마트 목록 (Smart List)
- `US-11` **오늘** — 오늘 마감인 리마인더를 모아볼 수 있다
- `US-12` **예정** — 마감일이 설정된 전체 리마인더를 날짜순으로 볼 수 있다
- `US-13` **전체** — 모든 미완료 리마인더를 한눈에 볼 수 있다
- `US-14` **플래그됨** — 플래그가 설정된 리마인더만 볼 수 있다
- `US-15` **완료됨** — 완료 처리된 리마인더를 볼 수 있다

### 🔎 검색
- `US-16` 사용자는 리마인더 제목/메모로 **전체 검색**을 할 수 있다

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 목록 (List)
| ID | 요구사항 |
|----|---------|
| FR-L01 | 목록 이름은 필수값이며 최대 50자 |
| FR-L02 | 목록 색상은 사전 정의된 10가지 색상 중 선택 |
| FR-L03 | 목록 삭제 시 하위 리마인더도 함께 삭제 (Cascade) |
| FR-L04 | 목록은 사이드바에 항상 노출되며 리마인더 미완료 개수 표시 |

### 3.2 리마인더 (Reminder)
| ID | 요구사항 |
|----|---------|
| FR-R01 | 제목은 필수값이며 최대 200자 |
| FR-R02 | 메모는 선택값이며 최대 1000자 |
| FR-R03 | 우선순위는 `없음 / 낮음 / 보통 / 높음` 4단계 |
| FR-R04 | 마감일은 날짜만 설정하거나 날짜+시간 모두 설정 가능 |
| FR-R05 | 완료 시 completedAt 타임스탬프 기록 |
| FR-R06 | 플래그는 boolean 값으로 토글 처리 |
| FR-R07 | 목록에 속하지 않는 리마인더는 기본 목록("리마인더")에 귀속 |

### 3.3 하위 태스크 (Sub-task)
| ID | 요구사항 |
|----|---------|
| FR-S01 | 하위 태스크는 리마인더에 N개 추가 가능 |
| FR-S02 | 하위 태스크는 제목과 완료 여부만 관리 (마감일/우선순위 없음) |
| FR-S03 | 부모 리마인더 완료 시 하위 태스크는 독립 상태 유지 |

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

| 구분 | 요구사항 |
|------|---------|
| **성능** | API 응답시간 200ms 이하 (p95) |
| **UI 반응성** | 리마인더 완료 처리는 낙관적 업데이트(Optimistic Update)로 즉각 반영 |
| **접근성** | 키보드만으로 전체 조작 가능 (a11y) |
| **반응형** | 데스크탑(1280px+) / 태블릿(768px+) 레이아웃 지원 |

---

## 5. 시스템 아키텍처

```
┌─────────────────┐        REST API        ┌──────────────────────┐
│   Next.js 15    │  ──────────────────▶   │  Spring Boot 3.5.3   │
│   (Port 3000)   │  ◀──────────────────   │  (Port 8080)         │
│                 │       JSON             │                      │
│  - App Router   │                        │  - REST Controller   │
│  - TailwindCSS  │                        │  - Service Layer     │
│  - TanStack     │                        │  - JPA Repository    │
│    Query        │                        │  - H2 Database       │
└─────────────────┘                        └──────────────────────┘
```

---

## 6. 데이터 모델 (ERD)

```
ReminderList (목록)
├── id           BIGINT PK
├── name         VARCHAR(50)  NOT NULL
├── color        VARCHAR(20)  DEFAULT 'BLUE'
├── icon         VARCHAR(50)
├── createdAt    TIMESTAMP
└── updatedAt    TIMESTAMP

Reminder (리마인더)
├── id           BIGINT PK
├── listId       BIGINT FK → ReminderList.id
├── title        VARCHAR(200) NOT NULL
├── memo         VARCHAR(1000)
├── priority     ENUM(NONE, LOW, MEDIUM, HIGH) DEFAULT NONE
├── dueDate      DATE
├── dueTime      TIME
├── flagged      BOOLEAN DEFAULT FALSE
├── completed    BOOLEAN DEFAULT FALSE
├── completedAt  TIMESTAMP
├── createdAt    TIMESTAMP
└── updatedAt    TIMESTAMP

SubTask (하위 태스크)
├── id           BIGINT PK
├── reminderId   BIGINT FK → Reminder.id
├── title        VARCHAR(200) NOT NULL
├── completed    BOOLEAN DEFAULT FALSE
├── createdAt    TIMESTAMP
└── updatedAt    TIMESTAMP
```

---

## 7. API 설계 (REST Endpoints)

### 목록 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/lists` | 전체 목록 조회 |
| `POST` | `/api/lists` | 목록 생성 |
| `PATCH` | `/api/lists/{id}` | 목록 수정 |
| `DELETE` | `/api/lists/{id}` | 목록 삭제 |

### 리마인더 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/reminders?listId=&smart=` | 리마인더 목록 조회 |
| `POST` | `/api/reminders` | 리마인더 생성 |
| `PATCH` | `/api/reminders/{id}` | 리마인더 수정 |
| `PATCH` | `/api/reminders/{id}/complete` | 완료/미완료 토글 |
| `PATCH` | `/api/reminders/{id}/flag` | 플래그 토글 |
| `DELETE` | `/api/reminders/{id}` | 리마인더 삭제 |

### 하위 태스크 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/reminders/{id}/subtasks` | 하위 태스크 추가 |
| `PATCH` | `/api/subtasks/{id}` | 하위 태스크 수정 |
| `PATCH` | `/api/subtasks/{id}/complete` | 완료 토글 |
| `DELETE` | `/api/subtasks/{id}` | 하위 태스크 삭제 |

### 스마트 목록 / 검색
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/reminders?smart=today` | 오늘 마감 |
| `GET` | `/api/reminders?smart=scheduled` | 예정 (마감일 있는 전체) |
| `GET` | `/api/reminders?smart=all` | 전체 미완료 |
| `GET` | `/api/reminders?smart=flagged` | 플래그됨 |
| `GET` | `/api/reminders?smart=completed` | 완료됨 |
| `GET` | `/api/reminders?q={keyword}` | 제목/메모 검색 |

---

## 8. UI/UX 설계 (Apple Reminders 준거)

### 8.1 전체 레이아웃

```
┌────────────────────────────────────────────────────────────────────────┐
│  사이드바 (260px, 고정)         │  메인 콘텐츠 (flex-1)   │ 상세 패널(360px) │
│  bg: #F2F2F7                  │  bg: #FFFFFF           │ bg: #F9F9F9    │
│                                │                        │  (선택 시 표시)  │
│  🔍 검색창                     │  [목록 제목 — 파란색]    │                │
│                                │                        │  ○ 제목         │
│  ┌─────────┐  ┌─────────┐     │  ○ 리마인더 제목    [ⓘ] │                │
│  │☀️ 오늘  │  │📅 예정  │     │    메모 미리보기         │  📅 날짜/시간   │
│  │       3 │  │       7 │     │    📅 6/12  🔴 !!!      │  🔔 알림        │
│  └─────────┘  └─────────┘     │                        │  🚩 우선순위    │
│  ┌─────────┐  ┌─────────┐     │  ○ 리마인더 제목 2   🚩 │  📋 목록 이동   │
│  │📋 전체  │  │🚩플래그 │     │    📅 6/15             │                │
│  │      12 │  │       2 │     │                        │  [하위 태스크]  │
│  └─────────┘  └─────────┘     │  ○ 리마인더 제목 3   [ⓘ] │  ○ 서브태스크1 │
│  ┌──────────────────────┐     │    └ ○ 서브태스크       │  ○ 서브태스크2 │
│  │  ✅ 완료됨          5 │     │    └ ○ 서브태스크       │  + 태스크 추가  │
│  └──────────────────────┘     │                        │                │
│                                │  + 새로운 리마인더       │                │
│  ─────── 나의 목록 ──────      │                        │                │
│  🔵 개인                   4  │                        │                │
│  🟢 업무                   8  │                        │                │
│  🟡 쇼핑                   2  │                        │                │
│                                │                        │                │
│  + 목록 추가                   │                        │                │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 8.2 디자인 시스템

#### 색상 팔레트 (Apple System Colors)
| 토큰 | Hex | 용도 |
|------|-----|------|
| `--bg-sidebar` | `#F2F2F7` | 사이드바 배경 |
| `--bg-main` | `#FFFFFF` | 메인 콘텐츠 배경 |
| `--bg-detail` | `#F9F9F9` | 상세 패널 배경 |
| `--text-primary` | `#1C1C1E` | 기본 텍스트 |
| `--text-secondary` | `#8E8E93` | 보조 텍스트, 완료된 항목 |
| `--separator` | `#E5E5EA` | 구분선 |
| `--due-overdue` | `#FF3B30` | 기한 초과 날짜 |
| `--due-today` | `#007AFF` | 오늘 기한 날짜 |

#### 목록 색상 (10가지 선택지)
| 이름 | Hex | 이름 | Hex |
|------|-----|------|-----|
| 빨강 | `#FF3B30` | 파랑 | `#007AFF` |
| 주황 | `#FF9500` | 남색 | `#5856D6` |
| 노랑 | `#FFCC00` | 보라 | `#AF52DE` |
| 초록 | `#34C759` | 분홍 | `#FF2D55` |
| 하늘 | `#5AC8FA` | 갈색 | `#A2845E` |

#### 타이포그래피
| 요소 | 크기 | 굵기 |
|------|------|------|
| 목록 제목(헤더) | 28px | 700 (Bold) |
| 스마트카드 숫자 | 28px | 700 (Bold) |
| 리마인더 제목 | 15px | 400 (Regular) |
| 메모 미리보기 | 13px | 400 (Regular) |
| 날짜/뱃지 | 12px | 400 (Regular) |
| 폰트 패밀리 | `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif` | |

---

### 8.3 컴포넌트 상세

#### 스마트 목록 카드 (Smart List Card)
```
┌─────────────────────┐
│ ☀️                  │  ← 아이콘 (좌상단, 24px)
│                     │
│                     │
│ 오늘            3   │  ← 라벨(좌하단 13px) + 숫자(우하단 28px Bold)
└─────────────────────┘
  rounded-2xl, 배경색: 목록별 색상의 10% opacity
  hover: scale(1.02), shadow 강화
  active(선택): 테두리 2px solid 해당 색상
```

- 2열 그리드 배치 (오늘·예정 / 전체·플래그됨)
- 완료됨은 전체 너비 1열로 단독 배치 (Apple과 동일)

#### 사이드바 목록 아이템
```
  🔵  개인                  4
  ↑    ↑                    ↑
  12px  15px Regular        13px gray badge
  색상원 목록명              미완료 개수
```
- hover 시 배경 `#E5E5EA` (회색 pill)
- 선택 시 배경 `#D1D1D6`
- 우클릭 → 컨텍스트 메뉴 (이름 변경 / 색상 변경 / 목록 삭제)

#### 리마인더 행 (Reminder Row)
```
  ○  리마인더 제목                         🚩  [ⓘ]
     메모 미리보기 (1줄 truncate)
     📅 6월 15일 오전 9:00
```
- `○` : 목록 색상의 원형 버튼 (22px)
  - hover: 내부 색상 fill (30% opacity)
  - 완료 클릭: 체크마크 애니메이션 → 제목에 strikethrough → 0.3s 후 목록에서 페이드아웃
- 우선순위 뱃지: `!` (낮음, gray) / `!!` (보통, blue) / `!!!` (높음, red) — 제목 좌측
- 🚩 플래그: hover 시만 노출, 설정되면 항상 노출 (주황색)
- [ⓘ] 상세버튼: hover 시만 노출
- 기한 초과: 날짜 텍스트 `#FF3B30` 빨간색
- 완료된 항목: 별도 섹션 "완료됨 N개" 접힌 상태로 하단 표시

#### 하위 태스크 (Sub-task Row)
```
     ○  하위 태스크 제목
```
- 부모 리마인더 대비 `padding-left: 32px` 들여쓰기
- 원형 버튼은 더 작게 (18px)

#### 새 리마인더 입력
```
  ○  |새로운 리마인더 입력...
```
- 목록 하단 `+ 새로운 리마인더` 클릭 시 인라인 입력 활성화
- 모달 없이 즉시 타이핑 가능 (Apple과 동일)
- `Enter` → 저장 후 다음 행 입력 대기
- `Escape` → 입력 취소
- `Tab` → 하위 태스크로 변환

#### 상세 패널 (Detail Panel)
- 우측에서 슬라이드-인 (translate-x animation, 280ms ease)
- [ⓘ] 버튼 클릭 또는 리마인더 우클릭 → "정보 보기"로 열기
```
  ┌─ 상세 패널 ─────────────────┐
  │  [제목 편집 input]           │
  │  [메모 textarea]             │
  │                              │
  │  📅 날짜     [OFF ●──]      │
  │     └ 2026년 6월 15일        │
  │  ⏰ 시간     [OFF ●──]      │
  │     └ 오전 9:00              │
  │                              │
  │  🚩 플래그   [OFF ●──]      │
  │  ❗ 우선순위  [없음 ▼]       │
  │  📋 목록      [개인  ▼]      │
  │                              │
  │  ─── 하위 태스크 ────────    │
  │  ○ 서브태스크 제목           │
  │  + 태스크 추가               │
  └──────────────────────────────┘
```

---

### 8.4 인터랙션 & 애니메이션

| 트리거 | 동작 | 애니메이션 |
|--------|------|-----------|
| 완료 버튼 클릭 | 체크마크 채우기 → strikethrough → 페이드아웃 | 300ms ease-out |
| 목록 선택 | 메인 영역 콘텐츠 교체 | 150ms fade |
| 상세 패널 열기 | 우측에서 슬라이드-인 | 280ms ease |
| 상세 패널 닫기 | 우측으로 슬라이드-아웃 | 200ms ease |
| 스마트카드 hover | 살짝 확대 | scale(1.02), 150ms |
| 리마인더 행 hover | 배경색 변경 + ⓘ · 🚩 아이콘 노출 | 100ms |
| 목록 추가 모달 | 중앙 팝업 (색상·아이콘 선택 포함) | 200ms scale-in |

---

### 8.5 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Enter` | 새 리마인더 추가 / 현재 항목 저장 후 다음 |
| `Tab` | 현재 리마인더를 하위 태스크로 변환 |
| `Shift+Tab` | 하위 태스크를 상위로 내보내기 |
| `Escape` | 편집 취소 / 패널 닫기 |
| `Space` | 선택된 리마인더 완료 토글 |
| `Cmd+Backspace` | 리마인더 삭제 |
| `Cmd+I` | 상세 패널 열기/닫기 |
| `Cmd+F` | 검색창 포커스 |

---

### 8.6 반응형 레이아웃

| 브레이크포인트 | 레이아웃 |
|--------------|---------|
| `≥ 1280px` (Desktop) | 사이드바 + 메인 + 상세 패널 3-column |
| `768px ~ 1279px` (Tablet) | 사이드바 + 메인 2-column, 상세 패널은 오버레이 |
| `< 768px` | 미지원 (Out of Scope) |

---

## 9. 개발 마일스톤

### Phase 1 — Backend API (우선 개발)
- [ ] 도메인 엔티티 및 JPA 설정 (`ReminderList`, `Reminder`, `SubTask`)
- [ ] Repository / Service / Controller 구현
- [ ] 스마트 목록 쿼리 구현
- [ ] 검색 기능 구현
- [ ] API 테스트 작성

### Phase 2 — Frontend 기본 구조
- [ ] Next.js 15 프로젝트 생성 (App Router)
- [ ] 레이아웃 구현 (사이드바 + 메인)
- [ ] TanStack Query 연동
- [ ] 목록 CRUD UI

### Phase 3 — 리마인더 핵심 기능
- [ ] 리마인더 목록/생성/완료 UI
- [ ] 리마인더 상세 편집 패널
- [ ] 하위 태스크 UI
- [ ] 스마트 목록 뷰

### Phase 4 — 완성도
- [ ] 검색 기능 UI
- [ ] 낙관적 업데이트 (Optimistic Update) 적용
- [ ] 키보드 단축키 지원
- [ ] 반응형 레이아웃

---

## 10. 기술 스택 정리

| 영역 | 기술 |
|------|------|
| **Backend** | Spring Boot 3.5.3, Spring Data JPA, H2, Lombok |
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS |
| **상태관리** | TanStack Query (서버 상태), Zustand (클라이언트 상태) |
| **빌드** | Gradle Kotlin DSL (BE), pnpm (FE) |

---

> 📝 **리뷰 포인트**
> 1. 스마트 목록 종류가 추가/제거될 항목이 있나요?
> 2. 하위 태스크에 마감일 등 추가 필드가 필요한가요?
> 3. 반복 리마인더(매일/매주) 기능이 MVP에 포함되어야 하나요?
> 4. 프론트엔드 상태관리 라이브러리(Zustand) 선호도가 있으신가요?
