<?php
// create_super_admin.php
// Manually insert the Super Admin user if missing

header("Content-Type: text/plain");
require_once 'config/db_connect.php';

$id = 'SUPERADM_001';
$name = 'Super Administrator';
$email = 'superadmin@system.com';
$password = 'superadmin123'; // Plain text for now as per login.php legacy support
// Ideally hash it: $password = password_hash('superadmin123', PASSWORD_DEFAULT);

$role = 'super_admin';

// Check if exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo "Super Admin already exists.\n";
} else {
    $stmt = $conn->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $id, $name, $email, $password, $role);

    if ($stmt->execute()) {
        echo "SUCCESS: Super Admin created.\n";
        echo "Email: $email\n";
        echo "Password: $password\n";
    } else {
        echo "ERROR: " . $stmt->error . "\n";
    }
}
