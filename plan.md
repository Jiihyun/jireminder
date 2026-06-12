# 개발 계획: JihyunReminder

> **기준 문서**: spec.md  
> **작성일**: 2026-06-12  
> **원칙**: 단순한 것부터 점진적으로 — 각 Phase는 독립적으로 동작하는 완성 상태

---

## 기술 스택 결정

### Backend
| 기술 | 버전 | 선택 이유 |
|------|------|----------|
| Java | 21 (LTS) | 로컬 설치 버전, Spring Boot 3.5 공식 지원 |
| Spring Boot | 3.5.3 | 최신 공개 GA, Spring Framework 6.2 기반 |
| Spring Data JPA | (Boot 관리) | 엔티티 ↔ DB 매핑, Repository 패턴 |
| H2 Database | (Boot 관리) | 인메모리 DB, 개발/테스트용 |
| Lombok | (Boot 관리) | 보일러플레이트 제거 (`@Getter`, `@Builder` 등) |
| Gradle Kotlin DSL | 9.2.0 | 타입 안전한 빌드 스크립트 |

#### Backend 패키지 구조
```
src/main/java/jiihyun/ai/jihyunreminder/
├── domain/
│   ├── ReminderList.java        ← @Entity
│   ├── Reminder.java            ← @Entity
│   └── SubTask.java             ← @Entity
├── repository/
│   ├── ReminderListRepository.java
│   ├── ReminderRepository.java
│   └── SubTaskRepository.java
├── service/
│   ├── ReminderListService.java
│   ├── ReminderService.java
│   └── SubTaskService.java
├── controller/
│   ├── ReminderListController.java
│   ├── ReminderController.java
│   └── SubTaskController.java
└── dto/
    ├── request/
    └── response/
```

#### Backend 레이어 역할
| 레이어 | 역할 |
|--------|------|
| `Controller` | HTTP 요청 수신, DTO 변환, 응답 반환 |
| `Service` | 비즈니스 로직, 트랜잭션 경계 |
| `Repository` | JPA 쿼리, DB 접근 |
| `Domain` | 엔티티, Enum, 도메인 규칙 |
| `DTO` | 요청/응답 객체 분리 (엔티티 직접 노출 금지) |

---

### Frontend
| 기술 | 버전 | 선택 이유 |
|------|------|----------|
| Next.js | 15 (App Router) | 최신 React 서버 컴포넌트, 파일 기반 라우팅 |
| TypeScript | 5.x | 타입 안전성, IDE 지원 |
| TailwindCSS | 4.x | Apple 디자인 시스템을 CSS 변수로 빠르게 구현 |
| TanStack Query | 5.x | 서버 상태 캐싱, 낙관적 업데이트 |
| Zustand | 5.x | 선택된 목록/패널 열림 등 클라이언트 UI 상태 |
| pnpm | 최신 | 빠른 패키지 설치, 효율적 디스크 사용 |

#### Frontend 디렉토리 구조
```
frontend/
├── app/
│   ├── layout.tsx               ← 루트 레이아웃 (사이드바 포함)
│   ├── page.tsx                 ← 기본 리다이렉트 (→ /list/all)
│   └── list/
│       └── [id]/
│           └── page.tsx         ← 리마인더 목록 페이지
├── components/
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── SmartListCard.tsx
│   │   └── ListItem.tsx
│   ├── reminder/
│   │   ├── ReminderList.tsx
│   │   ├── ReminderRow.tsx
│   │   ├── ReminderInput.tsx    ← 인라인 입력
│   │   └── DetailPanel.tsx      ← 우측 상세 패널
│   └── ui/
│       ├── CircleButton.tsx     ← 완료 토글 버튼
│       ├── Toggle.tsx
│       └── ColorPicker.tsx
├── lib/
│   ├── api.ts                   ← fetch 래퍼, base URL 설정
│   └── queryClient.ts
├── hooks/
│   ├── useLists.ts
│   ├── useReminders.ts
│   └── useSubTasks.ts
├── store/
│   └── uiStore.ts               ← Zustand: 선택 목록, 패널 상태
└── types/
    └── index.ts                 ← ReminderList, Reminder, SubTask 타입
```

---

## Phase 개요

