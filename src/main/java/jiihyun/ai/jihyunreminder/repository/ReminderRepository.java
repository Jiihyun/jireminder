package jiihyun.ai.jihyunreminder.repository;

import jiihyun.ai.jihyunreminder.domain.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByReminderListIdAndCompletedFalseOrderByCreatedAtAsc(Long listId);

    List<Reminder> findByReminderListIdAndCompletedTrueOrderByCompletedAtDesc(Long listId);

    // 스마트 목록 쿼리
    List<Reminder> findByDueDateAndCompletedFalse(LocalDate today);

    List<Reminder> findByDueDateNotNullAndCompletedFalseOrderByDueDateAsc();

    List<Reminder> findByCompletedFalse();

    List<Reminder> findByFlaggedTrueAndCompletedFalse();

    List<Reminder> findByCompletedTrueOrderByCompletedAtDesc();

    // 검색 (title 또는 memo 대소문자 무시)
    @Query("SELECT r FROM Reminder r WHERE " +
            "LOWER(r.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(r.memo) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Reminder> searchByTitleOrMemo(@Param("q") String q);
}
