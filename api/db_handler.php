<?php
// MySQL-backed Database Handler
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/db_connect.php';

// Helper to track sync state
function get_server_timestamp()
{
    // Return timestamp stored in DB or file. File is easier for this hybrid approach.
    $file = 'last_update.timestamp';
    if (file_exists($file)) return (int)file_get_contents($file);
    return 0;
}
function set_server_timestamp($ts)
{
    file_put_contents('last_update.timestamp', $ts);
}

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// READ (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $response = [
        "schools" => [],
        "users" => [],
        "classes" => [],
        "subjects" => [],
        "students" => [],
        "last_updated" => get_server_timestamp()
    ];

    // Fetch Schools
    $result = $conn->query("SELECT * FROM schools");
    while ($row = $result->fetch_assoc()) {
        $row['settings'] = json_decode($row['settings']);
        if (isset($row['active'])) $row['active'] = (bool)$row['active'];
        unset($row['created_at']);
        $response['schools'][] = $row;
    }

    // Fetch Users
    $result = $conn->query("SELECT * FROM users");
    while ($row = $result->fetch_assoc()) {
        $row['assigned_classes'] = json_decode($row['assigned_classes']);
        $row['assigned_subjects'] = json_decode($row['assigned_subjects'] ?? '[]');
        unset($row['created_at']);
        $response['users'][] = $row;
    }

    // Fetch Classes
    $result = $conn->query("SELECT * FROM classes");
    while ($row = $result->fetch_assoc()) {
        $row['subjects'] = json_decode($row['subjects']);
        $row['active'] = (bool)$row['active']; // Ensure boolean type
        unset($row['created_at']);
        $response['classes'][] = $row;
    }

    // Fetch Subjects
    $result = $conn->query("SELECT * FROM subjects");
    while ($row = $result->fetch_assoc()) {
        unset($row['created_at']);
        $response['subjects'][] = $row;
    }

    // Fetch Students
    $result = $conn->query("SELECT * FROM students");
    while ($row = $result->fetch_assoc()) {
        $row['scores'] = json_decode($row['scores']);
        $row['attendance'] = json_decode($row['attendance']);
        unset($row['created_at']);
        $response['students'][] = $row;
    }

    echo json_encode($response);
    exit;
}

// WRITE (POST) - Full Sync Strategy
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON"]);
        exit;
    }

    // Update Timestamp
    $new_ts = $data['last_updated'] ?? (time() * 1000);
    set_server_timestamp($new_ts);

    // Transaction for Atomicity
    $conn->begin_transaction();

    try {
        // Clear existing data (Full Refresh Strategy)
        // Preserve super_admin accounts during sync
        $conn->query("SET FOREIGN_KEY_CHECKS = 0");
        $conn->query("DELETE FROM students");
        $conn->query("DELETE FROM subjects");
        $conn->query("DELETE FROM classes");
        $conn->query("DELETE FROM users WHERE role != 'super_admin'");
        $conn->query("DELETE FROM schools");
        $conn->query("SET FOREIGN_KEY_CHECKS = 1");

        // Helper
        function safe_json($val)
        {
            return json_encode($val ?? []);
        }

        // Insert Schools
        if (!empty($data['schools'])) {
            $stmt = $conn->prepare("INSERT INTO schools (id, name, address, logo, contact_email, contact_phone, settings, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['schools'] as $s) {
                $ref_settings = safe_json($s['settings'] ?? []);
                $isActive = isset($s['active']) ? ($s['active'] ? 1 : 0) : 1;
                $stmt->bind_param("sssssssi", $s['id'], $s['name'], $s['address'], $s['logo'], $s['contact_email'], $s['contact_phone'], $ref_settings, $isActive);
                $stmt->execute();
            }
            $stmt->close();
        }

        // Insert Users
        if (!empty($data['users'])) {
            $stmt = $conn->prepare("INSERT INTO users (id, school_id, name, email, password, role, assigned_classes, assigned_subjects) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['users'] as $u) {
                // Skip super_admin users (they are preserved, not synced)
                if (($u['role'] ?? '') === 'super_admin') continue;

                $ref_classes = safe_json($u['assigned_classes'] ?? []);
                $ref_subjects = safe_json($u['assigned_subjects'] ?? []);
                $stmt->bind_param("ssssssss", $u['id'], $u['school_id'], $u['name'], $u['email'], $u['password'], $u['role'], $ref_classes, $ref_subjects);
                $stmt->execute();
            }
            $stmt->close();
        }

        // Insert Classes
        if (!empty($data['classes'])) {
            // Updated to include class_teacher_id, level, active
            $stmt = $conn->prepare("INSERT INTO classes (id, school_id, name, subjects, class_teacher_id, level, active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['classes'] as $c) {
                $ref_subs = safe_json($c['subjects'] ?? []);
                // Handle booleans for active
                $isActive = isset($c['active']) ? ($c['active'] ? 1 : 0) : 1;
                $stmt->bind_param("ssssssi", $c['id'], $c['school_id'], $c['name'], $ref_subs, $c['class_teacher_id'], $c['level'], $isActive);
                $stmt->execute();
            }
            $stmt->close();
        }

        // Insert Subjects
        if (!empty($data['subjects'])) {
            $stmt = $conn->prepare("INSERT INTO subjects (id, school_id, name, code, status) VALUES (?, ?, ?, ?, ?)");
            foreach ($data['subjects'] as $s) {
                $stmt->bind_param("sssss", $s['id'], $s['school_id'], $s['name'], $s['code'], $s['status']);
                $stmt->execute();
            }
            $stmt->close();
        }

        // Insert Students
        if (!empty($data['students'])) {
            $stmt = $conn->prepare("INSERT INTO students (id, school_id, name, class, gender, status, scores, attendance, teacher_remark, head_remark, conduct, position, total_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['students'] as $s) {
                $ref_scores = safe_json($s['scores'] ?? []);
                $ref_att = safe_json($s['attendance'] ?? []);

                $t_rem = $s['teacher_remark'] ?? '';
                $h_rem = $s['head_remark'] ?? '';
                $cond = $s['conduct'] ?? '';
                $pos = isset($s['position']) ? (int)$s['position'] : 0;
                $tot = isset($s['total_students']) ? (int)$s['total_students'] : 0;

                $stmt->bind_param("ssssssssssssi", $s['id'], $s['school_id'], $s['name'], $s['class'], $s['gender'], $s['status'], $ref_scores, $ref_att, $t_rem, $h_rem, $cond, $pos, $tot);
                $stmt->execute();
            }
            $stmt->close();
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Sync complete"]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
    exit;
}
