<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['id']) || !isset($data['status'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid input data."]);
        exit;
    }

    $id = (int)$data['id'];
    $status = $data['status']; // 'Accepted' or 'Rejected'

    // Update status
    $stmt = $conn->prepare("UPDATE admission_applications SET status = ? WHERE id = ?");
    if ($stmt) {
        $stmt->bind_param("si", $status, $id);

        if ($stmt->execute()) {
            // Get application details to send email
            $app_stmt = $conn->prepare("SELECT * FROM admission_applications WHERE id = ?");
            $app_stmt->bind_param("i", $id);
            $app_stmt->execute();
            $res = $app_stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                // Manually fetch school to avoid collation join issues
                $school_name = 'General School';
                $school_email = 'admissions@generalschool.com';

                $s_stmt = $conn->prepare("SELECT name, contact_email FROM schools WHERE id = ?");
                $s_stmt->bind_param("s", $row['school_id']);
                $s_stmt->execute();
                $s_res = $s_stmt->get_result();
                if ($s_row = $s_res->fetch_assoc()) {
                    $school_name = $s_row['name'];
                    $school_email = $s_row['contact_email'];
                }
                $s_stmt->close();

                $applicant_email = $row['email'];
                $parent_name = $row['parent_name'];
                $student_name = $row['first_name'] . ' ' . $row['last_name'];

                // Send automated email if email was provided
                if (!empty($applicant_email)) {
                    $to = $applicant_email;
                    $subject = "Admission Application $status - $school_name";

                    if ($status === 'Accepted') {
                        $message = "Dear $parent_name,\n\nWe are extremely pleased to inform you that the admission application for $student_name to $school_name has been ACCEPTED!\n\nPlease contact the school's administration office to proceed with the enrollment procedures and to receive your secure login credentials to the Student Portal.\n\nWelcome to $school_name!\n\nBest Regards,\nAdmin Team";
                    } else {
                        $message = "Dear $parent_name,\n\nThank you for applying to $school_name on behalf of $student_name.\n\nAfter careful review, we regret to inform you that we are unable to offer admission at this time.\n\nWe wish $student_name the very best in their future academic endeavors.\n\nBest Regards,\nAdmin Team";
                    }

                    $headers = "From: no-reply@generalschool.com\r\nReply-To: $school_email\r\nCC: owusuansahnathaniel21@gmail.com\r\n";
                    if (!isset($_SERVER['HTTP_HOST']) || (strpos($_SERVER['HTTP_HOST'], 'localhost') === false && strpos($_SERVER['HTTP_HOST'], '127.0.0.1') === false)) {
                        @mail($to, $subject, $message, $headers);
                    }
                }
            }
            $app_stmt->close();

            echo json_encode(["success" => true, "message" => "Status updated to $status and applicant notified."]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update status."]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Database error.", "error" => $conn->error]);
    }
}
