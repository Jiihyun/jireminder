package jiihyun.ai.jihyunreminder.service;

import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.domain.ReminderList;
import jiihyun.ai.jihyunreminder.dto.request.ReminderCreateRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderUpdateRequest;
import jiihyun.ai.jihyunreminder.dto.response.ReminderGroupResponse;
import jiihyun.ai.jihyunreminder.dto.response.SmartCountResponse;
import jiihyun.ai.jihyunreminder.repository.ReminderListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class SmartListServiceTest {

    @Autowired
    private ReminderService reminderService;

    @Autowired
    private SmartCountService smartCountService;

    @Autowired
    private ReminderListRepository reminderListRepository;

    private Long listId;

    @BeforeEach
    void setUp() {
        reminderListRepository.deleteAll();
        ReminderList list = reminderListRepository.save(
                ReminderList.create("테스트 목록", ListColor.BLUE, null)
        );
        listId = list.getId();
    }

    @Nested
    class findBySmart {

        @Test
        void today_스마트_목록은_오늘_마감인_미완료_리마인더를_반환한다() {
            reminderService.create(new ReminderCreateRequest(listId, "오늘 마감", null));
            var created = reminderService.create(new ReminderCreateRequest(listId, "오늘 마감 리마인더", null));
            reminderService.update(created.id(),
                    new ReminderUpdateRequest(null, null, null, LocalDate.now(), null));

            ReminderGroupResponse response = reminderService.findBySmart("today");

            assertThat(response.incomplete()).hasSize(1);
            assertThat(response.incomplete().get(0).title()).isEqualTo("오늘 마감 리마인더");
        }

        @Test
        void scheduled_스마트_목록은_마감일이_있는_미완료_리마인더를_반환한다() {
            reminderService.create(new ReminderCreateRequest(listId, "마감일 없음", null));
            var created = reminderService.create(new ReminderCreateRequest(listId, "마감일 있음", null));
            reminderService.update(created.id(),
                    new ReminderUpdateRequest(null, null, null, LocalDate.now().plusDays(1), null));

            ReminderGroupResponse response = reminderService.findBySmart("scheduled");

            assertThat(response.incomplete()).hasSize(1);
        }

        @Test
        void all_스마트_목록은_모든_미완료_리마인더를_반환한다() {
            reminderService.create(new ReminderCreateRequest(listId, "리마인더1", null));
            reminderService.create(new ReminderCreateRequest(listId, "리마인더2", null));
            var created = reminderService.create(new ReminderCreateRequest(listId, "완료됨", null));
            reminderService.toggleComplete(created.id());

            ReminderGroupResponse response = reminderService.findBySmart("all");

            assertThat(response.incomplete()).hasSize(2);
        }

        @Test
        void flagged_스마트_목록은_플래그된_미완료_리마인더를_반환한다() {
            var created = reminderService.create(new ReminderCreateRequest(listId, "플래그 리마인더", null));
            reminderService.toggleFlag(created.id());
            reminderService.create(new ReminderCreateRequest(listId, "일반 리마인더", null));

            ReminderGroupResponse response = reminderService.findBySmart("flagged");

            assertThat(response.incomplete()).hasSize(1);
        }

        @Test
        void completed_스마트_목록은_완료된_리마인더를_반환한다() {
            var created = reminderService.create(new ReminderCreateRequest(listId, "완료 리마인더", null));
            reminderService.toggleComplete(created.id());
            reminderService.create(new ReminderCreateRequest(listId, "미완료 리마인더", null));

            ReminderGroupResponse response = reminderService.findBySmart("completed");

            assertThat(response.completed()).hasSize(1);
            assertThat(response.incomplete()).isEmpty();
        }
    }

    @Nested
    class search {

        @Test
        void 제목으로_검색하면_일치하는_리마인더를_반환한다() {
            reminderService.create(new ReminderCreateRequest(listId, "장보기", null));
            reminderService.create(new ReminderCreateRequest(listId, "운동하기", null));

            ReminderGroupResponse response = reminderService.search("장보기");

            assertThat(response.incomplete()).hasSize(1);
            assertThat(response.incomplete().get(0).title()).isEqualTo("장보기");
        }

        @Test
        void 검색은_대소문자를_무시한다() {
            reminderService.create(new ReminderCreateRequest(listId, "Apple Meeting", null));

            ReminderGroupResponse response = reminderService.search("apple");

            assertThat(response.incomplete()).hasSize(1);
        }

        @Test
        void 메모로_검색하면_일치하는_리마인더를_반환한다() {
            reminderService.create(new ReminderCreateRequest(listId, "장보기", "우유 사기"));

            ReminderGroupResponse response = reminderService.search("우유");

            assertThat(response.incomplete()).hasSize(1);
        }
    }

    @Nested
    class getCounts {

        @Test
        void 스마트_목록_카운트를_일괄_조회한다() {
            // all: 2개
            reminderService.create(new ReminderCreateRequest(listId, "리마인더1", null));
            var created = reminderService.create(new ReminderCreateRequest(listId, "리마인더2", null));

            // flagged: 1개
            reminderService.toggleFlag(created.id());

            // completed: 1개
            var toComplete = reminderService.create(new ReminderCreateRequest(listId, "완료", null));
            reminderService.toggleComplete(toComplete.id());

            SmartCountResponse counts = smartCountService.getCounts();

            assertThat(counts.all()).isEqualTo(2);
            assertThat(counts.flagged()).isEqualTo(1);
            assertThat(counts.completed()).isEqualTo(1);
        }
    }
}
