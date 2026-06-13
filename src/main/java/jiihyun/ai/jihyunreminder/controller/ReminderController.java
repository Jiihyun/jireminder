package jiihyun.ai.jihyunreminder.controller;

import jakarta.validation.Valid;
import jiihyun.ai.jihyunreminder.dto.request.ReminderCreateRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderUpdateRequest;
import jiihyun.ai.jihyunreminder.dto.response.ReminderGroupResponse;
import jiihyun.ai.jihyunreminder.dto.response.ReminderResponse;
import jiihyun.ai.jihyunreminder.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    @GetMapping
    public ResponseEntity<ReminderGroupResponse> findByListId(@RequestParam Long listId) {
        return ResponseEntity.ok(reminderService.findByListId(listId));
    }

    @PostMapping
    public ResponseEntity<ReminderResponse> create(@Valid @RequestBody ReminderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderService.create(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ReminderResponse> update(
            @PathVariable Long id,
            @RequestBody ReminderUpdateRequest request) {
        return ResponseEntity.ok(reminderService.update(id, request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ReminderResponse> toggleComplete(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.toggleComplete(id));
    }

    @PatchMapping("/{id}/flag")
    public ResponseEntity<ReminderResponse> toggleFlag(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.toggleFlag(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reminderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
