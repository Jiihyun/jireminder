package jiihyun.ai.jihyunreminder.controller;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.dto.request.ReminderCreateRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderListRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderUpdateRequest;
import jiihyun.ai.jihyunreminder.repository.ReminderListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SmartCountControllerTest {

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
    class GET_api_smart_counts {

        @Test
        void 스마트_목록_카운트를_조회하면_각_카운트를_반환한다() {
            long listId = 목록을_생성한다();

            // 미완료 2개
            리마인더를_생성한다(listId);
            long flaggedId = 리마인더를_생성한다(listId);

            // 플래그 1개
            given().when().patch("/api/reminders/{id}/flag", flaggedId).then().statusCode(200);

            // 완료 1개
            long completedId = 리마인더를_생성한다(listId);
            given().when().patch("/api/reminders/{id}/complete", completedId).then().statusCode(200);

            given()
            .when()
                .get("/api/smart-counts")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("all", equalTo(2))
                .body("flagged", equalTo(1))
                .body("completed", equalTo(1));
        }
    }

    @Nested
    class GET_api_reminders_smart {

        @Test
        void smart_all_파라미터로_모든_미완료_리마인더를_조회한다() {
            long listId = 목록을_생성한다();
            리마인더를_생성한다(listId);
            리마인더를_생성한다(listId);

            given()
                .queryParam("smart", "all")
            .when()
                .get("/api/reminders")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("incomplete", hasSize(2))
                .body("completed", hasSize(0));
        }

        @Test
        void smart_completed_파라미터로_완료된_리마인더를_조회한다() {
            long listId = 목록을_생성한다();
            long reminderId = 리마인더를_생성한다(listId);
            given().when().patch("/api/reminders/{id}/complete", reminderId).then().statusCode(200);

            given()
                .queryParam("smart", "completed")
            .when()
                .get("/api/reminders")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("incomplete", hasSize(0))
                .body("completed", hasSize(1));
        }
    }

    @Nested
    class GET_api_reminders_q {

        @Test
        void q_파라미터로_제목_검색하면_일치하는_리마인더를_반환한다() {
            long listId = 목록을_생성한다();
            리마인더를_생성한다(listId, "장보기");
            리마인더를_생성한다(listId, "운동하기");

            given()
                .queryParam("q", "장보기")
            .when()
                .get("/api/reminders")
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("incomplete", hasSize(1));
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
        return 리마인더를_생성한다(listId, "테스트 리마인더");
    }

    private long 리마인더를_생성한다(long listId, String title) {
        return ((Number) given()
                .contentType(ContentType.JSON)
                .body(new ReminderCreateRequest(listId, title, null))
            .when()
                .post("/api/reminders")
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("id"))
                .longValue();
    }
}
