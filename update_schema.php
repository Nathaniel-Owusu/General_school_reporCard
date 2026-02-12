<?php
// update_schema.php
// Fix missing columns in database

header("Content-Type: text/plain");
require_once 'config/db_connect.php';

echo "Checking database schema...\n";

// 1. Add assigned_subjects to users if missing
$check = $conn->query("SHOW COLUMNS FROM users LIKE 'assigned_subjects'");
if ($check->num_rows == 0) {
    echo "Adding 'assigned_subjects' to 'users' table...\n";
    if ($conn->query("ALTER TABLE users ADD COLUMN assigned_subjects json DEFAULT NULL AFTER assigned_classes")) {
        echo "SUCCESS: Column added.\n";
    } else {
        echo "ERROR: " . $conn->error . "\n";
    }
} else {
    echo "Column 'assigned_subjects' already exists.\n";
}

// 2. Ensure active column exists in classes (db_handler uses it)
$check = $conn->query("SHOW COLUMNS FROM classes LIKE 'active'");
if ($check->num_rows == 0) {
    echo "Adding 'active' to 'classes' table...\n";
    if ($conn->query("ALTER TABLE classes ADD COLUMN active tinyint(1) DEFAULT 1")) {
        echo "SUCCESS: Column added.\n";
    } else {
        echo "ERROR: " . $conn->error . "\n";
    }
} else {
    echo "Column 'active' in 'classes' already exists.\n";
}

// 3. Ensure class_teacher_id in classes
$check = $conn->query("SHOW COLUMNS FROM classes LIKE 'class_teacher_id'");
if ($check->num_rows == 0) {
    echo "Adding 'class_teacher_id' to 'classes' table...\n";
    if ($conn->query("ALTER TABLE classes ADD COLUMN class_teacher_id varchar(50) DEFAULT NULL")) {
        echo "SUCCESS: Column added.\n";
    } else {
        echo "ERROR: " . $conn->error . "\n";
    }
} else {
    echo "Column 'class_teacher_id' in 'classes' already exists.\n";
}

echo "\nDone. You can now use the system.";
