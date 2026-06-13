package jiihyun.ai.jihyunreminder.dto.response;

import jiihyun.ai.jihyunreminder.domain.Priority;
import jiihyun.ai.jihyunreminder.domain.Reminder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record ReminderResponse(
        Long id,
        Long listId,
        String title,
        String memo,
        boolean completed,
        LocalDateTime completedAt,
        boolean flagged,
        Priority priority,
        LocalDate dueDate,
        LocalTime dueTime,
        LocalDateTime createdAt,
        List<SubTaskResponse> subTasks
) {
    public static ReminderResponse from(Reminder reminder) {
        return new ReminderResponse(
                reminder.getId(),
                reminder.getReminderList().getId(),
                reminder.getTitle(),
                reminder.getMemo(),
                reminder.isCompleted(),
                reminder.getCompletedAt(),
                reminder.isFlagged(),
                reminder.getPriority(),
                reminder.getDueDate(),
                reminder.getDueTime(),
                reminder.getCreatedAt(),
                reminder.getSubTasks().stream()
                        .map(SubTaskResponse::from)
                        .toList()
        );
    }
}
