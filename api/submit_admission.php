<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

// Create table if it doesn't exist
$table_sql = "CREATE TABLE IF NOT EXISTS admission_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($table_sql);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['school_id']) || !isset($data['first_name'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid input data."]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO admission_applications (school_id, first_name, last_name, dob, gender, parent_name, contact_phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param(
            "ssssssss",
            $data['school_id'],
            $data['first_name'],
            $data['last_name'],
            $data['dob'],
            $data['gender'],
            $data['parent_name'],
            $data['contact_phone'],
            $data['email']
        );

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Application submitted successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to save application."]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Database error.", "error" => $conn->error]);
    }
}
