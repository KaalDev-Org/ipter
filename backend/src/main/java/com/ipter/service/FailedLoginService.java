package com.ipter.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.ipter.model.User;
import com.ipter.repository.UserRepository;

/**
 * Service for handling failed login attempts in a separate transaction
 */
@Service
public class FailedLoginService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Handle failed login attempt in a separate transaction
     * This ensures the failed login count is persisted even if the main authentication transaction fails
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int handleFailedLoginAttempt(String username) {
        System.out.println("DEBUG: Handling failed login attempt in separate transaction for user: " + username);
        Optional<User> userOpt = userRepository.findByUsernameOrLoginIdOrEmail(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("DEBUG: Current failed attempts: " + user.getFailedLoginAttempts());

            // Increment failed login attempts
            int newFailedAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newFailedAttempts);
            user.setUpdatedAt(LocalDateTime.now());

            System.out.println("DEBUG: New failed attempts count: " + newFailedAttempts);

            // Check if account should be locked after this failed attempt
            if (newFailedAttempts >= 5) {
                System.out.println("DEBUG: Locking account due to " + newFailedAttempts + " failed attempts");
                user.setActive(false);
            }

            // Save the updated user
            System.out.println("DEBUG: Saving user with updated failed attempts in separate transaction");
            User savedUser = userRepository.save(user);
            System.out.println("DEBUG: User saved successfully with failed attempts: " + savedUser.getFailedLoginAttempts());

            return newFailedAttempts;
        } else {
            System.out.println("DEBUG: User not found in separate transaction for username: " + username);
            return 0;
        }
    }

    /**
     * Reset failed login attempts for a user (called on successful login)
     */
    @Transactional
    public void resetFailedLoginAttempts(String username) {
        Optional<User> userOpt = userRepository.findByUsernameOrLoginIdOrEmail(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getFailedLoginAttempts() > 0) {
                System.out.println("DEBUG: Resetting failed login attempts for user: " + username);
                user.setFailedLoginAttempts(0);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            }
        }
    }
}
