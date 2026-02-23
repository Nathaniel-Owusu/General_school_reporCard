<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

// GET MESSAGES
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    try {
        $result = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $messages = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $messages[] = [
                    'id' => $row['id'],
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'inquiry_type' => $row['inquiry_type'],
                    'message' => $row['message'],
                    'is_read' => (bool)$row['is_read'],
                    'created_at' => $row['created_at']
                ];
            }
        }
        echo json_encode(["success" => true, "messages" => $messages]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// POST ACTIONS (Mark as read, Delete)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['action']) || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid input data"]);
        exit;
    }

    $id = $conn->real_escape_string($data['id']);

    if ($data['action'] === 'mark_read') {
        $stmt = $conn->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
        $stmt->bind_param("s", $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update message"]);
        }
        $stmt->close();
    } elseif ($data['action'] === 'delete') {
        $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->bind_param("s", $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to delete message"]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Unknown action"]);
    }
    exit;
}
