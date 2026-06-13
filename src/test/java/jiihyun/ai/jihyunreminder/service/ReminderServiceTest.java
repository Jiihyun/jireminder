package jiihyun.ai.jihyunreminder.service;

import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.domain.ReminderList;
import jiihyun.ai.jihyunreminder.dto.request.ReminderCreateRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderUpdateRequest;
import jiihyun.ai.jihyunreminder.dto.response.ReminderGroupResponse;
import jiihyun.ai.jihyunreminder.dto.response.ReminderResponse;
import jiihyun.ai.jihyunreminder.exception.NotFoundException;
import jiihyun.ai.jihyunreminder.repository.ReminderListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ReminderServiceTest {

    @Autowired
    private ReminderService reminderService;

    @Autowired
    private ReminderListRepository reminderListRepository;

    private Long savedListId;

    @BeforeEach
    void setUp() {
        ReminderList list = reminderListRepository.save(
                ReminderList.create("테스트 목록", ListColor.BLUE, null)
        );
        savedListId = list.getId();
    }

    @Nested
    class create {

        @Test
        void 유효한_요청으로_리마인더를_생성하면_저장된_리마인더를_반환한다() {
            ReminderCreateRequest request = new ReminderCreateRequest(savedListId, "장보기", "우유, 달걀");

            ReminderResponse response = reminderService.create(request);

            assertThat(response.id()).isNotNull();
            assertThat(response.title()).isEqualTo("장보기");
            assertThat(response.memo()).isEqualTo("우유, 달걀");
            assertThat(response.listId()).isEqualTo(savedListId);
            assertThat(response.completed()).isFalse();
            assertThat(response.flagged()).isFalse();
        }

        @Test
        void 존재하지_않는_listId로_생성하면_예외를_던진다() {
            ReminderCreateRequest request = new ReminderCreateRequest(999L, "리마인더", null);

            assertThatThrownBy(() -> reminderService.create(request))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class findByListId {

        @Test
        void 미완료와_완료_리마인더를_분리해서_반환한다() {
            reminderService.create(new ReminderCreateRequest(savedListId, "미완료 리마인더", null));
            ReminderResponse created = reminderService.create(new ReminderCreateRequest(savedListId, "완료 리마인더", null));
            reminderService.toggleComplete(created.id());

            ReminderGroupResponse response = reminderService.findByListId(savedListId);

            assertThat(response.incomplete()).hasSize(1);
            assertThat(response.completed()).hasSize(1);
        }
    }

    @Nested
    class toggleComplete {

        @Test
        void 미완료_리마인더를_토글하면_completed가_true이고_completedAt이_기록된다() {
            ReminderResponse created = reminderService.create(new ReminderCreateRequest(savedListId, "리마인더", null));

            ReminderResponse toggled = reminderService.toggleComplete(created.id());

            assertThat(toggled.completed()).isTrue();
            assertThat(toggled.completedAt()).isNotNull();
        }

        @Test
        void 완료_리마인더를_토글하면_completed가_false이고_completedAt이_null이_된다() {
            ReminderResponse created = reminderService.create(new ReminderCreateRequest(savedListId, "리마인더", null));
            reminderService.toggleComplete(created.id());

            ReminderResponse toggled = reminderService.toggleComplete(created.id());

            assertThat(toggled.completed()).isFalse();
            assertThat(toggled.completedAt()).isNull();
        }

        @Test
        void 존재하지_않는_id로_토글하면_예외를_던진다() {
            assertThatThrownBy(() -> reminderService.toggleComplete(999L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class toggleFlag {

        @Test
        void 플래그가_없는_리마인더를_토글하면_flagged가_true가_된다() {
            ReminderResponse created = reminderService.create(new ReminderCreateRequest(savedListId, "리마인더", null));

            ReminderResponse toggled = reminderService.toggleFlag(created.id());

            assertThat(toggled.flagged()).isTrue();
        }

        @Test
        void 플래그가_있는_리마인더를_토글하면_flagged가_false가_된다() {
            ReminderResponse created = reminderService.create(new ReminderCreateRequest(savedListId, "리마인더", null));
            reminderService.toggleFlag(created.id());

            ReminderResponse toggled = reminderService.toggleFlag(created.id());

            assertThat(toggled.flagged()).isFalse();
        }
    }

    @Nested
    class update {

        @Test
        void title을_수정하면_title이_변경된다() {
            ReminderResponse created = reminderService.create(new ReminderCreateRequest(savedListId, "원래 제목", null));

            ReminderResponse updated = reminderService.update(created.id(),
                    new ReminderUpdateRequest("새 제목", null, null, null, null));

            assertThat(updated.title()).isEqualTo("새 제목");
        }
    }

    @Nested
    class delete {

        @Test
        void 존재하는_리마인더를_삭제하면_예외가_발생하지_않는다() {
            ReminderResponse created = reminderService.create(new ReminderCreateRequest(savedListId, "리마인더", null));

            reminderService.delete(created.id());

            assertThatThrownBy(() -> reminderService.toggleComplete(created.id()))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void 존재하지_않는_id로_삭제하면_예외를_던진다() {
            assertThatThrownBy(() -> reminderService.delete(999L))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}