```
Phase 1  ████░░░░░░░░░░░░░░░░  BE: 목록 CRUD API
Phase 2  ████████░░░░░░░░░░░░  BE: 리마인더 기본 API (제목·완료·플래그)
Phase 3  ████████████░░░░░░░░  BE: 리마인더 고급 API (마감일·우선순위·이동)
Phase 4  ████████████████░░░░  BE: 스마트 목록·하위 태스크·검색 API
Phase 5  ████░░░░░░░░░░░░░░░░  FE: 프로젝트 셋업 + 정적 레이아웃
Phase 6  ████████░░░░░░░░░░░░  FE: 사이드바 연동 (목록 CRUD)
Phase 7  ████████████░░░░░░░░  FE: 리마인더 기본 (조회·추가·완료)
Phase 8  ████████████████░░░░  FE: 리마인더 고급 (상세 패널·하위 태스크·스마트 목록)
Phase 9  ████████████████████  FE: 검색·키보드·낙관적 업데이트·애니메이션
```

---

## Phase 1 — Backend: 목록(List) CRUD API

> **목표**: 목록을 생성·조회·수정·삭제할 수 있는 REST API 완성

### 구현 대상
```
domain/     ReminderList.java
repository/ ReminderListRepository.java
service/    ReminderListService.java
controller/ ReminderListController.java
dto/        ReminderListRequest.java / ReminderListResponse.java
```

### 엔티티 설계
```java
@Entity
public class ReminderList {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    private ListColor color;      // RED, ORANGE, YELLOW, GREEN, TEAL, BLUE, ...

    private String icon;          // 이모지 문자열

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### API 명세
| Method | Endpoint | 요청 바디 | 응답 |
|--------|----------|----------|------|
| `GET` | `/api/lists` | — | `List<ReminderListResponse>` |
| `POST` | `/api/lists` | `{ name, color, icon }` | `ReminderListResponse` |
| `PATCH` | `/api/lists/{id}` | `{ name?, color?, icon? }` | `ReminderListResponse` |
| `DELETE` | `/api/lists/{id}` | — | `204 No Content` |

### 테스트
- `ReminderListServiceTest` — 생성/수정/삭제 단위 테스트
- `ReminderListControllerTest` — `@WebMvcTest` 슬라이스 테스트

### 완료 기준
- [ ] `GET /api/lists` 빈 배열 반환
- [ ] `POST /api/lists` 생성 후 id 반환
- [ ] `PATCH /api/lists/{id}` 색상 변경 반영
- [ ] `DELETE /api/lists/{id}` 204 반환
- [ ] 존재하지 않는 id 요청 시 404 반환

---

## Phase 2 — Backend: 리마인더 기본 API

> **목표**: 리마인더의 기본 필드(제목·메모·완료·플래그)만으로 CRUD 완성

### 구현 대상
```
domain/     Reminder.java (title, memo, completed, flagged, listId)
repository/ ReminderRepository.java
service/    ReminderService.java
controller/ ReminderController.java
dto/        ReminderRequest.java / ReminderResponse.java
```

### 엔티티 설계 (이 Phase에서 사용할 필드)
```java
@Entity
public class Reminder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private ReminderList reminderList;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String memo;

    private boolean completed = false;
    private LocalDateTime completedAt;

    private boolean flagged = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### API 명세
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/reminders?listId={id}` | 특정 목록의 리마인더 조회 |
| `POST` | `/api/reminders` | 리마인더 생성 `{ listId, title, memo? }` |
| `PATCH` | `/api/reminders/{id}` | 제목·메모 수정 |
| `PATCH` | `/api/reminders/{id}/complete` | 완료/미완료 토글 |
| `PATCH` | `/api/reminders/{id}/flag` | 플래그 토글 |
| `DELETE` | `/api/reminders/{id}` | 삭제 |

### 완료 기준
- [ ] 목록별 리마인더 조회 동작
- [ ] 완료 토글 시 `completedAt` 자동 기록/초기화
- [ ] 목록 삭제 시 소속 리마인더도 함께 삭제 (Cascade)
- [ ] 미완료 리마인더와 완료된 리마인더 분리 응답 (`completed` 필드 기준)

---

## Phase 3 — Backend: 리마인더 고급 API

> **목표**: 마감일·시간, 우선순위, 목록 이동 기능 추가

### 추가 필드 (Reminder 엔티티 확장)
```java
@Enumerated(EnumType.STRING)
private Priority priority = Priority.NONE;  // NONE, LOW, MEDIUM, HIGH

