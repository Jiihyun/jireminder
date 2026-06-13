# Tasks: JihyunReminder 구현 세부 작업

> **기준 문서**: plan.md  
> **작성일**: 2026-06-12  
> **규칙**: 위에서 아래 순서대로 진행, 각 항목은 독립적으로 커밋 가능한 단위

---

## Phase 1 — BE: 목록(List) CRUD API

### 공통 기반
- [x] `dto/request/`, `dto/response/` 패키지 디렉토리 생성
- [x] `NotFoundException` 커스텀 예외 클래스 생성 (`404`)
- [x] `GlobalExceptionHandler` (`@RestControllerAdvice`) 생성
  - [x] `NotFoundException` → `404` 응답 처리
  - [x] `MethodArgumentNotValidException` → `400` 응답 처리

### 도메인
- [x] `ListColor` Enum 생성
  - [x] 값: `RED, ORANGE, YELLOW, GREEN, TEAL, BLUE, INDIGO, PURPLE, PINK, BROWN`
- [x] `ReminderList` 엔티티 생성
  - [x] `@Entity`, `@Table(name = "reminder_list")`
  - [x] `id` — `@Id @GeneratedValue(IDENTITY)`
  - [x] `name` — `@Column(nullable = false, length = 50)`
  - [x] `color` — `@Enumerated(EnumType.STRING)`
  - [x] `icon` — `String` (이모지)
  - [x] `createdAt`, `updatedAt` — 생성/수정 로직에서 직접 설정
  - [x] Lombok: `@Getter @NoArgsConstructor(PROTECTED)`

### Repository
- [x] `ReminderListRepository` 생성 (`JpaRepository<ReminderList, Long>`)

### DTO
- [x] `ReminderListRequest` 생성 (`name`, `color`, `icon`, `@NotBlank` 검증)
- [x] `ReminderListResponse` 생성 (`id`, `name`, `color`, `icon`, `createdAt`)
  - [x] 정적 팩토리 메서드 `from(ReminderList)` 추가

### Service
- [x] `ReminderListService` 생성
  - [x] `findAll()` — 전체 목록 조회
  - [x] `create(ReminderListRequest)` — 생성
  - [x] `update(Long id, ReminderListRequest)` — 수정 (존재하지 않으면 예외)
  - [x] `delete(Long id)` — 삭제 (존재하지 않으면 예외)

### Controller
- [x] `ReminderListController` 생성 (`@RestController`, `@RequestMapping("/api/lists")`)
  - [x] `GET /api/lists` → `findAll()`
  - [x] `POST /api/lists` → `create()` (`201 Created`)
  - [x] `PATCH /api/lists/{id}` → `update()`
  - [x] `DELETE /api/lists/{id}` → `delete()` (`204 No Content`)

### 테스트
- [x] `ReminderListServiceTest` 단위 테스트
  - [x] 목록 생성 성공
  - [x] 존재하지 않는 id 수정 시 예외
  - [x] 존재하지 않는 id 삭제 시 예외
- [x] `ReminderListControllerTest` (RestAssured) 통합 테스트
  - [x] `GET /api/lists` — 200 OK, 빈 배열
  - [x] `POST /api/lists` — 201, id 포함 응답
  - [x] `PATCH /api/lists/{id}` — 200, 변경값 반영
  - [x] `DELETE /api/lists/{id}` — 204
  - [x] `DELETE /api/lists/999` — 404

---

## Phase 2 — BE: 리마인더 기본 API

### 도메인
- [x] `Reminder` 엔티티 생성
  - [x] `id` — `@Id @GeneratedValue(IDENTITY)`
  - [x] `reminderList` — `@ManyToOne(fetch = LAZY)`, `@JoinColumn(name = "list_id")`
  - [x] `title` — `@Column(nullable = false, length = 200)`
  - [x] `memo` — `@Column(length = 1000)`
  - [x] `completed` — `boolean`, 기본값 `false`
  - [x] `completedAt` — `LocalDateTime`
  - [x] `flagged` — `boolean`, 기본값 `false`
  - [x] `createdAt`, `updatedAt` — 생성/수정 로직에서 직접 설정
  - [x] Lombok: `@Getter @NoArgsConstructor(PROTECTED)`
