package jiihyun.ai.jihyunreminder.domain;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ReminderListTest {

    @Nested
    class create {

        @Test
        void name과_color와_icon을_전달하면_모든_필드가_올바르게_설정된다() {
            ReminderList list = ReminderList.create("개인", ListColor.BLUE, "🏠");

            assertThat(list.getName()).isEqualTo("개인");
            assertThat(list.getColor()).isEqualTo(ListColor.BLUE);
            assertThat(list.getIcon()).isEqualTo("🏠");
        }

        @Test
        void icon_없이_생성하면_icon은_null이다() {
            ReminderList list = ReminderList.create("업무", ListColor.RED, null);

            assertThat(list.getName()).isEqualTo("업무");
            assertThat(list.getColor()).isEqualTo(ListColor.RED);
            assertThat(list.getIcon()).isNull();
        }

        @Test
        void 생성_직후_id는_null이다() {
            ReminderList list = ReminderList.create("쇼핑", ListColor.GREEN, null);

            assertThat(list.getId()).isNull();
        }
    }

    @Nested
    class 날짜_자동_등록 {

        @Test
        void 생성_시_createdAt과_updatedAt이_현재_시각으로_설정된다() {
            LocalDateTime before = LocalDateTime.now();
            ReminderList list = ReminderList.create("개인", ListColor.BLUE, null);
            LocalDateTime after = LocalDateTime.now();

            assertThat(list.getCreatedAt()).isBetween(before, after);
            assertThat(list.getUpdatedAt()).isBetween(before, after);
        }

        @Test
        void update_호출_시_updatedAt은_갱신되고_createdAt은_변경되지_않는다() throws InterruptedException {
            ReminderList list = ReminderList.create("개인", ListColor.BLUE, null);
            LocalDateTime originalCreatedAt = list.getCreatedAt();
            LocalDateTime originalUpdatedAt = list.getUpdatedAt();

            Thread.sleep(10);
            list.update("개인 (수정)", null, null);

            assertThat(list.getCreatedAt()).isEqualTo(originalCreatedAt);
            assertThat(list.getUpdatedAt()).isAfter(originalUpdatedAt);
        }
    }

    @Nested
    class update {

        @Test
        void 모든_필드를_전달하면_name과_color와_icon이_모두_변경된다() {
            ReminderList list = ReminderList.create("개인", ListColor.BLUE, "🏠");

            list.update("업무", ListColor.RED, "💼");

            assertThat(list.getName()).isEqualTo("업무");
            assertThat(list.getColor()).isEqualTo(ListColor.RED);
            assertThat(list.getIcon()).isEqualTo("💼");
        }

        @Test
        void name만_전달하면_name만_변경되고_color와_icon은_유지된다() {
            ReminderList list = ReminderList.create("개인", ListColor.BLUE, "🏠");

            list.update("개인 (수정)", null, null);

            assertThat(list.getName()).isEqualTo("개인 (수정)");
            assertThat(list.getColor()).isEqualTo(ListColor.BLUE);
            assertThat(list.getIcon()).isEqualTo("🏠");
        }

        @Test
        void color만_전달하면_color만_변경되고_name과_icon은_유지된다() {
            ReminderList list = ReminderList.create("개인", ListColor.BLUE, "🏠");

            list.update(null, ListColor.ORANGE, null);

            assertThat(list.getName()).isEqualTo("개인");
            assertThat(list.getColor()).isEqualTo(ListColor.ORANGE);
            assertThat(list.getIcon()).isEqualTo("🏠");
        }

        @Test
        void 모든_필드를_null로_전달하면_아무것도_변경되지_않는다() {
            ReminderList list = ReminderList.create("개인", ListColor.BLUE, "🏠");

            list.update(null, null, null);

            assertThat(list.getName()).isEqualTo("개인");
            assertThat(list.getColor()).isEqualTo(ListColor.BLUE);
            assertThat(list.getIcon()).isEqualTo("🏠");
        }
    }
}
