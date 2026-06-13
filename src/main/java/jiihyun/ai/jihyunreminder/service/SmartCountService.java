package jiihyun.ai.jihyunreminder.service;

import jiihyun.ai.jihyunreminder.dto.response.SmartCountResponse;
import jiihyun.ai.jihyunreminder.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SmartCountService {

    private final ReminderRepository reminderRepository;

    public SmartCountResponse getCounts() {
        long today = reminderRepository.findByDueDateAndCompletedFalse(LocalDate.now()).size();
        long scheduled = reminderRepository.findByDueDateNotNullAndCompletedFalseOrderByDueDateAsc().size();
        long all = reminderRepository.findByCompletedFalse().size();
        long flagged = reminderRepository.findByFlaggedTrueAndCompletedFalse().size();
        long completed = reminderRepository.findByCompletedTrueOrderByCompletedAtDesc().size();
        return new SmartCountResponse(today, scheduled, all, flagged, completed);
    }
}
