package com.example.cicd.service;

import com.example.cicd.model.User;
import com.example.cicd.repository.UserRepository;
import com.example.cicd.exception.UserNotFoundException;
import com.example.cicd.exception.DuplicateEmailException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.List;
import java.util.Arrays;

@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    private UserService userService;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepository, passwordEncoder);
    }
    
    @Nested
    @DisplayName("User Creation Tests")
    class UserCreationTests {
        
        @Test
        @DisplayName("Should create user with valid data")
        void shouldCreateUserWithValidData() {
            // Given
            String email = "test@example.com";
            String password = "password123";
            String encodedPassword = "encoded_password";
            
            User expectedUser = new User();
            expectedUser.setId(1L);
            expectedUser.setEmail(email);
            expectedUser.setPassword(encodedPassword);
            
            when(userRepository.existsByEmail(email)).thenReturn(false);
            when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
            when(userRepository.save(any(User.class))).thenReturn(expectedUser);
            
            // When
            User actualUser = userService.createUser(email, password);
            
            // Then
            assertNotNull(actualUser);
            assertEquals(email, actualUser.getEmail());
            assertEquals(encodedPassword, actualUser.getPassword());
            
            verify(userRepository).existsByEmail(email);
            verify(passwordEncoder).encode(password);
            verify(userRepository).save(any(User.class));
        }
        
        @Test
        @DisplayName("Should throw exception when email already exists")
        void shouldThrowExceptionWhenEmailAlreadyExists() {
            // Given
            String email = "existing@example.com";
            String password = "password123";
            
            when(userRepository.existsByEmail(email)).thenReturn(true);
            
            // When & Then
            assertThrows(DuplicateEmailException.class, () -> {
                userService.createUser(email, password);
            });
            
            verify(userRepository).existsByEmail(email);
            verify(passwordEncoder, never()).encode(anyString());
            verify(userRepository, never()).save(any(User.class));
        }
        
        @Test
        @DisplayName("Should throw exception with null email")
        void shouldThrowExceptionWithNullEmail() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () -> {
                userService.createUser(null, "password123");
            });
        }
        
        @Test
        @DisplayName("Should throw exception with empty password")
        void shouldThrowExceptionWithEmptyPassword() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () -> {
                userService.createUser("test@example.com", "");
            });
        }
    }
    
    @Nested
    @DisplayName("User Retrieval Tests")
    class UserRetrievalTests {
        
        @Test
        @DisplayName("Should find user by ID")
        void shouldFindUserById() {
            // Given
            Long userId = 1L;
            User expectedUser = new User();
            expectedUser.setId(userId);
            expectedUser.setEmail("test@example.com");
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));
            
            // When
            User actualUser = userService.findById(userId);
            
            // Then
            assertNotNull(actualUser);
            assertEquals(userId, actualUser.getId());
            assertEquals("test@example.com", actualUser.getEmail());
            
            verify(userRepository).findById(userId);
        }
        
        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            // Given
            Long userId = 999L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());
            
            // When & Then
            assertThrows(UserNotFoundException.class, () -> {
                userService.findById(userId);
            });
            
            verify(userRepository).findById(userId);
        }
        
        @Test
        @DisplayName("Should find user by email")
        void shouldFindUserByEmail() {
            // Given
            String email = "test@example.com";
            User expectedUser = new User();
            expectedUser.setEmail(email);
            
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(expectedUser));
            
            // When
            User actualUser = userService.findByEmail(email);
            
            // Then
            assertNotNull(actualUser);
            assertEquals(email, actualUser.getEmail());
            
            verify(userRepository).findByEmail(email);
        }
        
        @Test
        @DisplayName("Should get all users")
        void shouldGetAllUsers() {
            // Given
            List<User> expectedUsers = Arrays.asList(
                createUser(1L, "user1@example.com"),
                createUser(2L, "user2@example.com"),
                createUser(3L, "user3@example.com")
            );
            
            when(userRepository.findAll()).thenReturn(expectedUsers);
            
            // When
            List<User> actualUsers = userService.getAllUsers();
            
            // Then
            assertEquals(3, actualUsers.size());
            assertEquals(expectedUsers, actualUsers);
            
            verify(userRepository).findAll();
        }
    }
    
    @Nested
    @DisplayName("User Update Tests")
    class UserUpdateTests {
        
        @Test
        @DisplayName("Should update user email")
        void shouldUpdateUserEmail() {
            // Given
            Long userId = 1L;
            String newEmail = "newemail@example.com";
            
            User existingUser = createUser(userId, "old@example.com");
            User updatedUser = createUser(userId, newEmail);
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
            when(userRepository.existsByEmail(newEmail)).thenReturn(false);
            when(userRepository.save(existingUser)).thenReturn(updatedUser);
            
            // When
            User result = userService.updateEmail(userId, newEmail);
            
            // Then
            assertEquals(newEmail, result.getEmail());
            
            verify(userRepository).findById(userId);
            verify(userRepository).existsByEmail(newEmail);
            verify(userRepository).save(existingUser);
        }
        
        @Test
        @DisplayName("Should update user password")
        void shouldUpdateUserPassword() {
            // Given
            Long userId = 1L;
            String newPassword = "newpassword123";
            String encodedPassword = "encoded_new_password";
            
            User existingUser = createUser(userId, "test@example.com");
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
            when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);
            when(userRepository.save(existingUser)).thenReturn(existingUser);
            
            // When
            userService.updatePassword(userId, newPassword);
            
            // Then
            verify(userRepository).findById(userId);
            verify(passwordEncoder).encode(newPassword);
            verify(userRepository).save(existingUser);
        }
    }
    
    @Nested
    @DisplayName("User Deletion Tests")
    class UserDeletionTests {
        
        @Test
        @DisplayName("Should delete user by ID")
        void shouldDeleteUserById() {
            // Given
            Long userId = 1L;
            User existingUser = createUser(userId, "test@example.com");
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
            
            // When
            userService.deleteUser(userId);
            
            // Then
            verify(userRepository).findById(userId);
            verify(userRepository).delete(existingUser);
        }
        
        @Test
        @DisplayName("Should throw exception when deleting non-existent user")
        void shouldThrowExceptionWhenDeletingNonExistentUser() {
            // Given
            Long userId = 999L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());
            
            // When & Then
            assertThrows(UserNotFoundException.class, () -> {
                userService.deleteUser(userId);
            });
            
            verify(userRepository).findById(userId);
            verify(userRepository, never()).delete(any(User.class));
        }
    }
    
    @Nested
    @DisplayName("Authentication Tests")
    class AuthenticationTests {
        
        @Test
        @DisplayName("Should authenticate user with correct credentials")
        void shouldAuthenticateUserWithCorrectCredentials() {
            // Given
            String email = "test@example.com";
            String password = "password123";
            String encodedPassword = "encoded_password";
            
            User user = createUser(1L, email);
            user.setPassword(encodedPassword);
            
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(password, encodedPassword)).thenReturn(true);
            
            // When
            boolean result = userService.authenticate(email, password);
            
            // Then
            assertTrue(result);
            
            verify(userRepository).findByEmail(email);
            verify(passwordEncoder).matches(password, encodedPassword);
        }
        
        @Test
        @DisplayName("Should fail authentication with incorrect password")
        void shouldFailAuthenticationWithIncorrectPassword() {
            // Given
            String email = "test@example.com";
            String password = "wrongpassword";
            String encodedPassword = "encoded_password";
            
            User user = createUser(1L, email);
            user.setPassword(encodedPassword);
            
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(password, encodedPassword)).thenReturn(false);
            
            // When
            boolean result = userService.authenticate(email, password);
            
            // Then
            assertFalse(result);
            
            verify(userRepository).findByEmail(email);
            verify(passwordEncoder).matches(password, encodedPassword);
        }
        
        @Test
        @DisplayName("Should fail authentication with non-existent email")
        void shouldFailAuthenticationWithNonExistentEmail() {
            // Given
            String email = "nonexistent@example.com";
            String password = "password123";
            
            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
            
            // When
            boolean result = userService.authenticate(email, password);
            
            // Then
            assertFalse(result);
            
            verify(userRepository).findByEmail(email);
            verify(passwordEncoder, never()).matches(anyString(), anyString());
        }
    }
    
    // Helper method
    private User createUser(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setPassword("encoded_password");
        return user;
    }
}
