<?php
// api/public_schools.php
// Public endpoint to fetch the list of active schools for the admissions page dropdown
header('Content-Type: application/json');

// Allow CORS if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/db_connect.php';

try {
    // Only fetch schools that are not deleted and are active
    $query = "SELECT id, name FROM schools WHERE deleted = 0 AND active = 1 ORDER BY name ASC";
    $result = $conn->query($query);

    $schools = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $schools[] = $row;
        }
    }

    echo json_encode(['success' => true, 'data' => $schools]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
