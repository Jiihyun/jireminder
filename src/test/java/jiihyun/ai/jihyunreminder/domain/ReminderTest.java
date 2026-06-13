package jiihyun.ai.jihyunreminder.domain;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class ReminderTest {

    private ReminderList 기본_목록() {
        return ReminderList.create("기본 목록", ListColor.BLUE, null);
    }

    @Nested
    class create {

        @Test
        void title과_memo를_전달하면_모든_필드가_올바르게_설정된다() {
            ReminderList list = 기본_목록();

            Reminder reminder = Reminder.create(list, "장보기", "우유, 달걀");

            assertThat(reminder.getTitle()).isEqualTo("장보기");
            assertThat(reminder.getMemo()).isEqualTo("우유, 달걀");
            assertThat(reminder.getReminderList()).isEqualTo(list);
        }

        @Test
        void 생성_직후_기본값이_올바르게_설정된다() {
            Reminder reminder = Reminder.create(기본_목록(), "리마인더", null);

            assertThat(reminder.isCompleted()).isFalse();
            assertThat(reminder.isFlagged()).isFalse();
            assertThat(reminder.getCompletedAt()).isNull();
            assertThat(reminder.getPriority()).isEqualTo(Priority.NONE);
            assertThat(reminder.getDueDate()).isNull();
            assertThat(reminder.getDueTime()).isNull();
            assertThat(reminder.getCreatedAt()).isNotNull();
            assertThat(reminder.getUpdatedAt()).isNotNull();
        }
    }

    @Nested
    class toggleComplete {

        @Test
        void 미완료_상태에서_토글하면_completed가_true이고_completedAt이_기록된다() {
            Reminder reminder = Reminder.create(기본_목록(), "리마인더", null);

            reminder.toggleComplete();

            assertThat(reminder.isCompleted()).isTrue();
            assertThat(reminder.getCompletedAt()).isNotNull();
        }

        @Test
        void 완료_상태에서_토글하면_completed가_false이고_completedAt이_null이_된다() {
            Reminder reminder = Reminder.create(기본_목록(), "리마인더", null);
            reminder.toggleComplete();

            reminder.toggleComplete();

            assertThat(reminder.isCompleted()).isFalse();
            assertThat(reminder.getCompletedAt()).isNull();
        }
    }

    @Nested
    class toggleFlag {

        @Test
        void 플래그_없는_상태에서_토글하면_flagged가_true가_된다() {
            Reminder reminder = Reminder.create(기본_목록(), "리마인더", null);

            reminder.toggleFlag();

            assertThat(reminder.isFlagged()).isTrue();
        }

        @Test
        void 플래그_있는_상태에서_토글하면_flagged가_false가_된다() {
            Reminder reminder = Reminder.create(기본_목록(), "리마인더", null);
            reminder.toggleFlag();

            reminder.toggleFlag();

            assertThat(reminder.isFlagged()).isFalse();
        }
    }

    @Nested
    class update {

        @Test
        void title만_전달하면_title만_변경된다() {
            Reminder reminder = Reminder.create(기본_목록(), "원래 제목", "원래 메모");

            reminder.update("새 제목", null, null, null, null);

            assertThat(reminder.getTitle()).isEqualTo("새 제목");
            assertThat(reminder.getMemo()).isEqualTo("원래 메모");
        }

        @Test
        void dueDate와_dueTime을_전달하면_설정된다() {
            Reminder reminder = Reminder.create(기본_목록(), "리마인더", null);
            LocalDate date = LocalDate.of(2026, 7, 1);
            LocalTime time = LocalTime.of(9, 0);

            reminder.update(null, null, Priority.HIGH, date, time);

            assertThat(reminder.getPriority()).isEqualTo(Priority.HIGH);
            assertThat(reminder.getDueDate()).isEqualTo(date);
            assertThat(reminder.getDueTime()).isEqualTo(time);
        }

        @Test
        void dueDate를_null로_전달하면_마감일이_제거된다() {
            Reminder reminder = Reminder.create(기본_목록(), "리마인더", null);
            reminder.update(null, null, null, LocalDate.of(2026, 7, 1), null);

            reminder.update(null, null, null, null, null);

            assertThat(reminder.getDueDate()).isNull();
        }
    }

    @Nested
    class move {

        @Test
        void 다른_목록으로_이동하면_reminderList가_변경된다() {
            ReminderList original = ReminderList.create("원래 목록", ListColor.BLUE, null);
            ReminderList target = ReminderList.create("대상 목록", ListColor.RED, null);
            Reminder reminder = Reminder.create(original, "리마인더", null);

            reminder.move(target);

            assertThat(reminder.getReminderList()).isEqualTo(target);
        }
    }
}
