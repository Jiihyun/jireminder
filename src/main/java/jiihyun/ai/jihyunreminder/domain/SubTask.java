package jiihyun.ai.jihyunreminder.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "sub_task")
public class SubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reminder_id", nullable = false)
    private Reminder reminder;

    @Column(nullable = false, length = 200)
    private String title;

    private boolean completed;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private SubTask(Reminder reminder, String title) {
        this.reminder = reminder;
        this.title = title;
        this.completed = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public static SubTask create(Reminder reminder, String title) {
        return new SubTask(reminder, title);
    }

    public void updateTitle(String title) {
        this.title = title;
        this.updatedAt = LocalDateTime.now();
    }

    public void toggleComplete() {
        this.completed = !this.completed;
        this.updatedAt = LocalDateTime.now();
    }
}
