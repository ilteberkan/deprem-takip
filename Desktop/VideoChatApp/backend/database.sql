CREATE DATABASE IF NOT EXISTS videochat;
USE videochat;

-- Eğer users tablosu varsa yedekle
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.tables 
               WHERE table_schema = 'videochat' 
               AND table_name = 'users');

SET @sql := IF(@exist > 0,
    'CREATE TABLE users_backup AS SELECT * FROM users',
    'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mevcut tabloları temizle
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS users;

-- Users tablosunu oluştur
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  isVerified BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  country VARCHAR(100) DEFAULT 'Belirtilmemiş',
  profileImage VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  socialMedia JSON DEFAULT NULL
);

-- Blog yazıları için tablo
CREATE TABLE blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Eğer yedek tablo varsa, verileri geri yükle
SET @exist := (SELECT COUNT(*) 
               FROM information_schema.tables 
               WHERE table_schema = 'videochat' 
               AND table_name = 'users_backup');

SET @sql := IF(@exist > 0,
    'INSERT INTO users (id, firstName, lastName, email, password, age, isVerified, createdAt)
     SELECT id, firstName, lastName, email, password, age, isVerified, createdAt
     FROM users_backup;
     DROP TABLE users_backup;',
    'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 