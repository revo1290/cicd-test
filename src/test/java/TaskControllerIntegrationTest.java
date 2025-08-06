package com.example.taskmanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class TaskControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldGetAllTasks() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }
    
    @Test
    void shouldCreateNewTask() throws Exception {
        TaskCreateRequest request = new TaskCreateRequest("Integration Test Task");
        
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Integration Test Task")))
                .andExpect(jsonPath("$.completed", is(false)))
                .andExpect(jsonPath("$.id", notNullValue()));
    }
    
    @Test
    void shouldUpdateTaskCompletion() throws Exception {
        // まずタスクを作成
        TaskCreateRequest createRequest = new TaskCreateRequest("Task to Update");
        String response = mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        Task createdTask = objectMapper.readValue(response, Task.class);
        
        // タスクの完了状態を更新
        mockMvc.perform(put("/api/tasks/{id}/toggle", createdTask.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed", is(true)));
    }
    
    @Test
    void shouldDeleteTask() throws Exception {
        // まずタスクを作成
        TaskCreateRequest createRequest = new TaskCreateRequest("Task to Delete");
        String response = mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpected(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        Task createdTask = objectMapper.readValue(response, Task.class);
        
        // タスクを削除
        mockMvc.perform(delete("/api/tasks/{id}", createdTask.getId()))
                .andExpect(status().isNoContent());
        
        // 削除されたことを確認
        mockMvc.perform(get("/api/tasks/{id}", createdTask.getId()))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void shouldReturnNotFoundForNonExistentTask() throws Exception {
        mockMvc.perform(get("/api/tasks/999"))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void shouldValidateTaskCreationRequest() throws Exception {
        TaskCreateRequest invalidRequest = new TaskCreateRequest(""); // 空のタイトル
        
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