- [x] `ReminderList` 엔티티에 `@OneToMany(cascade = ALL, orphanRemoval = true)` 추가

### Repository
- [x] `ReminderRepository` 생성
  - [x] `findByReminderListIdAndCompletedFalseOrderByCreatedAtAsc(Long listId)`
  - [x] `findByReminderListIdAndCompletedTrueOrderByCompletedAtDesc(Long listId)`

### DTO
- [x] `ReminderCreateRequest` 생성 (`listId`, `title`, `memo?`, `@NotBlank` 검증)
- [x] `ReminderUpdateRequest` 생성 (`title?`, `memo?`)
- [x] `ReminderResponse` 생성
  - [x] `id`, `listId`, `title`, `memo`, `completed`, `completedAt`, `flagged`, `createdAt`
  - [x] 정적 팩토리 메서드 `from(Reminder)` 추가

### Service
- [x] `ReminderService` 생성
  - [x] `findByListId(Long listId)` — 미완료/완료 분리 응답
  - [x] `create(ReminderCreateRequest)` — 생성 (listId 유효성 확인)
  - [x] `update(Long id, ReminderUpdateRequest)` — 제목·메모 수정
  - [x] `toggleComplete(Long id)` — `completed` 반전, `completedAt` 자동 기록/초기화
  - [x] `toggleFlag(Long id)` — `flagged` 반전
  - [x] `delete(Long id)` — 삭제

### Controller
- [x] `ReminderController` 생성 (`@RequestMapping("/api/reminders")`)
  - [x] `GET /api/reminders?listId={id}` → `findByListId()`
  - [x] `POST /api/reminders` → `create()` (`201`)
  - [x] `PATCH /api/reminders/{id}` → `update()`
  - [x] `PATCH /api/reminders/{id}/complete` → `toggleComplete()`
  - [x] `PATCH /api/reminders/{id}/flag` → `toggleFlag()`
  - [x] `DELETE /api/reminders/{id}` → `delete()` (`204`)

### 테스트
- [x] `ReminderServiceTest` 단위 테스트
  - [x] 리마인더 생성 성공
  - [x] 완료 토글: `completedAt` 기록
  - [x] 완료 → 미완료 토글: `completedAt` null 초기화
  - [x] 플래그 토글
- [x] `ReminderControllerTest` 슬라이스 테스트
  - [x] 목록별 조회
  - [x] 생성 → 201
  - [x] 완료 토글
  - [x] 플래그 토글
  - [x] 삭제 → 204

---

## Phase 3 — BE: 리마인더 고급 API

### 도메인
- [x] `Priority` Enum 생성 (`NONE, LOW, MEDIUM, HIGH`)
- [x] `Reminder` 엔티티 필드 추가
  - [x] `priority` — `@Enumerated(EnumType.STRING)`, 기본값 `NONE`
  - [x] `dueDate` — `LocalDate`
  - [x] `dueTime` — `LocalTime`

### DTO
- [x] `ReminderUpdateRequest`에 `priority`, `dueDate`, `dueTime` 추가
- [x] `ReminderResponse`에 `priority`, `dueDate`, `dueTime` 추가
- [x] `ReminderMoveRequest` 생성 (`listId`)

### Service
- [x] `ReminderService.update()` 확장 — `priority`, `dueDate`, `dueTime` 처리
- [x] `ReminderService.move(Long id, Long listId)` — 목록 이동

### Controller
- [x] `PATCH /api/reminders/{id}/move` 엔드포인트 추가

### 테스트
- [x] 마감일만 설정 / 마감일+시간 동시 설정
- [x] 우선순위 4단계 저장 및 조회
- [x] 목록 이동 후 새 목록에서 조회 확인

---

## Phase 4 — BE: 스마트 목록·하위 태스크·검색 API

### 스마트 목록 쿼리
- [x] `ReminderRepository`에 스마트 목록 메서드 추가
  - [x] `findByDueDateAndCompletedFalse(LocalDate today)` — 오늘 마감
  - [x] `findByDueDateNotNullAndCompletedFalseOrderByDueDateAsc()` — 예정
  - [x] `findByCompletedFalse()` — 전체 미완료
  - [x] `findByFlaggedTrueAndCompletedFalse()` — 플래그됨
  - [x] `findByCompletedTrueOrderByCompletedAtDesc()` — 완료됨
  - [x] `@Query` JPQL 검색 메서드 (title, memo 대소문자 무시)
