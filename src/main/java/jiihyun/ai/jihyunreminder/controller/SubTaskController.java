package jiihyun.ai.jihyunreminder.controller;

import jakarta.validation.Valid;
import jiihyun.ai.jihyunreminder.dto.request.SubTaskRequest;
import jiihyun.ai.jihyunreminder.dto.response.SubTaskResponse;
import jiihyun.ai.jihyunreminder.service.SubTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SubTaskController {

    private final SubTaskService subTaskService;

    @PostMapping("/api/reminders/{reminderId}/subtasks")
    public ResponseEntity<SubTaskResponse> create(
            @PathVariable Long reminderId,
            @Valid @RequestBody SubTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subTaskService.create(reminderId, request));
    }

    @PatchMapping("/api/subtasks/{id}")
    public ResponseEntity<SubTaskResponse> update(
            @PathVariable Long id,
            @RequestBody SubTaskRequest request) {
        return ResponseEntity.ok(subTaskService.update(id, request));
    }

    @PatchMapping("/api/subtasks/{id}/complete")
    public ResponseEntity<SubTaskResponse> toggleComplete(@PathVariable Long id) {
        return ResponseEntity.ok(subTaskService.toggleComplete(id));
    }

    @DeleteMapping("/api/subtasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subTaskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
