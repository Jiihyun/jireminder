package jiihyun.ai.jihyunreminder.dto.response;

public record SmartCountResponse(
        long today,
        long scheduled,
        long all,
        long flagged,
        long completed
) {
}
