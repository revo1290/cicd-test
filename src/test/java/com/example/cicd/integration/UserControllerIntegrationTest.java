package com.example.cicd.integration;

import com.example.cicd.model.User;
import com.example.cicd.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
@DisplayName("User Controller Integration Tests")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create new user via REST API")
    void shouldCreateNewUserViaRestApi() throws Exception {
        // Given
        String userJson = """
            {
                "email": "newuser@example.com",
                "password": "password123",
                "firstName": "John",
                "lastName": "Doe"
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("newuser@example.com")))
                .andExpect(jsonPath("$.firstName", is("John")))
                .andExpect(jsonPath("$.lastName", is("Doe")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.password").doesNotExist()); // Password should not be returned
    }

    @Test
    @DisplayName("Should get user by ID")
    void shouldGetUserById() throws Exception {
        // Given
        User savedUser = createAndSaveUser("test@example.com", "Test", "User");

        // When & Then
        mockMvc.perform(get("/api/users/{id}", savedUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedUser.getId().intValue())))
                .andExpect(jsonPath("$.email", is("test@example.com")))
                .andExpect(jsonPath("$.firstName", is("Test")))
                .andExpect(jsonPath("$.lastName", is("User")));
    }

    @Test
    @DisplayName("Should return 404 for non-existent user")
    void shouldReturn404ForNonExistentUser() throws Exception {
        mockMvc.perform(get("/api/users/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should get all users")
    void shouldGetAllUsers() throws Exception {
        // Given
        createAndSaveUser("user1@example.com", "User", "One");
        createAndSaveUser("user2@example.com", "User", "Two");
        createAndSaveUser("user3@example.com", "User", "Three");

        // When & Then
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].email", is("user1@example.com")))
                .andExpect(jsonPath("$[1].email", is("user2@example.com")))
                .andExpect(jsonPath("$[2].email", is("user3@example.com")));
    }

    @Test
    @DisplayName("Should update user")
    void shouldUpdateUser() throws Exception {
        // Given
        User savedUser = createAndSaveUser("original@example.com", "Original", "Name");
        
        String updateJson = """
            {
                "email": "updated@example.com",
                "firstName": "Updated",
                "lastName": "Name"
            }
            """;

        // When & Then
        mockMvc.perform(put("/api/users/{id}", savedUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("updated@example.com")))
                .andExpect(jsonPath("$.firstName", is("Updated")))
                .andExpect(jsonPath("$.lastName", is("Name")));
    }

    @Test
    @DisplayName("Should delete user")
    void shouldDeleteUser() throws Exception {
        // Given
        User savedUser = createAndSaveUser("todelete@example.com", "To", "Delete");

        // When & Then
        mockMvc.perform(delete("/api/users/{id}", savedUser.getId()))
                .andExpect(status().isNoContent());

        // Verify user is deleted
        mockMvc.perform(get("/api/users/{id}", savedUser.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should validate user creation request")
    void shouldValidateUserCreationRequest() throws Exception {
        // Given - Invalid user data (missing required fields)
        String invalidUserJson = """
            {
                "email": "",
                "password": "123"
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidUserJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("Should prevent duplicate email registration")
    void shouldPreventDuplicateEmailRegistration() throws Exception {
        // Given
        createAndSaveUser("duplicate@example.com", "First", "User");
        
        String duplicateUserJson = """
            {
                "email": "duplicate@example.com",
                "password": "password123",
                "firstName": "Second",
                "lastName": "User"
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(duplicateUserJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Email already exists")));
    }

    @Test
    @DisplayName("Should authenticate user with correct credentials")
    void shouldAuthenticateUserWithCorrectCredentials() throws Exception {
        // Given
        createAndSaveUser("auth@example.com", "Auth", "User");
        
        String loginJson = """
            {
                "email": "auth@example.com",
                "password": "password123"
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("auth@example.com")));
    }

    @Test
    @DisplayName("Should reject authentication with incorrect credentials")
    void shouldRejectAuthenticationWithIncorrectCredentials() throws Exception {
        // Given
        createAndSaveUser("auth@example.com", "Auth", "User");
        
        String loginJson = """
            {
                "email": "auth@example.com",
                "password": "wrongpassword"
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Invalid credentials")));
    }

    @Test
    @DisplayName("Should search users by email pattern")
    void shouldSearchUsersByEmailPattern() throws Exception {
        // Given
        createAndSaveUser("john.doe@example.com", "John", "Doe");
        createAndSaveUser("jane.doe@example.com", "Jane", "Doe");
        createAndSaveUser("bob.smith@example.com", "Bob", "Smith");

        // When & Then
        mockMvc.perform(get("/api/users/search")
                .param("email", "doe@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].email", containsInAnyOrder(
                    "john.doe@example.com", 
                    "jane.doe@example.com"
                )));
    }

    @Test
    @DisplayName("Should handle pagination for user list")
    void shouldHandlePaginationForUserList() throws Exception {
        // Given - Create 15 users
        for (int i = 1; i <= 15; i++) {
            createAndSaveUser("user" + i + "@example.com", "User", String.valueOf(i));
        }

        // When & Then - First page
        mockMvc.perform(get("/api/users")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.totalElements", is(15)))
                .andExpect(jsonPath("$.totalPages", is(2)))
                .andExpect(jsonPath("$.first", is(true)))
                .andExpect(jsonPath("$.last", is(false)));

        // Second page
        mockMvc.perform(get("/api/users")
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.first", is(false)))
                .andExpect(jsonPath("$.last", is(true)));
    }

    private User createAndSaveUser(String email, String firstName, String lastName) {
        User user = new User();
        user.setEmail(email);
        user.setPassword("$2a$10$encoded.password.hash"); // Pre-encoded password
        user.setFirstName(firstName);
        user.setLastName(lastName);
        return userRepository.save(user);
    }
}
