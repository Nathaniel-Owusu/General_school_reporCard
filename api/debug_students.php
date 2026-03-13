<?php
require_once '../config/db_connect.php';
header('Content-Type: application/json');
$result = $conn->query("SELECT * FROM students LIMIT 5");
$data = [];
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data, JSON_PRETTY_PRINT);
