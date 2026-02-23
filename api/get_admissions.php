<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("
        SELECT a.*, s.name as school_name 
        FROM admission_applications a 
        LEFT JOIN schools s ON a.school_id = s.id 
        ORDER BY a.created_at DESC
    ");

    $applications = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $applications[] = $row;
        }
    }

    echo json_encode(["success" => true, "data" => $applications]);
}
