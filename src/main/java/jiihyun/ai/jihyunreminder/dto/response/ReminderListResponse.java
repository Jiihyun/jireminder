package jiihyun.ai.jihyunreminder.dto.response;

import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.domain.ReminderList;

import java.time.LocalDateTime;

public record ReminderListResponse(
        Long id,
        String name,
        ListColor color,
        String icon,
        LocalDateTime createdAt
) {
    public static ReminderListResponse from(ReminderList reminderList) {
        return new ReminderListResponse(
                reminderList.getId(),
                reminderList.getName(),
                reminderList.getColor(),
                reminderList.getIcon(),
                reminderList.getCreatedAt()
        );
    }
}
