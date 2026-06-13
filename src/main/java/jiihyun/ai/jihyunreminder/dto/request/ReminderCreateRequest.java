package jiihyun.ai.jihyunreminder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReminderCreateRequest(
        @NotNull Long listId,
        @NotBlank @Size(max = 200) String title,
        String memo
) {
}
