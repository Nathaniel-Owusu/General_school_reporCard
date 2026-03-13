<?php
header("Content-Type: text/plain");
require_once 'config/db_connect.php';

function addColumn($table, $column, $definition) {
    global $conn;
    $check = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($check->num_rows == 0) {
        echo "Adding '$column' to '$table'...\n";
        if ($conn->query("ALTER TABLE `$table` ADD COLUMN `$column` $definition")) {
            echo "SUCCESS\n";
        } else {
            echo "ERROR: " . $conn->error . "\n";
        }
    } else {
        echo "Column '$column' in '$table' already exists.\n";
    }
}

// Schools
addColumn('schools', 'logo', 'longtext DEFAULT NULL');
addColumn('schools', 'contact_email', 'varchar(100) DEFAULT NULL');
addColumn('schools', 'contact_phone', 'varchar(50) DEFAULT NULL');
addColumn('schools', 'settings', 'json DEFAULT NULL');
addColumn('schools', 'active', 'tinyint(1) DEFAULT 1');

// Users
addColumn('users', 'school_id', 'varchar(50) DEFAULT NULL');
addColumn('users', 'assigned_classes', 'json DEFAULT NULL');
addColumn('users', 'assigned_subjects', 'json DEFAULT NULL');

// Classes
addColumn('classes', 'school_id', 'varchar(50) DEFAULT NULL');
addColumn('classes', 'subjects', 'json DEFAULT NULL');
addColumn('classes', 'class_teacher_id', 'varchar(50) DEFAULT NULL');
addColumn('classes', 'level', 'varchar(20) DEFAULT NULL');
addColumn('classes', 'active', 'tinyint(1) DEFAULT 1');

// Subjects
addColumn('subjects', 'school_id', 'varchar(50) DEFAULT NULL');
addColumn('subjects', 'code', 'varchar(20) DEFAULT NULL');
addColumn('subjects', 'status', 'varchar(20) DEFAULT NULL');
addColumn('subjects', 'level', 'varchar(20) DEFAULT NULL');
addColumn('subjects', 'active', 'tinyint(1) DEFAULT 1');

// Students
addColumn('students', 'school_id', 'varchar(50) DEFAULT NULL');
addColumn('students', 'status', "varchar(20) DEFAULT 'Active'");
addColumn('students', 'scores', 'json DEFAULT NULL');
addColumn('students', 'attendance', 'json DEFAULT NULL');
addColumn('students', 'teacher_remark', 'text DEFAULT NULL');
addColumn('students', 'head_remark', 'text DEFAULT NULL');
addColumn('students', 'conduct', 'varchar(50) DEFAULT NULL');
addColumn('students', 'position', 'int(11) DEFAULT NULL');
addColumn('students', 'total_students', 'int(11) DEFAULT NULL');

echo "\nMigration finished.";
