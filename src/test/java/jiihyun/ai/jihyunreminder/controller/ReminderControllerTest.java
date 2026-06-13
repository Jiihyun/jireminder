package jiihyun.ai.jihyunreminder.controller;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.domain.Priority;
import jiihyun.ai.jihyunreminder.dto.request.ReminderCreateRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderListRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderMoveRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderUpdateRequest;
import jiihyun.ai.jihyunreminder.repository.ReminderListRepository;

import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ReminderControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private ReminderListRepository reminderListRepository;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        reminderListRepository.deleteAll();
    }

    @Nested
    class GET_api_reminders {

        @Test
        void 목록별_미완료_완료_리마인더를_분리해서_반환한다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);
            리마인더를_생성한다(listId);
            완료_토글한다(reminderId);

            given()
                .queryParam("listId", listId)
            .when()
                .get("/api/reminders")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("incomplete", hasSize(1))
                .body("completed", hasSize(1));
        }

        @Test
        void 리마인더가_없는_목록을_조회하면_빈_배열을_반환한다() {
            long listId = 목록을_생성한다();

            given()
                .queryParam("listId", listId)
            .when()
                .get("/api/reminders")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("incomplete", hasSize(0))
                .body("completed", hasSize(0));
        }
    }

    @Nested
    class POST_api_reminders {

        @Test
        void 리마인더를_생성하면_201과_생성된_리마인더를_반환한다() {
            long listId = 목록을_생성한다();

            given()
                .contentType(ContentType.JSON)
                .body(new ReminderCreateRequest(listId, "장보기", "우유, 달걀"))
            .when()
                .post("/api/reminders")
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .body("id", notNullValue())
                .body("title", equalTo("장보기"))
                .body("memo", equalTo("우유, 달걀"))
                .body("completed", equalTo(false))
                .body("flagged", equalTo(false));
        }

        @Test
        void 존재하지_않는_listId로_생성하면_404를_반환한다() {
            given()
                .contentType(ContentType.JSON)
                .body(new ReminderCreateRequest(999L, "리마인더", null))
            .when()
                .post("/api/reminders")
            .then()
                .statusCode(HttpStatus.NOT_FOUND.value());
        }

        @Test
        void title이_없으면_400을_반환한다() {
            long listId = 목록을_생성한다();

            given()
                .contentType(ContentType.JSON)
                .body(new ReminderCreateRequest(listId, "", null))
            .when()
                .post("/api/reminders")
            .then()
                .statusCode(HttpStatus.BAD_REQUEST.value());
        }
    }

    @Nested
    class PATCH_api_reminders_id_complete {

        @Test
        void 완료_토글하면_completed가_true이고_completedAt이_기록된다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);

            given()
            .when()
                .patch("/api/reminders/{id}/complete", reminderId)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("completed", equalTo(true))
                .body("completedAt", notNullValue());
        }

        @Test
        void 완료_상태에서_재토글하면_completed가_false이고_completedAt이_null이_된다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);
            완료_토글한다(reminderId);

            given()
            .when()
                .patch("/api/reminders/{id}/complete", reminderId)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("completed", equalTo(false))
                .body("completedAt", nullValue());
        }
    }

    @Nested
    class PATCH_api_reminders_id_flag {

        @Test
        void 플래그_토글하면_flagged가_true가_된다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);

            given()
            .when()
                .patch("/api/reminders/{id}/flag", reminderId)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("flagged", equalTo(true));
        }
    }

    @Nested
    class PATCH_api_reminders_id {

        @Test
        void 마감일과_우선순위를_수정하면_변경값이_반영된다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);
            LocalDate dueDate = LocalDate.of(2026, 7, 1);

            given()
                .contentType(ContentType.JSON)
                .body(new ReminderUpdateRequest(null, null, Priority.HIGH, dueDate, null))
            .when()
                .patch("/api/reminders/{id}", reminderId)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("priority", equalTo("HIGH"))
                .body("dueDate", equalTo("2026-07-01"));
        }
    }

    @Nested
    class PATCH_api_reminders_id_move {

        @Test
        void 목록_이동하면_listId가_변경된다() {
            long listId = 목록을_생성한다();
            long targetListId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);

            given()
                .contentType(ContentType.JSON)
                .body(new ReminderMoveRequest(targetListId))
            .when()
                .patch("/api/reminders/{id}/move", reminderId)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("listId", equalTo((int) targetListId));
        }
    }

    @Nested
    class DELETE_api_reminders_id {

        @Test
        void 리마인더를_삭제하면_204를_반환한다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);

            given()
            .when()
                .delete("/api/reminders/{id}", reminderId)
            .then()
                .statusCode(HttpStatus.NO_CONTENT.value());
        }

        @Test
        void 존재하지_않는_리마인더를_삭제하면_404를_반환한다() {
            given()
            .when()
                .delete("/api/reminders/{id}", 999)
            .then()
                .statusCode(HttpStatus.NOT_FOUND.value());
        }
    }

    private long 목록을_생성한다() {
        return ((Number) given()
                .contentType(ContentType.JSON)
                .body(new ReminderListRequest("테스트 목록", ListColor.BLUE, null))
            .when()
                .post("/api/lists")
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("id"))
                .longValue();
    }

    private long 리마인더를_생성한다(long listId) {
        return ((Number) given()
                .contentType(ContentType.JSON)
                .body(new ReminderCreateRequest(listId, "테스트 리마인더", null))
            .when()
                .post("/api/reminders")
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("id"))
                .longValue();
    }

    private void 완료_토글한다(long reminderId) {
        given()
            .when()
                .patch("/api/reminders/{id}/complete", reminderId)
            .then()
                .statusCode(HttpStatus.OK.value());
    }
}