private LocalDate dueDate;
private LocalTime dueTime;
```

### 추가 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| `PATCH` | `/api/reminders/{id}` | 우선순위·마감일·시간 포함 전체 수정 |
| `PATCH` | `/api/reminders/{id}/move` | `{ listId }` 목록 이동 |

### 완료 기준
- [ ] 마감일만 설정 / 마감일+시간 동시 설정 모두 동작
- [ ] 우선순위 4단계 저장 및 조회
- [ ] 목록 이동 후 조회 시 새 목록에서 조회됨

---

## Phase 4 — Backend: 스마트 목록·하위 태스크·검색 API

> **목표**: 스마트 목록 쿼리, 하위 태스크 CRUD, 전체 검색 완성

### 스마트 목록 쿼리 (`ReminderRepository`)
```java
// 오늘 마감
List<Reminder> findByDueDateAndCompletedFalse(LocalDate today);

// 예정 (마감일 있는 전체, 날짜순)
List<Reminder> findByDueDateNotNullAndCompletedFalseOrderByDueDateAsc();

// 전체 미완료
List<Reminder> findByCompletedFalse();

// 플래그됨
List<Reminder> findByFlaggedTrueAndCompletedFalse();

// 완료됨
List<Reminder> findByCompletedTrueOrderByCompletedAtDesc();
```

### 스마트 목록 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/reminders?smart=today` | 오늘 마감 |
| `GET` | `/api/reminders?smart=scheduled` | 마감일 있는 전체 |
| `GET` | `/api/reminders?smart=all` | 전체 미완료 |
| `GET` | `/api/reminders?smart=flagged` | 플래그됨 |
| `GET` | `/api/reminders?smart=completed` | 완료됨 |
| `GET` | `/api/reminders?q={keyword}` | 제목·메모 검색 |

### 스마트 목록 카운트 API (사이드바 뱃지용)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/smart-counts` | 스마트 목록별 미완료 개수 일괄 반환 |

```json
// GET /api/smart-counts 응답 예시
{
  "today": 3,
  "scheduled": 7,
  "all": 12,
  "flagged": 2,
  "completed": 5
}
```

### SubTask 엔티티 및 API
```java
@Entity
public class SubTask {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reminder_id", nullable = false)
    private Reminder reminder;

    @Column(nullable = false, length = 200)
    private String title;

    private boolean completed = false;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/reminders/{id}/subtasks` | 하위 태스크 추가 |
| `PATCH` | `/api/subtasks/{id}` | 제목 수정 |
| `PATCH` | `/api/subtasks/{id}/complete` | 완료 토글 |
| `DELETE` | `/api/subtasks/{id}` | 삭제 |

### 검색
```java
// JPQL - 제목 또는 메모에 키워드 포함
@Query("SELECT r FROM Reminder r WHERE " +
       "LOWER(r.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
       "LOWER(r.memo)  LIKE LOWER(CONCAT('%', :q, '%'))")
List<Reminder> search(@Param("q") String q);
```

### 완료 기준
- [ ] 5가지 스마트 목록 쿼리 모두 정확한 결과 반환
- [ ] `/api/smart-counts` 응답값이 실제 데이터와 일치
- [ ] 하위 태스크 CRUD 전체 동작
- [ ] 검색 대소문자 무시 동작

---

## Phase 5 — Frontend: 프로젝트 셋업 + 정적 레이아웃

> **목표**: Next.js 15 프로젝트 생성, Apple 디자인 시스템 적용, 정적 레이아웃 구현

### 프로젝트 생성
```bash
pnpm create next-app@latest frontend \
  --typescript --tailwind --app --no-src-dir \
  --import-alias "@/*"
cd frontend
pnpm add @tanstack/react-query zustand
pnpm add -D @tanstack/react-query-devtools
```

### 디자인 시스템 설정 (`app/globals.css`)
```css
:root {
  --bg-sidebar:      #F2F2F7;
  --bg-main:         #FFFFFF;
  --bg-detail:       #F9F9F9;
  --text-primary:    #1C1C1E;
  --text-secondary:  #8E8E93;
  --separator:       #E5E5EA;
  --due-overdue:     #FF3B30;
  --due-today:       #007AFF;
  font-family: -apple-system, BlinkMacSystemFont,
               'Helvetica Neue', sans-serif;
}
```

### 정적 레이아웃 구현
- `app/layout.tsx`: 사이드바(260px) + 메인(flex-1) 2컬럼 구조
- `components/sidebar/Sidebar.tsx`: 스마트 목록 카드 그리드 + 목록 섹션 (하드코딩 더미 데이터)
- `components/sidebar/SmartListCard.tsx`: 색상 카드, 숫자 표시
- 반응형 없이 데스크탑(1280px+) 고정 레이아웃

