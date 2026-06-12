# CLAUDE.md — 코딩 관례

이 프로젝트에서 코드를 작성할 때 반드시 지켜야 할 규칙을 정의한다.

---

## 커밋 컨벤션

AngularJS 커밋 컨벤션을 따르며, 커밋 메시지는 **한글**로 작성한다.

```
<type>(<scope>): <한글 제목>

<본문 - 선택>
```

| type | 용도 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변화 없음) |
| `test` | 테스트 코드 추가/수정 |
| `docs` | 문서 수정 |
| `chore` | 빌드, 설정 등 기타 작업 |
| `style` | 포맷, 세미콜론 등 코드 스타일 |

**예시**
```
feat(domain): ReminderList 엔티티 생성
fix(service): 완료 토글 시 completedAt 초기화 누락 수정
test(controller): ReminderList CRUD 통합 테스트 추가
```

---

## 테스트 전략

기능을 구현하거나 수정할 때 **반드시 테스트를 함께 작성**한다.

### 레이어별 방식

| 레이어 | 방식 | 사용 도구 |
|--------|------|-----------|
| **Domain** | 순수 단위 테스트 | plain Java (Spring/JPA 없음) |
| **Service** | 실제 빈 사용 | `@SpringBootTest` (Mock 사용 안 함) |
| **Repository** | 복잡한 쿼리일 때만 | `@DataJpaTest` |
| **Controller** | 통합 테스트 | `@SpringBootTest` + RestAssured |

### 테스트 메서드 네이밍

- `@DisplayName` 사용하지 않는다
- 메서드명을 **한글**로 작성하며, 공백 대신 `_`를 사용한다
- `@Nested` 클래스명은 테스트 대상 메서드명 또는 상황을 표현한다

```java
// ✅ 올바른 예
class ReminderListTest {

    @Nested
    class create {
        @Test
        void name과_color와_icon을_전달하면_모든_필드가_올바르게_설정된다() { ... }
    }

    @Nested
    class update {
        @Test
        void name만_전달하면_name만_변경되고_나머지는_유지된다() { ... }
    }
}

// ❌ 잘못된 예
@Test
@DisplayName("name, color, icon을 전달하면 모든 필드가 올바르게 설정된다")
void createWithAllFields() { ... }
```
---

## Service 설계

### 트랜잭션

- 클래스 레벨에 `@Transactional(readOnly = true)`를 선언한다
- 데이터를 변경하는 메서드(create, update, delete)에만 `@Transactional`을 추가로 선언한다

```java
// ✅ 올바른 예
@Service
@Transactional(readOnly = true)
public class ReminderListService {

    public List<ReminderListResponse> findAll() { ... }   // readOnly 상속

    @Transactional
    public ReminderListResponse create(...) { ... }       // 쓰기 트랜잭션

    @Transactional
    public void delete(...) { ... }
}
```

### 예외 처리

- 존재하지 않는 id 조회는 `NotFoundException`을 던진다
- Repository 조회 로직은 `findById()` private 메서드로 추출해 중복을 제거한다

```java
// ✅ 올바른 예
private ReminderList findById(Long id) {
    return reminderListRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("목록을 찾을 수 없습니다. id=" + id));
}
```

### Service 테스트

- `@SpringBootTest` + `@Transactional`로 작성한다
- Mock을 사용하지 않고 실제 빈과 H2 인메모리 DB를 사용한다
- `@Transactional`로 각 테스트가 독립적으로 롤백된다

```java
// ✅ 올바른 예
@SpringBootTest
@Transactional
class ReminderListServiceTest {

    @Autowired
    private ReminderListService reminderListService;

    @Test
    void 저장된_목록이_없으면_빈_리스트를_반환한다() {
        assertThat(reminderListService.findAll()).isEmpty();
    }
}
```

---

## 패키지 구조

```
src/main/java/jiihyun/ai/jihyunreminder/
├── domain/          ← 엔티티, Enum
├── repository/      ← JPA Repository
├── service/         ← 비즈니스 로직
├── controller/      ← REST API
└── dto/
    ├── request/     ← 요청 DTO
    └── response/    ← 응답 DTO (엔티티 직접 노출 금지)
```

- 엔티티를 Controller/DTO에서 직접 반환하지 않는다
- Response DTO는 `from(Entity)` 정적 팩토리 메서드를 제공한다

---

## 언어

- 코드(변수명, 메서드명, 클래스명): **영어**
- 테스트 메서드명: **한글** (`_`로 공백 대체)
- 커밋 메시지: **한글**
- 주석: **한글**
