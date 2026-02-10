-- Hostinger Database Schema
-- Import this file into your Hostinger phpMyAdmin

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Table structure for table `schools`
--
CREATE TABLE IF NOT EXISTS `schools` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `logo` longtext DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(50) NOT NULL,
  `school_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `assigned_classes` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `classes`
--
CREATE TABLE IF NOT EXISTS `classes` (
  `id` varchar(50) NOT NULL,
  `school_id` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `subjects` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `subjects`
--
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` varchar(50) NOT NULL,
  `school_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `students`
--
CREATE TABLE IF NOT EXISTS `students` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