### 완료 기준
- [ ] `pnpm dev` 실행 시 사이드바 + 메인 레이아웃 렌더링
- [ ] 스마트 목록 카드 5개 (2열 그리드) 표시
- [ ] Apple 시스템 색상 토큰 적용 확인
- [ ] `http://localhost:3000` 정상 접속

---

## Phase 6 — Frontend: 사이드바 API 연동 (목록 CRUD)

> **목표**: 백엔드 API와 연동하여 목록을 실시간으로 관리

### API 클라이언트 설정
```typescript
// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}
```

### TanStack Query 훅
```typescript
// hooks/useLists.ts
export function useLists() {
  return useQuery({ queryKey: ['lists'], queryFn: () => apiFetch('/api/lists') });
}
export function useCreateList() {
  return useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries(['lists']) });
}
```

### Zustand UI 상태
```typescript
// store/uiStore.ts
interface UIState {
  selectedListId: string | null;   // 'all' | 'today' | ... | listId
  detailReminderId: number | null;
  setSelectedList: (id: string) => void;
  openDetail: (reminderId: number) => void;
  closeDetail: () => void;
}
```

### 구현 컴포넌트
- 사이드바 목록 실제 API 데이터 연동
- `+ 목록 추가` → 모달 (이름 입력 + 색상 선택 ColorPicker)
- 목록 우클릭 → 컨텍스트 메뉴 (이름 변경 / 삭제)
- 스마트 목록 카드 숫자: `/api/smart-counts` 연동

### 완료 기준
- [ ] 목록 생성 → 사이드바 즉시 반영
- [ ] 목록 이름/색상 수정 → 즉시 반영
- [ ] 목록 삭제 → 사이드바에서 제거
- [ ] 스마트 목록 카드에 실제 카운트 표시

---

## Phase 7 — Frontend: 리마인더 기본 (조회·추가·완료·플래그)

> **목표**: 리마인더 목록 표시, 인라인 추가, 완료/플래그 토글

### 핵심 컴포넌트

#### `ReminderRow.tsx`
```
  ○  제목 텍스트                       🚩  [ⓘ]
     메모 (1줄 truncate, text-secondary)
```
- 원형 버튼(`CircleButton`): 목록 색상, 클릭 시 완료 처리
- hover 시 🚩·[ⓘ] 버튼 노출
- 완료 항목: 제목 strikethrough + text-secondary

#### `ReminderInput.tsx`
```
  ○  |새로운 리마인더 입력...
```
- `+ 새로운 리마인더` 클릭 → 인라인 input 활성화
- `Enter` → POST 후 다음 입력 대기
- `Escape` → 취소

### 완료 처리 애니메이션
```typescript
// 300ms: 체크마크 fill → strikethrough
// +300ms: opacity 0 → 목록에서 제거
const handleComplete = (id: number) => {
  setAnimatingId(id);   // CSS transition 트리거
  setTimeout(() => mutate(id), 600);
};
```

### 완료 기준
- [ ] 선택한 목록의 리마인더 목록 표시
- [ ] 인라인 입력으로 리마인더 추가
- [ ] 완료 버튼 클릭 시 애니메이션 후 목록에서 페이드아웃
- [ ] 플래그 토글 (주황 🚩)
- [ ] 목록 하단 "완료됨 N개" 접기/펼치기 섹션

---

## Phase 8 — Frontend: 상세 패널·하위 태스크·스마트 목록

> **목표**: 상세 패널에서 모든 필드 편집, 하위 태스크 관리, 스마트 목록 뷰

### 상세 패널 (`DetailPanel.tsx`)
- [ⓘ] 클릭 시 우측에서 슬라이드-인 (CSS `translate-x`, 280ms ease)
- 필드: 제목, 메모, 날짜 토글, 시간 토글, 플래그, 우선순위 드롭다운, 목록 이동
- 하위 태스크 섹션: 목록 + `+ 태스크 추가` 인라인 입력

```tsx
// 슬라이드 애니메이션
<div className={`
  fixed right-0 top-0 h-full w-[360px] bg-[--bg-detail]
  transform transition-transform duration-[280ms] ease-out
  ${isOpen ? 'translate-x-0' : 'translate-x-full'}
`}>
```

