<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Avoid LEFT JOIN to prevent Hostinger "Illegal mix of collations" errors
    $schools_run = $conn->query("SELECT id, name FROM schools");
    $schools_map = [];
    if ($schools_run) {
        while ($s = $schools_run->fetch_assoc()) {
            $schools_map[$s['id']] = $s['name'];
        }
    }

    $school_id = $_GET['school_id'] ?? null;
    $query = "SELECT * FROM admission_applications";

    if ($school_id) {
        $stmt = $conn->prepare("SELECT * FROM admission_applications WHERE school_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("s", $school_id);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query("SELECT * FROM admission_applications ORDER BY created_at DESC");
    }
    $applications = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $row['school_name'] = $schools_map[$row['school_id']] ?? 'General School';
            $applications[] = $row;
        }
        echo json_encode(["success" => true, "data" => $applications]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    }
}
