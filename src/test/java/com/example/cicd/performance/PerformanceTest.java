package com.example.cicd.performance;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Timeout;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@DisplayName("Performance Tests")
class PerformanceTest {

    private UserService userService;
    private TaskService taskService;
    
    @BeforeEach
    void setUp() {
        // Initialize services
    }
    
    @Test
    @DisplayName("Should handle high concurrent user creation")
    @Timeout(value = 30, unit = TimeUnit.SECONDS)
    void shouldHandleHighConcurrentUserCreation() throws Exception {
        int numberOfThreads = 100;
        int usersPerThread = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        
        List<Future<Boolean>> futures = new ArrayList<>();
        
        // Submit concurrent user creation tasks
        for (int i = 0; i < numberOfThreads; i++) {
            final int threadId = i;
            Future<Boolean> future = executor.submit(() -> {
                try {
                    for (int j = 0; j < usersPerThread; j++) {
                        String email = String.format("user%d_%d@test.com", threadId, j);
                        userService.createUser(email, "password123");
                    }
                    return true;
                } catch (Exception e) {
                    return false;
                }
            });
            futures.add(future);
        }
        
        // Wait for all tasks to complete
        int successCount = 0;
        for (Future<Boolean> future : futures) {
            if (future.get()) {
                successCount++;
            }
        }
        
        executor.shutdown();
        
        // Assert that at least 95% of operations succeeded
        double successRate = (double) successCount / numberOfThreads;
        assertTrue(successRate >= 0.95, 
            String.format("Success rate was %.2f%%, expected at least 95%%", successRate * 100));
    }
    
    @Test
    @DisplayName("Should maintain response time under load")
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void shouldMaintainResponseTimeUnderLoad() throws Exception {
        int numberOfRequests = 1000;
        List<CompletableFuture<Long>> futures = new ArrayList<>();
        
        // Execute requests concurrently and measure response times
        for (int i = 0; i < numberOfRequests; i++) {
            final int requestId = i;
            CompletableFuture<Long> future = CompletableFuture.supplyAsync(() -> {
                long startTime = System.currentTimeMillis();
                try {
                    // Simulate API call
                    userService.findById((long) (requestId % 100 + 1));
                    return System.currentTimeMillis() - startTime;
                } catch (Exception e) {
                    return -1L; // Error indicator
                }
            });
            futures.add(future);
        }
        
        // Collect response times
        List<Long> responseTimes = new ArrayList<>();
        for (CompletableFuture<Long> future : futures) {
            Long responseTime = future.get();
            if (responseTime > 0) {
                responseTimes.add(responseTime);
            }
        }
        
        // Calculate statistics
        double averageResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
        
        long maxResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .max()
            .orElse(0L);
        
        // Assert performance requirements
        assertTrue(averageResponseTime < 100, 
            String.format("Average response time was %.2fms, expected < 100ms", averageResponseTime));
        assertTrue(maxResponseTime < 500, 
            String.format("Max response time was %dms, expected < 500ms", maxResponseTime));
        
        // Assert success rate
        double successRate = (double) responseTimes.size() / numberOfRequests;
        assertTrue(successRate >= 0.99, 
            String.format("Success rate was %.2f%%, expected at least 99%%", successRate * 100));
    }
    
    @RepeatedTest(10)
    @DisplayName("Should consistently perform database operations")
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void shouldConsistentlyPerformDatabaseOperations() {
        long startTime = System.currentTimeMillis();
        
        // Perform a series of database operations
        User user = userService.createUser("perf_test@example.com", "password");
        assertNotNull(user);
        
        Task task = taskService.createTask("Performance test task", user.getId());
        assertNotNull(task);
        
        Task updatedTask = taskService.toggleTaskCompletion(task.getId());
        assertTrue(updatedTask.isCompleted());
        
        taskService.deleteTask(task.getId());
        userService.deleteUser(user.getId());
        
        long executionTime = System.currentTimeMillis() - startTime;
        
        // Assert execution time is within acceptable range
        assertTrue(executionTime < 1000, 
            String.format("Operation took %dms, expected < 1000ms", executionTime));
    }
    
    @Test
    @DisplayName("Should handle memory-intensive operations")
    @Timeout(value = 30, unit = TimeUnit.SECONDS)
    void shouldHandleMemoryIntensiveOperations() {
        Runtime runtime = Runtime.getRuntime();
        long initialMemory = runtime.totalMemory() - runtime.freeMemory();
        
        // Perform memory-intensive operations
        List<User> users = new ArrayList<>();
        for (int i = 0; i < 10000; i++) {
            User user = new User();
            user.setEmail("memory_test_" + i + "@example.com");
            user.setPassword("password123");
            users.add(user);
        }
        
        // Process users in batches
        int batchSize = 100;
        for (int i = 0; i < users.size(); i += batchSize) {
            int endIndex = Math.min(i + batchSize, users.size());
            List<User> batch = users.subList(i, endIndex);
            
            // Simulate processing
            batch.forEach(user -> {
                user.setPassword(user.getPassword().toUpperCase());
            });
        }
        
        // Force garbage collection
        System.gc();
        Thread.sleep(1000);
        
        long finalMemory = runtime.totalMemory() - runtime.freeMemory();
        long memoryIncrease = finalMemory - initialMemory;
        
        // Assert memory usage is reasonable (less than 100MB increase)
        assertTrue(memoryIncrease < 100 * 1024 * 1024, 
            String.format("Memory increased by %d bytes, expected < 100MB", memoryIncrease));
    }
    
    @Test
    @DisplayName("Should handle database connection pool efficiently")
    @Timeout(value = 45, unit = TimeUnit.SECONDS)
    void shouldHandleDatabaseConnectionPoolEfficiently() throws Exception {
        int numberOfThreads = 50;
        int operationsPerThread = 20;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        
        List<Future<Boolean>> futures = new ArrayList<>();
        
        for (int i = 0; i < numberOfThreads; i++) {
            final int threadId = i;
            Future<Boolean> future = executor.submit(() -> {
                try {
                    for (int j = 0; j < operationsPerThread; j++) {
                        // Mix of read and write operations
                        if (j % 2 == 0) {
                            userService.getAllUsers();
                        } else {
                            String email = String.format("pool_test_%d_%d@example.com", threadId, j);
                            User user = userService.createUser(email, "password");
                            userService.deleteUser(user.getId());
                        }
                        
                        // Small delay to simulate real usage
                        Thread.sleep(10);
                    }
                    return true;
                } catch (Exception e) {
                    return false;
                }
            });
            futures.add(future);
        }
        
        // Wait for completion and check results
        int successCount = 0;
        for (Future<Boolean> future : futures) {
            if (future.get()) {
                successCount++;
            }
        }
        
        executor.shutdown();
        
        double successRate = (double) successCount / numberOfThreads;
        assertTrue(successRate >= 0.98, 
            String.format("Success rate was %.2f%%, expected at least 98%%", successRate * 100));
    }
}