### 하위 태스크 (`SubTaskRow.tsx`)
- 부모 리마인더 대비 `pl-8` 들여쓰기
- `Tab` 키: 현재 입력 중인 리마인더를 하위 태스크로 변환
- 완료 원형 버튼 18px (부모 22px보다 작게)

### 스마트 목록 뷰
- `smart=today`: 날짜 그룹 없이 단일 목록
- `smart=scheduled`: 날짜별 섹션 그룹핑 ("오늘", "내일", "이번 주", "다음 주", "이후")
- `smart=all/flagged/completed`: 목록 이름 서브라벨 표시

### 완료 기준
- [ ] 상세 패널 슬라이드-인/아웃 애니메이션
- [ ] 패널에서 제목 수정 → 목록 즉시 반영
- [ ] 마감일/시간 토글 및 날짜 피커
- [ ] 하위 태스크 추가·완료·삭제
- [ ] 5가지 스마트 목록 뷰 동작

---

## Phase 9 — Frontend: 검색·키보드·낙관적 업데이트·애니메이션

> **목표**: 전체 기능 완성 및 UX 품질 완성

### 검색
- 사이드바 상단 검색창: 타이핑 시 `debounce(300ms)` → `/api/reminders?q=`
- 검색 결과: 일치하는 키워드 **bold** 하이라이트
- 빈 검색어 시 원래 뷰로 복귀

### 낙관적 업데이트 (TanStack Query)
```typescript
// 완료 토글 — 서버 응답 전 UI 먼저 반영
useMutation({
  mutationFn: toggleComplete,
  onMutate: async (id) => {
    await queryClient.cancelQueries(['reminders']);
    const prev = queryClient.getQueryData(['reminders']);
    queryClient.setQueryData(['reminders'], (old) =>
      old.map(r => r.id === id ? { ...r, completed: !r.completed } : r)
    );
    return { prev };
  },
  onError: (_, __, ctx) => queryClient.setQueryData(['reminders'], ctx.prev),
});
```

### 키보드 단축키
```typescript
// hooks/useKeyboard.ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') { /* 검색 포커스 */ }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') { /* 상세 패널 토글 */ }
    if (e.key === 'Escape') { /* 패널 닫기 / 편집 취소 */ }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

### 애니메이션 마무리
| 요소 | 구현 |
|------|------|
| 스마트 카드 hover | `hover:scale-[1.02] transition-transform duration-150` |
| 목록 항목 선택 | `transition-colors duration-100` |
| 완료 체크마크 | SVG stroke-dashoffset 애니메이션 |
| 리마인더 추가 | `animate-slide-down` (위에서 아래로) |
| 리마인더 삭제/완료 | `animate-fade-out` (opacity 0 + height 0) |

### 반응형 (Tablet 768px~1279px)
- 사이드바 숨김 → 상단 햄버거 메뉴로 드로어(Drawer) 전환
- 상세 패널 → 전체 화면 오버레이 모달

### 완료 기준
- [ ] 검색창 입력 시 실시간 필터링
- [ ] 완료 토글 낙관적 업데이트 (서버 응답 전 즉시 반영)
- [ ] `Cmd+F`, `Cmd+I`, `Escape` 단축키 동작
- [ ] 모든 애니메이션 자연스럽게 동작
- [ ] 태블릿 레이아웃 정상 동작

---

## CORS 설정 (BE ↔ FE 연동 시)

```java
// Spring Boot - WebMvcConfigurer
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PATCH", "DELETE");
    }
}
```

---

## 환경 변수

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 실행 방법

```bash
# Backend
./gradlew bootRun          # http://localhost:8080
                           # H2 Console: http://localhost:8080/h2-console

# Frontend (Phase 5 이후)
cd frontend
pnpm dev                   # http://localhost:3000
```

---

## 체크리스트 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | BE: 목록 CRUD API | ⬜ |
| 2 | BE: 리마인더 기본 API | ⬜ |
| 3 | BE: 리마인더 고급 API (마감일·우선순위) | ⬜ |
| 4 | BE: 스마트 목록·하위 태스크·검색 API | ⬜ |
| 5 | FE: Next.js 셋업 + 정적 레이아웃 | ⬜ |
| 6 | FE: 사이드바 API 연동 (목록 CRUD) | ⬜ |
| 7 | FE: 리마인더 기본 (조회·추가·완료·플래그) | ⬜ |
| 8 | FE: 상세 패널·하위 태스크·스마트 목록 | ⬜ |
| 9 | FE: 검색·키보드·낙관적 업데이트·애니메이션 | ⬜ |
