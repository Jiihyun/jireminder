package jiihyun.ai.jihyunreminder.controller;

import jiihyun.ai.jihyunreminder.dto.response.SmartCountResponse;
import jiihyun.ai.jihyunreminder.service.SmartCountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/smart-counts")
@RequiredArgsConstructor
public class SmartCountController {

    private final SmartCountService smartCountService;

    @GetMapping
    public ResponseEntity<SmartCountResponse> getCounts() {
        return ResponseEntity.ok(smartCountService.getCounts());
    }
}
