package jiihyun.ai.jihyunreminder.service;

import jiihyun.ai.jihyunreminder.domain.ListColor;
import jiihyun.ai.jihyunreminder.domain.ReminderList;
import jiihyun.ai.jihyunreminder.dto.request.ReminderListRequest;
import jiihyun.ai.jihyunreminder.dto.response.ReminderListResponse;
import jiihyun.ai.jihyunreminder.exception.NotFoundException;
import jiihyun.ai.jihyunreminder.repository.ReminderListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReminderListService {

    private final ReminderListRepository reminderListRepository;

    public List<ReminderListResponse> findAll() {
        return reminderListRepository.findAll()
                .stream()
                .map(ReminderListResponse::from)
                .toList();
    }

    @Transactional
    public ReminderListResponse create(ReminderListRequest request) {
        ListColor color = request.color() != null ? request.color() : ListColor.BLUE;
        ReminderList reminderList = ReminderList.create(request.name(), color, request.icon());
        return ReminderListResponse.from(reminderListRepository.save(reminderList));
    }

    @Transactional
    public ReminderListResponse update(Long id, ReminderListRequest request) {
        ReminderList reminderList = findById(id);
        reminderList.update(request.name(), request.color(), request.icon());
        return ReminderListResponse.from(reminderList);
    }

    @Transactional
    public void delete(Long id) {
        findById(id);
        reminderListRepository.deleteById(id);
    }

    private ReminderList findById(Long id) {
        return reminderListRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("목록을 찾을 수 없습니다. id=" + id));
    }
}
