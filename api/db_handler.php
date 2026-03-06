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
        // Ensure level and active are properly typed
        if (!isset($row['level'])) $row['level'] = null;
        $row['active'] = isset($row['active']) ? (bool)$row['active'] : true;
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

// WRITE (POST) - UPSERT Strategy (fast: only changes what's needed)
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

    // Helper
    function safe_json($val)
    {
        return json_encode($val ?? []);
    }

    // Helper: build a comma-separated list of quoted IDs for IN() clause
    function id_placeholders($items)
    {
        return implode(',', array_fill(0, count($items), '?'));
    }

    $conn->begin_transaction();

    try {

        // ── SCHOOLS ──────────────────────────────────────────────────────────
        if (!empty($data['schools'])) {
            $stmt = $conn->prepare(
                "INSERT INTO schools (id, name, address, logo, contact_email, contact_phone, settings, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   name=VALUES(name), address=VALUES(address), logo=VALUES(logo),
                   contact_email=VALUES(contact_email), contact_phone=VALUES(contact_phone),
                   settings=VALUES(settings), active=VALUES(active)"
            );
            $incomingIds = [];
            foreach ($data['schools'] as $s) {
                $ref_settings = safe_json($s['settings'] ?? []);
                $isActive = isset($s['active']) ? ($s['active'] ? 1 : 0) : 1;
                $addr    = $s['address'] ?? '';
                $logo    = $s['logo'] ?? '';
                $email   = $s['contact_email'] ?? '';
                $phone   = $s['contact_phone'] ?? '';

                $stmt->bind_param(
                    "sssssssi",
                    $s['id'],
                    $s['name'],
                    $addr,
                    $logo,
                    $email,
                    $phone,
                    $ref_settings,
                    $isActive
                );
                $stmt->execute();
                $incomingIds[] = $s['id'];
            }
            $stmt->close();
            // Delete schools no longer in the client list
            if (!empty($incomingIds)) {
                $ph = id_placeholders($incomingIds);
                $del = $conn->prepare("DELETE FROM schools WHERE id NOT IN ($ph)");
                $del->bind_param(str_repeat('s', count($incomingIds)), ...$incomingIds);
                $del->execute();
                $del->close();
            }
        }

        // ── USERS (non-super_admin) ───────────────────────────────────────────
        if (!empty($data['users'])) {
            $stmt = $conn->prepare(
                "INSERT INTO users (id, school_id, name, email, password, role, assigned_classes, assigned_subjects)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   school_id=VALUES(school_id), name=VALUES(name), email=VALUES(email),
                   password=VALUES(password), assigned_classes=VALUES(assigned_classes),
                   assigned_subjects=VALUES(assigned_subjects)"
            );
            $incomingIds = [];
            foreach ($data['users'] as $u) {
                if (($u['role'] ?? '') === 'super_admin') continue; // never touch super_admin
                $ref_classes  = safe_json($u['assigned_classes']  ?? []);
                $ref_subjects = safe_json($u['assigned_subjects'] ?? []);
                $u_school = $u['school_id'] ?? null;
                $stmt->bind_param(
                    "ssssssss",
                    $u['id'],
                    $u_school,
                    $u['name'],
                    $u['email'],
                    $u['password'],
                    $u['role'],
                    $ref_classes,
                    $ref_subjects
                );
                $stmt->execute();
                $incomingIds[] = $u['id'];
            }
            $stmt->close();
            // Delete users that were removed client-side (excluding super_admin)
            if (!empty($incomingIds)) {
                $ph = id_placeholders($incomingIds);
                $del = $conn->prepare("DELETE FROM users WHERE role != 'super_admin' AND id NOT IN ($ph)");
                $del->bind_param(str_repeat('s', count($incomingIds)), ...$incomingIds);
                $del->execute();
                $del->close();
            }
        }

        // ── CLASSES ───────────────────────────────────────────────────────────
        if (!empty($data['classes'])) {
            $stmt = $conn->prepare(
                "INSERT INTO classes (id, school_id, name, subjects, class_teacher_id, level, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   name=VALUES(name), subjects=VALUES(subjects),
                   class_teacher_id=VALUES(class_teacher_id), level=VALUES(level), active=VALUES(active)"
            );
            $incomingIds = [];
            foreach ($data['classes'] as $c) {
                $ref_subs = safe_json($c['subjects'] ?? []);
                $isActive = isset($c['active']) ? ($c['active'] ? 1 : 0) : 1;
                $c_teacher = $c['class_teacher_id'] ?? null;
                $c_level   = $c['level'] ?? null;
                $stmt->bind_param(
                    "ssssssi",
                    $c['id'],
                    $c['school_id'],
                    $c['name'],
                    $ref_subs,
                    $c_teacher,
                    $c_level,
                    $isActive
                );
                $stmt->execute();
                $incomingIds[] = $c['id'];
            }
            $stmt->close();
            if (!empty($incomingIds)) {
                $ph = id_placeholders($incomingIds);
                $del = $conn->prepare("DELETE FROM classes WHERE id NOT IN ($ph)");
                $del->bind_param(str_repeat('s', count($incomingIds)), ...$incomingIds);
                $del->execute();
                $del->close();
            }
        }

        // ── SUBJECTS ─────────────────────────────────────────────────────────
        if (!empty($data['subjects'])) {
            // Ensure columns exist (idempotent migration)
            $conn->query("ALTER TABLE subjects ADD COLUMN IF NOT EXISTS level VARCHAR(20) DEFAULT NULL");
            $conn->query("ALTER TABLE subjects ADD COLUMN IF NOT EXISTS active TINYINT(1) DEFAULT 1");

            $stmt = $conn->prepare(
                "INSERT INTO subjects (id, school_id, name, code, status, level, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   name=VALUES(name), code=VALUES(code), level=VALUES(level), active=VALUES(active)"
            );
            $incomingIds = [];
            foreach ($data['subjects'] as $s) {
                $level    = $s['level'] ?? null;
                $isActive = isset($s['active']) ? ($s['active'] ? 1 : 0) : 1;
                $status   = $s['status'] ?? null;
                $stmt->bind_param(
                    "ssssssi",
                    $s['id'],
                    $s['school_id'],
                    $s['name'],
                    $s['code'],
                    $status,
                    $level,
                    $isActive
                );
                $stmt->execute();
                $incomingIds[] = $s['id'];
            }
            $stmt->close();
            if (!empty($incomingIds)) {
                $ph = id_placeholders($incomingIds);
                $del = $conn->prepare("DELETE FROM subjects WHERE id NOT IN ($ph)");
                $del->bind_param(str_repeat('s', count($incomingIds)), ...$incomingIds);
                $del->execute();
                $del->close();
            }
        }

        // ── STUDENTS ──────────────────────────────────────────────────────────
        if (!empty($data['students'])) {
            $stmt = $conn->prepare(
                "INSERT INTO students
                   (id, school_id, name, `class`, gender, status, scores, attendance,
                    teacher_remark, head_remark, conduct, position, total_students)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   name=VALUES(name), `class`=VALUES(`class`), gender=VALUES(gender),
                   status=VALUES(status), scores=VALUES(scores), attendance=VALUES(attendance),
                   teacher_remark=VALUES(teacher_remark), head_remark=VALUES(head_remark),
                   conduct=VALUES(conduct), position=VALUES(position), total_students=VALUES(total_students)"
            );
            $incomingIds = [];
            foreach ($data['students'] as $s) {
                $ref_scores = safe_json($s['scores']     ?? []);
                $ref_att    = safe_json($s['attendance'] ?? []);
                $t_rem = $s['teacher_remark']  ?? '';
                $h_rem = $s['head_remark']     ?? '';
                $cond  = $s['conduct']         ?? '';
                $pos   = isset($s['position'])       ? (int)$s['position']       : 0;
                $tot   = isset($s['total_students'])  ? (int)$s['total_students'] : 0;
                $stmt->bind_param(
                    "sssssssssssii",
                    $s['id'],
                    $s['school_id'],
                    $s['name'],
                    $s['class'],
                    $s['gender'],
                    $s['status'],
                    $ref_scores,
                    $ref_att,
                    $t_rem,
                    $h_rem,
                    $cond,
                    $pos,
                    $tot
                );
                $stmt->execute();
                $incomingIds[] = $s['id'];
            }
            $stmt->close();
            if (!empty($incomingIds)) {
                $ph = id_placeholders($incomingIds);
                $del = $conn->prepare("DELETE FROM students WHERE id NOT IN ($ph)");
                $del->bind_param(str_repeat('s', count($incomingIds)), ...$incomingIds);
                $del->execute();
                $del->close();
            }
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
