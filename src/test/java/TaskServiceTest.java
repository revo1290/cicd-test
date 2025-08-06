package com.example.taskmanager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class TaskServiceTest {
    
    @Mock
    private TaskRepository taskRepository;
    
    private TaskService taskService;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        taskService = new TaskService(taskRepository);
    }
    
    @Test
    @DisplayName("全てのタスクを取得できる")
    void shouldGetAllTasks() {
        // Given
        List<Task> expectedTasks = Arrays.asList(
            new Task(1L, "Task 1", false),
            new Task(2L, "Task 2", true)
        );
        when(taskRepository.findAll()).thenReturn(expectedTasks);
        
        // When
        List<Task> actualTasks = taskService.getAllTasks();
        
        // Then
        assertEquals(2, actualTasks.size());
        assertEquals(expectedTasks, actualTasks);
        verify(taskRepository).findAll();
    }
    
    @Test
    @DisplayName("新しいタスクを作成できる")
    void shouldCreateNewTask() {
        // Given
        String title = "New Task";
        Task expectedTask = new Task(1L, title, false);
        when(taskRepository.save(any(Task.class))).thenReturn(expectedTask);
        
        // When
        Task actualTask = taskService.createTask(title);
        
        // Then
        assertNotNull(actualTask);
        assertEquals(title, actualTask.getTitle());
        assertFalse(actualTask.isCompleted());
        verify(taskRepository).save(any(Task.class));
    }
    
    @Test
    @DisplayName("タスクの完了状態を切り替えできる")
    void shouldToggleTaskCompletion() {
        // Given
        Long taskId = 1L;
        Task task = new Task(taskId, "Test Task", false);
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        
        // When
        Task updatedTask = taskService.toggleTaskCompletion(taskId);
        
        // Then
        assertTrue(updatedTask.isCompleted());
        verify(taskRepository).findById(taskId);
        verify(taskRepository).save(task);
    }
    
    @Test
    @DisplayName("存在しないタスクの切り替えで例外が発生する")
    void shouldThrowExceptionWhenToggleNonExistentTask() {
        // Given
        Long taskId = 999L;
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(TaskNotFoundException.class, () -> {
            taskService.toggleTaskCompletion(taskId);
        });
        verify(taskRepository).findById(taskId);
        verify(taskRepository, never()).save(any(Task.class));
    }
    
    @Test
    @DisplayName("タスクを削除できる")
    void shouldDeleteTask() {
        // Given
        Long taskId = 1L;
        Task task = new Task(taskId, "Test Task", false);
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        
        // When
        taskService.deleteTask(taskId);
        
        // Then
        verify(taskRepository).findById(taskId);
        verify(taskRepository).delete(task);
    }
    
    @Test
    @DisplayName("完了済みタスクの数を取得できる")
    void shouldGetCompletedTaskCount() {
        // Given
        when(taskRepository.countByCompleted(true)).thenReturn(3L);
        
        // When
        long count = taskService.getCompletedTaskCount();
        
        // Then
        assertEquals(3L, count);
        verify(taskRepository).countByCompleted(true);
    }
}
