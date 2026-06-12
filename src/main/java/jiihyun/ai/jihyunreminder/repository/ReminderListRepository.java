package jiihyun.ai.jihyunreminder.repository;

import jiihyun.ai.jihyunreminder.domain.ReminderList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderListRepository extends JpaRepository<ReminderList, Long> {
}
