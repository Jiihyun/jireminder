package jiihyun.ai.jihyunreminder.dto.response;

import jiihyun.ai.jihyunreminder.domain.SubTask;

import java.time.LocalDateTime;

public record SubTaskResponse(
        Long id,
        Long reminderId,
        String title,
        boolean completed,
        LocalDateTime createdAt
) {
    public static SubTaskResponse from(SubTask subTask) {
        return new SubTaskResponse(
                subTask.getId(),
                subTask.getReminder().getId(),
                subTask.getTitle(),
                subTask.isCompleted(),
                subTask.getCreatedAt()
        );
    }
}
