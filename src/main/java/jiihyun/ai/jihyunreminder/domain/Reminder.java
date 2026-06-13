package jiihyun.ai.jihyunreminder.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "reminder")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private ReminderList reminderList;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    private LocalDate dueDate;
    private LocalTime dueTime;

    private boolean completed;
    private LocalDateTime completedAt;

    private boolean flagged;

    @OneToMany(mappedBy = "reminder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubTask> subTasks = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Reminder(ReminderList reminderList, String title, String memo) {
        this.reminderList = reminderList;
        this.title = title;
        this.memo = memo;
        this.priority = Priority.NONE;
        this.completed = false;
        this.flagged = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public static Reminder create(ReminderList reminderList, String title, String memo) {
        return new Reminder(reminderList, title, memo);
    }

    public void update(String title, String memo, Priority priority, LocalDate dueDate, LocalTime dueTime) {
        if (title != null) this.title = title;
        if (memo != null) this.memo = memo;
        if (priority != null) this.priority = priority;
        this.dueDate = dueDate;
        this.dueTime = dueTime;
        this.updatedAt = LocalDateTime.now();
    }

    public void toggleComplete() {
        this.completed = !this.completed;
        this.completedAt = this.completed ? LocalDateTime.now() : null;
        this.updatedAt = LocalDateTime.now();
    }

    public void toggleFlag() {
        this.flagged = !this.flagged;
        this.updatedAt = LocalDateTime.now();
    }

    public void move(ReminderList targetList) {
        this.reminderList = targetList;
        this.updatedAt = LocalDateTime.now();
    }
}
