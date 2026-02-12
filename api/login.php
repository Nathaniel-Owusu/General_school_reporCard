<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid Request"]);
    exit;
}

$type = $input['type'] ?? 'staff';

if ($type === 'student') {
    if (!isset($input['id'])) {
        echo json_encode(["success" => false, "message" => "Missing Student ID"]);
        exit;
    }

    $id = $conn->real_escape_string($input['id']);
    $stmt = $conn->prepare("SELECT * FROM students WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        // Students usually don't have passwords in this MVP, so ID existence is enough
        // Or check DOB/Pin if added later
        unset($user['created_at']);
        // Parse JSON fields?
        $user['scores'] = json_decode($user['scores'] ?? '[]');
        $user['attendance'] = json_decode($user['attendance'] ?? '{}');

        echo json_encode(["success" => true, "user" => $user, "role" => "student"]);
    } else {
        echo json_encode(["success" => false, "message" => "Student ID not found"]);
    }
} else {
    // Staff Login
    if (!isset($input['email']) || !isset($input['password'])) {
        echo json_encode(["success" => false, "message" => "Missing credentials"]);
        exit;
    }

    $email = $conn->real_escape_string($input['email']);
    $password = $input['password'];

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        $verified = false;

        // 1. Check Hash
        if (password_verify($password, $user['password'])) {
            $verified = true;
        }
        // 2. Check Plain Text (Legacy/Seeded data)
        elseif ($password === $user['password']) {
            $verified = true;
        }

        if ($verified) {
            unset($user['password']); // Never send password back
            unset($user['created_at']);
            $user['assigned_classes'] = json_decode($user['assigned_classes'] ?? '[]');

            echo json_encode(["success" => true, "user" => $user]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
}
