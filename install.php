<?php
// install.php
// Setup the database with the schema required by api/db_handler.php

// Do NOT include db_connect.php to avoid CLI issues with $_SERVER
// require_once 'config/db_connect.php'; 

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'school_report_db';

echo "Starting installation...\n";

try {
    // 1. Create DB if not exists
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    $pdo->exec("USE `$dbname`");

    echo "Database `$dbname` selected.\n";

    // 2. Drop mismatching tables if they exist (Clean Slate)
    $tables = ['schools', 'users', 'classes', 'subjects', 'students', 'grades', 'student_term_data', 'teacher_classes', 'academic_years', 'settings'];
    foreach ($tables as $t) {
        $pdo->exec("DROP TABLE IF EXISTS `$t`");
    }
    echo "Old tables cleared.\n";

    // 3. Create Correct Tables (Matching database_schema.sql and db_handler.php)

    // Schools
    $pdo->exec("CREATE TABLE `schools` (
      `id` varchar(50) NOT NULL,
      `name` varchar(255) DEFAULT NULL,
      `address` text DEFAULT NULL,
      `logo` longtext DEFAULT NULL,
      `contact_email` varchar(100) DEFAULT NULL,
      `contact_phone` varchar(50) DEFAULT NULL,
      `settings` json DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Users
    $pdo->exec("CREATE TABLE `users` (
      `id` varchar(50) NOT NULL,
      `school_id` varchar(50) DEFAULT NULL,
      `name` varchar(100) DEFAULT NULL,
      `email` varchar(100) DEFAULT NULL,
      `password` varchar(255) DEFAULT NULL,
      `role` varchar(20) DEFAULT NULL,
      `assigned_classes` json DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Classes
    $pdo->exec("CREATE TABLE `classes` (
      `id` varchar(50) NOT NULL,
      `school_id` varchar(50) DEFAULT NULL,
      `name` varchar(50) DEFAULT NULL,
      `subjects` json DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Subjects
    $pdo->exec("CREATE TABLE `subjects` (
      `id` varchar(50) NOT NULL,
      `school_id` varchar(50) DEFAULT NULL,
      `name` varchar(100) DEFAULT NULL,
      `code` varchar(20) DEFAULT NULL,
      `status` varchar(20) DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Students
    $pdo->exec("CREATE TABLE `students` (
      `id` varchar(50) NOT NULL,
      `school_id` varchar(50) DEFAULT NULL,
      `name` varchar(100) DEFAULT NULL,
      `class` varchar(50) DEFAULT NULL,
      `gender` varchar(10) DEFAULT NULL,
      `status` varchar(20) DEFAULT 'Active',
      `scores` json DEFAULT NULL,
      `attendance` json DEFAULT NULL,
      `teacher_remark` text DEFAULT NULL,
      `head_remark` text DEFAULT NULL,
      `conduct` varchar(50) DEFAULT NULL,
      `position` int(11) DEFAULT NULL,
      `total_students` int(11) DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    echo "Correct tables created successfully.\n";
} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
