package jiihyun.ai.jihyunreminder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jiihyun.ai.jihyunreminder.domain.ListColor;

public record ReminderListRequest(
        @NotBlank(message = "목록 이름은 필수입니다")
        @Size(max = 50, message = "목록 이름은 50자 이하여야 합니다")
        String name,
        ListColor color,
        String icon
) {
}
