package jiihyun.ai.jihyunreminder.service;

import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.dto.request.ReminderListRequest;
import jiihyun.ai.jihyunreminder.dto.response.ReminderListResponse;
import jiihyun.ai.jihyunreminder.exception.NotFoundException;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ReminderListServiceTest {

    @Autowired
    private ReminderListService reminderListService;

    @Nested
    class findAll {

        @Test
        void 저장된_목록이_없으면_빈_리스트를_반환한다() {
            List<ReminderListResponse> result = reminderListService.findAll();

            assertThat(result).isEmpty();
        }

        @Test
        void 저장된_목록을_모두_반환한다() {
            reminderListService.create(new ReminderListRequest("개인", ListColor.BLUE, "🏠"));
            reminderListService.create(new ReminderListRequest("업무", ListColor.RED, "💼"));

            List<ReminderListResponse> result = reminderListService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result).extracting("name").containsExactlyInAnyOrder("개인", "업무");
        }
    }

    @Nested
    class create {

        @Test
        void name과_color와_icon을_전달하면_목록이_생성된다() {
            ReminderListResponse result = reminderListService.create(
                    new ReminderListRequest("개인", ListColor.BLUE, "🏠")
            );

            assertThat(result.id()).isNotNull();
            assertThat(result.name()).isEqualTo("개인");
            assertThat(result.color()).isEqualTo(ListColor.BLUE);
            assertThat(result.icon()).isEqualTo("🏠");
            assertThat(result.createdAt()).isNotNull();
        }

        @Test
        void color가_null이면_기본값_BLUE로_생성된다() {
            ReminderListResponse result = reminderListService.create(
                    new ReminderListRequest("개인", null, null)
            );

            assertThat(result.color()).isEqualTo(ListColor.BLUE);
        }
    }

    @Nested
    class update {

        @Test
        void 존재하는_목록의_name과_color와_icon을_변경할_수_있다() {
            ReminderListResponse created = reminderListService.create(
                    new ReminderListRequest("개인", ListColor.BLUE, "🏠")
            );

            ReminderListResponse result = reminderListService.update(
                    created.id(),
                    new ReminderListRequest("업무", ListColor.RED, "💼")
            );

            assertThat(result.name()).isEqualTo("업무");
            assertThat(result.color()).isEqualTo(ListColor.RED);
            assertThat(result.icon()).isEqualTo("💼");
        }

        @Test
        void 존재하지_않는_id로_수정하면_NotFoundException이_발생한다() {
            assertThatThrownBy(() -> reminderListService.update(
                    999L,
                    new ReminderListRequest("업무", ListColor.RED, null)
            )).isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class delete {

        @Test
        void 존재하는_목록을_삭제하면_조회되지_않는다() {
            ReminderListResponse created = reminderListService.create(
                    new ReminderListRequest("개인", ListColor.BLUE, null)
            );

            reminderListService.delete(created.id());

            assertThat(reminderListService.findAll()).isEmpty();
        }

        @Test
        void 존재하지_않는_id로_삭제하면_NotFoundException이_발생한다() {
            assertThatThrownBy(() -> reminderListService.delete(999L))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}
