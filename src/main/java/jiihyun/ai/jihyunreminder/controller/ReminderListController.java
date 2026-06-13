package jiihyun.ai.jihyunreminder.controller;

import jakarta.validation.Valid;
import jiihyun.ai.jihyunreminder.dto.request.ReminderListRequest;
import jiihyun.ai.jihyunreminder.dto.response.ReminderListResponse;
import jiihyun.ai.jihyunreminder.service.ReminderListService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ReminderListController {

    private final ReminderListService reminderListService;

    @GetMapping
    public ResponseEntity<List<ReminderListResponse>> getAll() {
        return ResponseEntity.ok(reminderListService.findAll());
    }

    @PostMapping
    public ResponseEntity<ReminderListResponse> create(@Valid @RequestBody ReminderListRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderListService.create(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ReminderListResponse> update(
            @PathVariable Long id,
            @RequestBody ReminderListRequest request) {
        return ResponseEntity.ok(reminderListService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reminderListService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
