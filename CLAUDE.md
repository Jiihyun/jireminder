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

## 엔티티 설계

### 생성 방식

- `@Builder`를 외부에 노출하지 않고 **정적 팩토리 메서드 `create()`** 를 사용한다
- 생성 시 필요한 비즈니스 로직(날짜 설정 등)을 `create()` 안에서 처리한다
- 기본 생성자는 `@NoArgsConstructor(access = AccessLevel.PROTECTED)`로 JPA 전용으로만 허용한다

```java
// ✅ 올바른 예
public static ReminderList create(String name, ListColor color, String icon) {
    return new ReminderList(name, color, icon); // 생성자 내부에서 날짜 설정
}

// ❌ 잘못된 예
ReminderList.builder().name("개인").color(BLUE).build(); // 외부에서 builder 직접 사용
```

### 날짜 자동 등록

- `@CreationTimestamp`, `@UpdateTimestamp` 같은 Hibernate 어노테이션을 사용하지 않는다
- `@PrePersist` / `@PreUpdate` 도 사용하지 않는다
- **생성 로직(`create()`)과 수정 로직(`update()`) 내부**에서 직접 `LocalDateTime.now()`로 설정한다
- 이렇게 하면 JPA 없이도 단위 테스트에서 검증 가능하다

```java
// ✅ 올바른 예
private ReminderList(String name, ListColor color, String icon) {
    this.name = name;
    this.color = color;
    this.icon = icon;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
}

public void update(String name, ListColor color, String icon) {
    if (name != null) this.name = name;
    if (color != null) this.color = color;
    if (icon != null) this.icon = icon;
    this.updatedAt = LocalDateTime.now();
}
```

### 수정 메서드

- 수정 메서드는 null-safe하게 작성한다 — null이 전달된 필드는 변경하지 않는다

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
