package jiihyun.ai.jihyunreminder.repository;

import jiihyun.ai.jihyunreminder.domain.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByReminderListIdAndCompletedFalseOrderByCreatedAtAsc(Long listId);

    List<Reminder> findByReminderListIdAndCompletedTrueOrderByCompletedAtDesc(Long listId);
}
