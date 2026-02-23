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
            // Get school details for email notifications
            $school_stmt = $conn->prepare("SELECT name, contact_email FROM schools WHERE id = ?");
            $school_stmt->bind_param("s", $data['school_id']);
            $school_stmt->execute();
            $school_res = $school_stmt->get_result();
            $school_data = $school_res->fetch_assoc();
            $school_stmt->close();

            $school_name = $school_data['name'] ?? 'General School';
            $admin_email = $school_data['contact_email'] ?? 'owusuansahnathaniel21@gmail.com';

            // 1. Send Email to Applicant (if email provided)
            if (!empty($data['email'])) {
                $to_applicant = $data['email'];
                $subject_applicant = "Application Received - $school_name";
                $message_applicant = "Dear {$data['parent_name']},\n\nWe have successfully received the admission application for {$data['first_name']} {$data['last_name']} to $school_name. Our admissions office will review your application and contact you shortly regarding the next steps.\n\nThank you for choosing $school_name.\n\nBest Regards,\nAdmissions Team";
                $headers_applicant = "From: admissions@generalschool.com\r\nReply-To: $admin_email\r\n";
                if (!isset($_SERVER['HTTP_HOST']) || (strpos($_SERVER['HTTP_HOST'], 'localhost') === false && strpos($_SERVER['HTTP_HOST'], '127.0.0.1') === false)) {
                    @mail($to_applicant, $subject_applicant, $message_applicant, $headers_applicant);
                }
            }

            // 2. Send Email to School Admin & CC Super Admin
            if (!empty($admin_email)) {
                $to_admin = $admin_email;
                $subject_admin = "New Admission Application: {$data['first_name']} {$data['last_name']}";
                $message_admin = "Hello Admin,\n\nA new admission application has been submitted for $school_name.\n\nStudent: {$data['first_name']} {$data['last_name']}\nDOB: {$data['dob']} ({$data['gender']})\nParent/Guardian: {$data['parent_name']}\nPhone: {$data['contact_phone']}\nEmail: {$data['email']}\n\nPlease log in to your admin dashboard to review this application.\n\nBest Regards,\nGeneral School System";

                // Copy super admin on all admissions
                $headers_admin = "From: system@generalschool.com\r\nCC: owusuansahnathaniel21@gmail.com\r\n";
                if (!isset($_SERVER['HTTP_HOST']) || (strpos($_SERVER['HTTP_HOST'], 'localhost') === false && strpos($_SERVER['HTTP_HOST'], '127.0.0.1') === false)) {
                    @mail($to_admin, $subject_admin, $message_admin, $headers_admin);
                }
            }

            echo json_encode(["success" => true, "message" => "Application submitted successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to save application."]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Database error.", "error" => $conn->error]);
    }
}
