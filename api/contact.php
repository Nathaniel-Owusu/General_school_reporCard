<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid input data"]);
        exit;
    }

    $firstName = $conn->real_escape_string($data['first_name'] ?? '');
    $lastName = $conn->real_escape_string($data['last_name'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $phone = $conn->real_escape_string($data['phone'] ?? '');
    $inquiryType = $conn->real_escape_string($data['inquiry_type'] ?? '');
    $messageBody = $conn->real_escape_string($data['message'] ?? '');
    $id = 'MSG_' . uniqid();

    // 1. Create table if not exists (fail-safe)
    $conn->query("CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(50) PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(50),
        inquiry_type VARCHAR(100),
        message TEXT,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. Save to database
    $stmt = $conn->prepare("INSERT INTO contact_messages (id, first_name, last_name, email, phone, inquiry_type, message) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $id, $firstName, $lastName, $email, $phone, $inquiryType, $messageBody);

    if ($stmt->execute()) {

        // 3. Send Email Notification
        $to = "owusuansahnathaniel21@gmail.com";
        $subject = "New Portal Inquiry: " . $inquiryType;

        $emailContent = "You have received a new message from the General School Contact Form.\n\n";
        $emailContent .= "Name: $firstName $lastName\n";
        $emailContent .= "Email: $email\n";
        $emailContent .= "Phone: $phone\n";
        $emailContent .= "Inquiry Type: $inquiryType\n\n";
        $emailContent .= "Message:\n$messageBody\n\n";
        $emailContent .= "--\nSent from General School Automated System";

        $headers = "From: noreply@studentreport.net\r\n";
        $headers .= "Reply-To: $email\r\n";

        // Send email (suppress errors if mail function fails on local env)
        @mail($to, $subject, $emailContent, $headers);

        echo json_encode(["success" => true, "message" => "Message sent successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save message to database"]);
    }

    $stmt->close();
    exit;
}
