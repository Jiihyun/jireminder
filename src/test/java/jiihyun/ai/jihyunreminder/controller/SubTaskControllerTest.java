package jiihyun.ai.jihyunreminder.controller;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.dto.request.ReminderCreateRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderListRequest;
import jiihyun.ai.jihyunreminder.dto.request.SubTaskRequest;
import jiihyun.ai.jihyunreminder.repository.ReminderListRepository;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SubTaskControllerTest {

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
    class POST_api_reminders_reminderId_subtasks {

        @Test
        void 하위_태스크를_생성하면_201과_생성된_하위_태스크를_반환한다() {
            long reminderId = 리마인더를_생성한다();

            given()
                .contentType(ContentType.JSON)
                .body(new SubTaskRequest("우유 사기"))
            .when()
                .post("/api/reminders/{id}/subtasks", reminderId)
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .body("id", notNullValue())
                .body("title", equalTo("우유 사기"))
                .body("completed", equalTo(false))
                .body("reminderId", equalTo((int) reminderId));
        }

        @Test
        void 존재하지_않는_리마인더에_하위_태스크를_생성하면_404를_반환한다() {
            given()
                .contentType(ContentType.JSON)
                .body(new SubTaskRequest("태스크"))
            .when()
                .post("/api/reminders/{id}/subtasks", 999)
            .then()
                .statusCode(HttpStatus.NOT_FOUND.value());
        }
    }

    @Nested
    class PATCH_api_subtasks_id {

        @Test
        void 하위_태스크_제목을_수정하면_변경값이_반영된다() {
            long reminderId = 리마인더를_생성한다();
            long subTaskId = 하위_태스크를_생성한다(reminderId);

            given()
                .contentType(ContentType.JSON)
                .body(new SubTaskRequest("달걀 사기"))
            .when()
                .patch("/api/subtasks/{id}", subTaskId)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("title", equalTo("달걀 사기"));
        }
    }

    @Nested
    class PATCH_api_subtasks_id_complete {

        @Test
        void 하위_태스크를_완료_토글하면_completed가_true가_된다() {
            long reminderId = 리마인더를_생성한다();
            long subTaskId = 하위_태스크를_생성한다(reminderId);

            given()
            .when()
                .patch("/api/subtasks/{id}/complete", subTaskId)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("completed", equalTo(true));
        }
    }

    @Nested
    class DELETE_api_subtasks_id {

        @Test
        void 하위_태스크를_삭제하면_204를_반환한다() {
            long reminderId = 리마인더를_생성한다();
            long subTaskId = 하위_태스크를_생성한다(reminderId);

            given()
            .when()
                .delete("/api/subtasks/{id}", subTaskId)
            .then()
                .statusCode(HttpStatus.NO_CONTENT.value());
        }
    }

    @Nested
    class Reminder_응답에_subTask_포함 {

        @Test
        void 리마인더_조회_시_하위_태스크_목록이_포함된다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);
            하위_태스크를_생성한다(reminderId, "태스크1");
            하위_태스크를_생성한다(reminderId, "태스크2");

            given()
                .queryParam("listId", listId)
            .when()
                .get("/api/reminders")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("incomplete[0].subTasks", hasSize(2));
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

    private long 리마인더를_생성한다() {
        long listId = 목록을_생성한다();
        return 리마인더를_생성한다(listId);
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

    private long 하위_태스크를_생성한다(long reminderId) {
        return 하위_태스크를_생성한다(reminderId, "테스트 하위 태스크");
    }

    private long 하위_태스크를_생성한다(long reminderId, String title) {
        return ((Number) given()
                .contentType(ContentType.JSON)
                .body(new SubTaskRequest(title))
            .when()
                .post("/api/reminders/{id}/subtasks", reminderId)
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("id"))
                .longValue();
    }
}