- [x] `ReminderController`에 `smart`, `q` 쿼리 파라미터 분기 처리 추가
- [x] `SmartCountResponse` DTO 생성 (`today`, `scheduled`, `all`, `flagged`, `completed`)
- [x] `SmartCountService` 생성 — 각 스마트 목록 카운트 일괄 조회
- [x] `SmartCountController` 생성 (`GET /api/smart-counts`)

### 하위 태스크
- [x] `SubTask` 엔티티 생성
  - [x] `id`, `title`, `completed`, `createdAt`, `updatedAt`
  - [x] `reminder` — `@ManyToOne(fetch = LAZY)`, `@JoinColumn(name = "reminder_id")`
  - [x] Lombok: `@Getter @NoArgsConstructor(PROTECTED)`
- [x] `Reminder` 엔티티에 `@OneToMany(cascade = ALL, orphanRemoval = true)` SubTask 추가
- [x] `SubTaskRepository` 생성 (`JpaRepository<SubTask, Long>`)
- [x] `SubTaskRequest` DTO (`title`, `@NotBlank`)
- [x] `SubTaskResponse` DTO (`id`, `reminderId`, `title`, `completed`, `createdAt`)
  - [x] `from(SubTask)` 팩토리 메서드
- [x] `ReminderResponse`에 `subTasks: List<SubTaskResponse>` 포함
- [x] `SubTaskService` 생성
  - [x] `create(Long reminderId, SubTaskRequest)` — 생성
  - [x] `update(Long id, SubTaskRequest)` — 제목 수정
  - [x] `toggleComplete(Long id)` — 완료 토글
  - [x] `delete(Long id)` — 삭제
- [x] `SubTaskController` 생성
  - [x] `POST /api/reminders/{id}/subtasks` → `create()` (`201`)
  - [x] `PATCH /api/subtasks/{id}` → `update()`
  - [x] `PATCH /api/subtasks/{id}/complete` → `toggleComplete()`
  - [x] `DELETE /api/subtasks/{id}` → `delete()` (`204`)

### CORS 설정
- [x] `CorsConfig` 클래스 생성 (`WebMvcConfigurer`)
  - [x] `/api/**` 경로에 `http://localhost:3000` 허용
  - [x] 허용 메서드: `GET, POST, PATCH, DELETE`

### 테스트
- [x] 5가지 스마트 목록 쿼리 결과 검증
- [x] `GET /api/smart-counts` 응답값 검증
- [x] 하위 태스크 CRUD 전체 동작 검증
- [x] 검색 대소문자 무시 동작 검증
- [x] Reminder 응답에 SubTask 목록 포함 확인

---

## Phase 5 — FE: 프로젝트 셋업 + 정적 레이아웃

### 프로젝트 초기화
- [ ] `pnpm create next-app@latest frontend` 실행
  - [ ] 옵션: TypeScript ✓, TailwindCSS ✓, App Router ✓, `@/*` alias ✓
- [ ] 의존성 설치
  - [ ] `pnpm add @tanstack/react-query zustand`
  - [ ] `pnpm add -D @tanstack/react-query-devtools`
- [ ] 불필요한 보일러플레이트 제거 (기본 페이지 내용 비우기)

### 디자인 시스템
- [ ] `app/globals.css`에 Apple 시스템 색상 CSS 변수 정의
  - [ ] `--bg-sidebar`, `--bg-main`, `--bg-detail`
  - [ ] `--text-primary`, `--text-secondary`, `--separator`
  - [ ] `--due-overdue`, `--due-today`
  - [ ] 폰트: `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`
- [ ] `tailwind.config.ts`에 색상 변수 및 커스텀 애니메이션 등록
  - [ ] `animate-slide-down`, `animate-fade-out` keyframe 정의

