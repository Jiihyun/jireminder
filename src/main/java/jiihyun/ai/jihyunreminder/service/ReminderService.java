package jiihyun.ai.jihyunreminder.service;

import jiihyun.ai.jihyunreminder.domain.Reminder;
import jiihyun.ai.jihyunreminder.domain.ReminderList;
import jiihyun.ai.jihyunreminder.dto.request.ReminderCreateRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderMoveRequest;
import jiihyun.ai.jihyunreminder.dto.request.ReminderUpdateRequest;
import jiihyun.ai.jihyunreminder.dto.response.ReminderGroupResponse;
import jiihyun.ai.jihyunreminder.dto.response.ReminderResponse;
import jiihyun.ai.jihyunreminder.exception.NotFoundException;
import jiihyun.ai.jihyunreminder.repository.ReminderListRepository;
import jiihyun.ai.jihyunreminder.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final ReminderListRepository reminderListRepository;

    public ReminderGroupResponse findByListId(Long listId) {
        List<ReminderResponse> incomplete = reminderRepository
                .findByReminderListIdAndCompletedFalseOrderByCreatedAtAsc(listId)
                .stream().map(ReminderResponse::from).toList();
        List<ReminderResponse> completed = reminderRepository
                .findByReminderListIdAndCompletedTrueOrderByCompletedAtDesc(listId)
                .stream().map(ReminderResponse::from).toList();
        return new ReminderGroupResponse(incomplete, completed);
    }

    @Transactional
    public ReminderResponse create(ReminderCreateRequest request) {
        ReminderList list = reminderListRepository.findById(request.listId())
                .orElseThrow(() -> new NotFoundException("목록을 찾을 수 없습니다. id=" + request.listId()));
        Reminder reminder = Reminder.create(list, request.title(), request.memo());
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse update(Long id, ReminderUpdateRequest request) {
        Reminder reminder = findById(id);
        reminder.update(request.title(), request.memo(), request.priority(), request.dueDate(), request.dueTime());
        return ReminderResponse.from(reminder);
    }

    @Transactional
    public ReminderResponse toggleComplete(Long id) {
        Reminder reminder = findById(id);
        reminder.toggleComplete();
        return ReminderResponse.from(reminder);
    }

    @Transactional
    public ReminderResponse toggleFlag(Long id) {
        Reminder reminder = findById(id);
        reminder.toggleFlag();
        return ReminderResponse.from(reminder);
    }

    @Transactional
    public ReminderResponse move(Long id, ReminderMoveRequest request) {
        Reminder reminder = findById(id);
        ReminderList targetList = reminderListRepository.findById(request.listId())
                .orElseThrow(() -> new NotFoundException("목록을 찾을 수 없습니다. id=" + request.listId()));
        reminder.move(targetList);
        return ReminderResponse.from(reminder);
    }

    @Transactional
    public void delete(Long id) {
        Reminder reminder = findById(id);
        reminderRepository.delete(reminder);
    }

    private Reminder findById(Long id) {
        return reminderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("리마인더를 찾을 수 없습니다. id=" + id));
    }
}
