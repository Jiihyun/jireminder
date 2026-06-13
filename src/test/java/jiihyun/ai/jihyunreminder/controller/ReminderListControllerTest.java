package jiihyun.ai.jihyunreminder.controller;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.dto.request.ReminderListRequest;
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
class ReminderListControllerTest {

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
    class GET_api_lists {

        @Test
        void 목록이_없으면_빈_배열을_반환한다() {
            given()
                .when()
                    .get("/api/lists")
                .then()
                    .statusCode(HttpStatus.OK.value())
                    .body("$", hasSize(0));
        }

        @Test
        void 저장된_목록을_모두_반환한다() {
            목록을_생성한다("개인", ListColor.BLUE, "🏠");
            목록을_생성한다("업무", ListColor.RED, "💼");

            given()
                .when()
                    .get("/api/lists")
                .then()
                    .statusCode(HttpStatus.OK.value())
                    .body("$", hasSize(2));
        }
    }

    @Nested
    class POST_api_lists {

        @Test
        void 목록을_생성하면_201과_생성된_목록을_반환한다() {
            given()
                .contentType(ContentType.JSON)
                .body(new ReminderListRequest("개인", ListColor.BLUE, "🏠"))
            .when()
                .post("/api/lists")
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .body("id", notNullValue())
                .body("name", equalTo("개인"))
                .body("color", equalTo("BLUE"))
                .body("icon", equalTo("🏠"))
                .body("createdAt", notNullValue());
        }

        @Test
        void color_없이_생성하면_기본값_BLUE로_생성된다() {
            given()
                .contentType(ContentType.JSON)
                .body(new ReminderListRequest("개인", null, null))
            .when()
                .post("/api/lists")
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .body("color", equalTo("BLUE"));
        }

        @Test
        void name이_없으면_400을_반환한다() {
            given()
                .contentType(ContentType.JSON)
                .body(new ReminderListRequest(null, ListColor.BLUE, null))
            .when()
                .post("/api/lists")
            .then()
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .body("message", notNullValue());
        }
    }

    @Nested
    class PATCH_api_lists_id {

        @Test
        void 목록의_name과_color와_icon을_수정할_수_있다() {
            int id = 목록을_생성한다("개인", ListColor.BLUE, "🏠");

            given()
                .contentType(ContentType.JSON)
                .body(new ReminderListRequest("업무", ListColor.RED, "💼"))
            .when()
                .patch("/api/lists/{id}", id)
            .then()
                .statusCode(HttpStatus.OK.value())
                .body("name", equalTo("업무"))
                .body("color", equalTo("RED"))
                .body("icon", equalTo("💼"));
        }

        @Test
        void 존재하지_않는_id로_수정하면_404를_반환한다() {
            given()
                .contentType(ContentType.JSON)
                .body(new ReminderListRequest("업무", ListColor.RED, null))
            .when()
                .patch("/api/lists/{id}", 999)
            .then()
                .statusCode(HttpStatus.NOT_FOUND.value())
                .body("message", notNullValue());
        }
    }

    @Nested
    class DELETE_api_lists_id {

        @Test
        void 목록을_삭제하면_204를_반환한다() {
            int id = 목록을_생성한다("개인", ListColor.BLUE, null);

            given()
                .when()
                    .delete("/api/lists/{id}", id)
                .then()
                    .statusCode(HttpStatus.NO_CONTENT.value());
        }

        @Test
        void 존재하지_않는_id로_삭제하면_404를_반환한다() {
            given()
                .when()
                    .delete("/api/lists/{id}", 999)
                .then()
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .body("message", notNullValue());
        }
    }

    private int 목록을_생성한다(String name, ListColor color, String icon) {
        return given()
                .contentType(ContentType.JSON)
                .body(new ReminderListRequest(name, color, icon))
            .when()
                .post("/api/lists")
            .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract()
                .path("id");
    }
}
