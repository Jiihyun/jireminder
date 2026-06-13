package jiihyun.ai.jihyunreminder.dto.request;

import jiihyun.ai.jihyunreminder.domain.Priority;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReminderUpdateRequest(
        String title,
        String memo,
        Priority priority,
        LocalDate dueDate,
        LocalTime dueTime
) {
}
