CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email: admin@example.com
-- Password: admin123
INSERT IGNORE INTO users (email, password, role) VALUES
('admin@example.com', '$2y$12$WTAJ2t9IahSNAOvxbcjKxOhfmjR79b6NNVfVvBHD3tvjgKn1Tu7ny', 'admin');

-- Email: user@example.com
-- Password: user123
INSERT IGNORE INTO users (email, password, role) VALUES
('user@example.com', '$2y$12$/AFcK98XVQ.NoPm6suIure3nECgA5xPKiBaUI8F3XHrqQSxFX05Z6', 'user');