### 타입 정의
- [ ] `types/index.ts` 생성
  - [ ] `ReminderList` 타입 (`id`, `name`, `color`, `icon`, `createdAt`)
  - [ ] `Reminder` 타입 (전체 필드)
  - [ ] `SubTask` 타입
  - [ ] `SmartCounts` 타입
  - [ ] `Priority`, `ListColor` 타입(Enum)
  - [ ] `SmartListId` 유니온 타입 (`'today' | 'scheduled' | 'all' | 'flagged' | 'completed'`)

### 정적 레이아웃
- [ ] `app/layout.tsx` — 사이드바(260px, 고정) + 메인(flex-1) 2컬럼 구조
- [ ] `app/page.tsx` — `/list/all` 리다이렉트
- [ ] `components/sidebar/SmartListCard.tsx` — 색상 카드, 아이콘, 숫자 표시 (더미)
- [ ] `components/sidebar/Sidebar.tsx`
  - [ ] 스마트 목록 카드 2열 그리드 (오늘·예정 / 전체·플래그됨)
  - [ ] 완료됨 카드 — 전체 너비 단독 배치
  - [ ] "나의 목록" 섹션 (더미 데이터)
  - [ ] `+ 목록 추가` 버튼 (비활성)
- [ ] `.env.local` 파일 생성 (`NEXT_PUBLIC_API_URL=http://localhost:8080`)

---

## Phase 6 — FE: 사이드바 API 연동 (목록 CRUD)

### API 클라이언트
- [ ] `lib/api.ts` — fetch 래퍼 (`apiFetch<T>`) 구현
  - [ ] `BASE_URL` 환경변수 적용
  - [ ] Content-Type 헤더 기본 설정
  - [ ] HTTP 에러 시 throw
- [ ] `lib/queryClient.ts` — TanStack Query 클라이언트 싱글톤 생성
- [ ] `app/layout.tsx`에 `QueryClientProvider` 래핑 (+ ReactQueryDevtools)

### Zustand 스토어
- [ ] `store/uiStore.ts` 생성
  - [ ] `selectedListId: string | null` 상태
  - [ ] `detailReminderId: number | null` 상태
  - [ ] `setSelectedList(id)` 액션
  - [ ] `openDetail(reminderId)`, `closeDetail()` 액션

### 훅
- [ ] `hooks/useLists.ts`
  - [ ] `useLists()` — `GET /api/lists`
  - [ ] `useCreateList()` — `POST /api/lists` (성공 시 `['lists']` invalidate)
  - [ ] `useUpdateList()` — `PATCH /api/lists/{id}`
  - [ ] `useDeleteList()` — `DELETE /api/lists/{id}`
- [ ] `hooks/useSmartCounts.ts` — `GET /api/smart-counts`

### UI 컴포넌트
- [ ] `components/ui/ColorPicker.tsx` — 10가지 색상 원형 버튼 선택 UI
- [ ] `components/sidebar/ListItem.tsx`
  - [ ] 색상 원 + 목록명 + 미완료 개수 뱃지
  - [ ] 선택 시 배경색 강조
  - [ ] 우클릭 → 컨텍스트 메뉴 (이름 변경 / 삭제)
- [ ] 목록 추가 모달 컴포넌트
  - [ ] 이름 입력 (`input`)
  - [ ] `ColorPicker` 색상 선택
  - [ ] 확인 / 취소 버튼
- [ ] `Sidebar.tsx` 실제 API 데이터로 교체
  - [ ] 스마트 목록 카드 카운트: `useSmartCounts()` 연동
  - [ ] 나의 목록: `useLists()` 연동
  - [ ] `+ 목록 추가` 버튼 → 모달 오픈

---

## Phase 7 — FE: 리마인더 기본 (조회·추가·완료·플래그)

### 훅
- [ ] `hooks/useReminders.ts`
  - [ ] `useReminders(params)` — `GET /api/reminders?listId=` 또는 `?smart=`
  - [ ] `useCreateReminder()` — `POST /api/reminders`
  - [ ] `useUpdateReminder()` — `PATCH /api/reminders/{id}`
  - [ ] `useToggleComplete()` — `PATCH /api/reminders/{id}/complete`
  - [ ] `useToggleFlag()` — `PATCH /api/reminders/{id}/flag`
  - [ ] `useDeleteReminder()` — `DELETE /api/reminders/{id}`

