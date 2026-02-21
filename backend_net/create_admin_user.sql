-- Create Admin User for NakaeWorks
-- This script creates a default admin user for the system
-- Password is hashed using BCrypt
-- Plain text password: admin123
USE nakaeworks;
-- Insert admin user
INSERT INTO users (
        name,
        email,
        phone,
        password,
        role,
        status,
        served,
        avatar,
        created_at,
        updated_at
    )
VALUES (
        'Admin User',
        'admin@nakaeworks.com',
        '9876543210',
        '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Z8W.ipZMOt0K3PqLqQxqQwVqLqLqm',
        -- Password: admin123
        'admin',
        1,
        0,
        NULL,
        NOW(),
        NOW()
    );
-- Verify the admin user was created
SELECT id,
    name,
    email,
    role,
    status
FROM users
WHERE role = 'admin';
-- ============================================
-- Login Credentials:
-- ============================================
-- Email: admin@nakaeworks.com
-- Password: admin123
-- ============================================