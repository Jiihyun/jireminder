package jiihyun.ai.jihyunreminder.service;

import jiihyun.ai.jihyunreminder.domain.Reminder;
import jiihyun.ai.jihyunreminder.domain.SubTask;
import jiihyun.ai.jihyunreminder.dto.request.SubTaskRequest;
import jiihyun.ai.jihyunreminder.dto.response.SubTaskResponse;
import jiihyun.ai.jihyunreminder.exception.NotFoundException;
import jiihyun.ai.jihyunreminder.repository.ReminderRepository;
import jiihyun.ai.jihyunreminder.repository.SubTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SubTaskService {

    private final SubTaskRepository subTaskRepository;
    private final ReminderRepository reminderRepository;

    @Transactional
    public SubTaskResponse create(Long reminderId, SubTaskRequest request) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new NotFoundException("리마인더를 찾을 수 없습니다. id=" + reminderId));
        SubTask subTask = SubTask.create(reminder, request.title());
        return SubTaskResponse.from(subTaskRepository.save(subTask));
    }

    @Transactional
    public SubTaskResponse update(Long id, SubTaskRequest request) {
        SubTask subTask = findById(id);
        subTask.updateTitle(request.title());
        return SubTaskResponse.from(subTask);
    }

    @Transactional
    public SubTaskResponse toggleComplete(Long id) {
        SubTask subTask = findById(id);
        subTask.toggleComplete();
        return SubTaskResponse.from(subTask);
    }

    @Transactional
    public void delete(Long id) {
        SubTask subTask = findById(id);
        subTaskRepository.delete(subTask);
    }

    private SubTask findById(Long id) {
        return subTaskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("하위 태스크를 찾을 수 없습니다. id=" + id));
    }
}
