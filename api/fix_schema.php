<?php
header('Content-Type: text/plain');
require_once '../config/db_connect.php';

echo "Database Schema Update Tool\n";
echo "---------------------------\n";

$queries = [
    // Ensure JSON columns are large enough (LONGTEXT) to prevent truncation
    "ALTER TABLE classes MODIFY subjects LONGTEXT",
    "ALTER TABLE users MODIFY assigned_classes LONGTEXT",
    "ALTER TABLE users MODIFY assigned_subjects LONGTEXT",
    "ALTER TABLE students MODIFY scores LONGTEXT",
    "ALTER TABLE students MODIFY attendance LONGTEXT",
    "ALTER TABLE schools MODIFY settings LONGTEXT"
];

foreach ($queries as $sql) {
    try {
        if ($conn->query($sql) === TRUE) {
            echo "SUCCESS: $sql\n";
        } else {
            echo "ERROR: $sql - " . $conn->error . "\n";
        }
    } catch (Exception $e) {
        echo "EXCEPTION: $sql - " . $e->getMessage() . "\n";
    }
}

echo "\nDone.";
