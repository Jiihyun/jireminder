package jiihyun.ai.jihyunreminder.dto.response;

import java.util.List;

public record ReminderGroupResponse(
        List<ReminderResponse> incomplete,
        List<ReminderResponse> completed
) {
}