### UI 컴포넌트
- [ ] `components/ui/CircleButton.tsx` — 완료 토글 원형 버튼
  - [ ] 목록 색상 적용 (prop으로 수신)
  - [ ] hover 시 내부 fill (30% opacity)
  - [ ] 완료 상태: 체크마크 아이콘 표시
- [ ] `components/reminder/ReminderRow.tsx`
  - [ ] `CircleButton` + 제목 + 메모 미리보기(1줄 truncate)
  - [ ] 우선순위 뱃지 (`!` / `!!` / `!!!`)
  - [ ] 마감일 표시 (오늘 파랑, 초과 빨강, 기타 회색)
  - [ ] hover 시 🚩·[ⓘ] 버튼 노출 (기본 숨김)
  - [ ] 완료 항목: `line-through` + `text-secondary`
  - [ ] 플래그 토글 (주황 🚩)
- [ ] `components/reminder/ReminderInput.tsx` — 인라인 입력
  - [ ] `CircleButton` (빈 상태) + placeholder input
  - [ ] `Enter` → 저장 후 다음 입력 대기
  - [ ] `Escape` → 취소, input 비활성화
- [ ] `components/reminder/ReminderList.tsx`
  - [ ] 미완료 리마인더 목록 렌더링
  - [ ] 완료됨 섹션 (`완료됨 N개`) — 기본 접힘, 클릭으로 토글
  - [ ] `+ 새로운 리마인더` 버튼 → `ReminderInput` 활성화
- [ ] `app/list/[id]/page.tsx`
  - [ ] `id`가 스마트 목록 ID면 `smart=` 파라미터로, 아니면 `listId=`로 조회
  - [ ] 목록 제목 + 목록 색상 헤더 표시

### 애니메이션
- [ ] 완료 처리 3단계 애니메이션 구현
  - [ ] 1단계 (0~300ms): `CircleButton` fill 채우기 + 제목 `line-through`
  - [ ] 2단계 (300~600ms): 행 `opacity-0` + `max-h-0` 축소
  - [ ] 3단계: DOM에서 제거

---

## Phase 8 — FE: 상세 패널·하위 태스크·스마트 목록

### UI 컴포넌트
- [ ] `components/ui/Toggle.tsx` — iOS 스타일 토글 스위치
- [ ] `components/reminder/DetailPanel.tsx`
  - [ ] 우측 슬라이드-인 (`translate-x-full` → `translate-x-0`, 280ms ease)
  - [ ] 제목 `input` (편집 즉시 debounce PATCH)
  - [ ] 메모 `textarea` (자동 높이 조절)
  - [ ] 날짜 `Toggle` + 날짜 피커 (on 시 노출)
  - [ ] 시간 `Toggle` + 시간 피커 (날짜 설정 후 활성화)
  - [ ] 플래그 `Toggle`
  - [ ] 우선순위 드롭다운 (`없음 / 낮음 / 보통 / 높음`)
  - [ ] 목록 이동 드롭다운 (전체 목록 표시)
  - [ ] 하위 태스크 섹션 (목록 + 인라인 추가 입력)
  - [ ] 닫기 버튼 (`Escape` 연동)

### 하위 태스크
- [ ] `hooks/useSubTasks.ts`
  - [ ] `useCreateSubTask()` — `POST /api/reminders/{id}/subtasks`
  - [ ] `useUpdateSubTask()` — `PATCH /api/subtasks/{id}`
  - [ ] `useToggleSubTaskComplete()` — `PATCH /api/subtasks/{id}/complete`
  - [ ] `useDeleteSubTask()` — `DELETE /api/subtasks/{id}`
- [ ] `components/reminder/SubTaskRow.tsx`
  - [ ] `pl-8` 들여쓰기, 18px 원형 버튼
  - [ ] 완료 시 `line-through` + `text-secondary`
  - [ ] hover 시 삭제 버튼 노출
- [ ] `ReminderInput.tsx`에 `Tab` 키 → 하위 태스크 변환 처리

### 스마트 목록 뷰
- [ ] `smart=today` — 단일 목록 (날짜 그룹 없음)
- [ ] `smart=scheduled` — 날짜별 섹션 그룹핑
  - [ ] 그룹: "오늘", "내일", "이번 주", "다음 주", "이후"
