package com.ipter.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ipter.model.User;
import com.ipter.repository.UserRepository;

/**
 * Custom UserDetailsService implementation for Spring Security
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrLoginIdOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is deactivated: " + username);
        }
        
        return user;
    }
    
    /**
     * Load user by ID
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(String userId) throws UsernameNotFoundException {
        try {
            User user = userRepository.findById(java.util.UUID.fromString(userId))
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
            
            if (!user.isActive()) {
                throw new UsernameNotFoundException("User account is deactivated: " + userId);
            }
            
            return user;
        } catch (IllegalArgumentException e) {
            throw new UsernameNotFoundException("Invalid user ID format: " + userId);
        }
    }
}