- [ ] `smart=all`, `flagged`, `completed` — 목록 이름 서브라벨 표시
- [ ] `Zustand` `detailReminderId` 연동 — `[ⓘ]` 클릭 시 상세 패널 오픈

---

## Phase 9 — FE: 검색·키보드·낙관적 업데이트·애니메이션

### 검색
- [ ] `components/sidebar/SearchBar.tsx` 컴포넌트
  - [ ] `debounce` 300ms 적용
  - [ ] 검색 중 스피너 표시
  - [ ] 빈 검색어 → 원래 뷰 복귀
- [ ] 검색 결과 키워드 하이라이트 (`<mark>` 또는 `font-bold`)
- [ ] `Sidebar.tsx` 상단에 `SearchBar` 배치

### 낙관적 업데이트
- [ ] `useToggleComplete()` — `onMutate`로 UI 선반영, `onError`로 롤백
- [ ] `useToggleFlag()` — 동일하게 낙관적 업데이트 적용
- [ ] `useCreateReminder()` — 임시 id로 목록에 즉시 추가
- [ ] `useDeleteReminder()` — 즉시 목록에서 제거 후 서버 확인

### 키보드 단축키
- [ ] `hooks/useKeyboard.ts` 생성
  - [ ] `Cmd/Ctrl + F` → 검색창 포커스
  - [ ] `Cmd/Ctrl + I` → 상세 패널 토글
  - [ ] `Escape` → 상세 패널 닫기 / 인라인 편집 취소
  - [ ] `Enter` → 다음 리마인더 입력 활성화
  - [ ] `Tab` → 하위 태스크 변환 (인라인 입력 중)
  - [ ] `Shift+Tab` → 하위 태스크 → 일반 리마인더로 내보내기
  - [ ] `Space` → 선택된 리마인더 완료 토글
  - [ ] `Cmd/Ctrl + Backspace` → 리마인더 삭제
- [ ] `app/layout.tsx`에 `useKeyboard()` 훅 마운트

### 애니메이션 완성
- [ ] `SmartListCard` — `hover:scale-[1.02] transition-transform duration-150`
- [ ] `ListItem` 선택 — `transition-colors duration-100`
- [ ] `ReminderRow` 추가 — `animate-slide-down`
- [ ] `ReminderRow` 완료/삭제 — `animate-fade-out` (opacity 0 + height collapse)
- [ ] `CircleButton` 체크마크 — SVG `stroke-dashoffset` 드로우 애니메이션

### 반응형 (768px~1279px Tablet)
- [ ] 사이드바 숨김 처리 (`hidden md:block`)
- [ ] 상단 햄버거 버튼 → Drawer 컴포넌트 (사이드바 오버레이)
- [ ] 상세 패널 → 전체 화면 오버레이 모달로 전환

### 마무리
- [ ] API 에러 시 토스트 알림 컴포넌트
- [ ] 데이터 로딩 중 스켈레톤 UI (리마인더 목록, 사이드바)
- [ ] `frontend` 폴더 `.gitignore` 정비 (`.env.local`, `node_modules` 등)
- [ ] `README.md` 실행 방법 업데이트 (BE + FE 동시 실행)

---

## 전체 진행 현황

| Phase | 설명 | 진행 |
|-------|------|------|
| **Phase 1** | BE: 목록 CRUD API | ✅ 완료 |
| **Phase 2** | BE: 리마인더 기본 API | ✅ 완료 |
| **Phase 3** | BE: 리마인더 고급 API | ✅ 완료 |
| **Phase 4** | BE: 스마트 목록·하위 태스크·검색 | ✅ 완료 |
| **Phase 5** | FE: 프로젝트 셋업 + 정적 레이아웃 | ⬜ 미착수 |
| **Phase 6** | FE: 사이드바 API 연동 | ⬜ 미착수 |
| **Phase 7** | FE: 리마인더 기본 | ⬜ 미착수 |
| **Phase 8** | FE: 상세 패널·하위 태스크·스마트 목록 | ⬜ 미착수 |
| **Phase 9** | FE: 검색·키보드·낙관적 업데이트·애니메이션 | ⬜ 미착수 |
