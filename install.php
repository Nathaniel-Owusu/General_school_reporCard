<?php
// install.php
// Run this file to setup the database and populate it with sample data

$host = 'localhost';
$dbname = 'school_report_db';
$username = 'root';
$password = '';

try {
    // 1. Connect and Create Database
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    $pdo->exec("USE `$dbname`");
    
    echo "Database created/selected successfully.<br>";
    
    // 2. Run Schema (Tables)
    // We read the structure from database.sql, but we'll manually execute the critical parts here to ensure order
    
    $queries = [
        "DROP TABLE IF EXISTS grades, student_term_data, teacher_classes, students, subjects, classes, academic_years, settings, users",
        
        "CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            role ENUM('admin', 'teacher') NOT NULL DEFAULT 'teacher',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE academic_years (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            is_active TINYINT(1) DEFAULT 0
        )",
        
        "CREATE TABLE classes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        )",
        
        "CREATE TABLE subjects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            code VARCHAR(10) UNIQUE,
            sort_order INT DEFAULT 0
        )",
        
        "CREATE TABLE settings (
            setting_key VARCHAR(50) PRIMARY KEY,
            setting_value TEXT
        )",
        
        "CREATE TABLE students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            index_number VARCHAR(20) NOT NULL UNIQUE,
            full_name VARCHAR(100) NOT NULL,
            current_class_id INT,
            FOREIGN KEY (current_class_id) REFERENCES classes(id)
        )",
        
        "CREATE TABLE student_term_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            academic_year_id INT NOT NULL,
            term VARCHAR(20) NOT NULL,
            class_id INT NOT NULL,
            attendance_present INT DEFAULT 0,
            attendance_total INT DEFAULT 60,
            conduct VARCHAR(50),
            teacher_remark TEXT,
            head_remark TEXT,
            position_in_class VARCHAR(10),
            total_students INT,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
            FOREIGN KEY (class_id) REFERENCES classes(id)
        )",
        
        "CREATE TABLE grades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_term_data_id INT NOT NULL,
            subject_id INT NOT NULL,
            class_score DECIMAL(5,2) DEFAULT 0,
            exam_score DECIMAL(5,2) DEFAULT 0,
            total_score DECIMAL(5,2) GENERATED ALWAYS AS (class_score + exam_score) STORED,
            status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
            FOREIGN KEY (student_term_data_id) REFERENCES student_term_data(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )"
    ];
    
    foreach ($queries as $q) {
        $pdo->exec($q);
    }
    echo "Tables created successfully.<br>";
    
    // 3. Seed Data
    
    // Users
    $password = password_hash('password', PASSWORD_DEFAULT);
    $adminPass = password_hash('admin', PASSWORD_DEFAULT);
    
    $pdo->exec("INSERT INTO users (email, password_hash, full_name, role) VALUES 
        ('admin@school.com', '$adminPass', 'System Administrator', 'admin'),
        ('teacher@school.com', '$password', 'Mr. John Doe', 'teacher')
    ");
    
    // Settings
    $pdo->exec("INSERT INTO settings (setting_key, setting_value) VALUES 
        ('school_name', 'General School'),
        ('school_motto', 'Knowledge is Power'),
        ('school_address', '123 School Lane, Accra, Ghana'),
        ('contact_phone', '+233 55 123 4567'),
        ('contact_email', 'info@generalschool.edu.gh'),
        ('current_term', '1st Term'),
        ('grading_system', '[{\"min\":80,\"max\":100,\"grade\":\"1\",\"remark\":\"HIGHEST\"},{\"min\":70,\"max\":79,\"grade\":\"2\",\"remark\":\"HIGHER\"}]')
    ");
    
    // Academic Year
    $pdo->exec("INSERT INTO academic_years (name, is_active) VALUES ('2024/2025', 1)");
    $ayId = $pdo->lastInsertId();
    
    // Classes
    $classes = ['JHS 1 A', 'JHS 2 A', 'JHS 3 A'];
    foreach ($classes as $c) {
        $stmt = $pdo->prepare("INSERT INTO classes (name) VALUES (?)");
        $stmt->execute([$c]);
    }
    // Get ID of JHS 2 A
    $stmt = $pdo->query("SELECT id FROM classes WHERE name='JHS 2 A'");
    $classId = $stmt->fetchColumn();
    
    // Subjects
    $subjects = [
        'English Language' => 'ENG', 
        'Mathematics' => 'MATH', 
        'Integrated Science' => 'SCI', 
        'Social Studies' => 'SOC', 
        'I.C.T.' => 'ICT'
    ];
    
    $subIds = [];
    foreach ($subjects as $name => $code) {
        $stmt = $pdo->prepare("INSERT INTO subjects (name, code) VALUES (?, ?)");
        $stmt->execute([$name, $code]);
        $subIds[] = $pdo->lastInsertId();
    }
    
    // Student: Emmanuel Mensah (ST001)
    $stmt = $pdo->prepare("INSERT INTO students (index_number, full_name, current_class_id) VALUES (?, ?, ?)");
    $stmt->execute(['ST001', 'Emmanuel Mensah', $classId]);
    $st1 = $pdo->lastInsertId();
    
    // Term Data
    $stmt = $pdo->prepare("INSERT INTO student_term_data 
        (student_id, academic_year_id, term, class_id, attendance_present, conduct, teacher_remark, head_remark, position_in_class, total_students)
        VALUES (?, ?, '1st Term', ?, 58, 'Exemplary', 'Emmanuel is a disciplined hard worker.', 'Promoted to next class.', '4th', 45)
    ");
    $stmt->execute([$st1, $ayId, $classId]);
    $reportId = $pdo->lastInsertId();
    
    // Grades
    $scores = [
        ['English Language', 24, 58, 'Pending'],
        ['Mathematics', 26, 62, 'Approved'],
        ['Integrated Science', 22, 53, 'Rejected'],
        ['Social Studies', 25, 60, 'Pending'],
        ['I.C.T.', 28, 65, 'Pending']
    ];
    
    foreach ($scores as $s) {
        $subName = $s[0];
        // Get Sub ID
        $subIdStmt = $pdo->prepare("SELECT id FROM subjects WHERE name = ?");
        $subIdStmt->execute([$subName]);
        $sId = $subIdStmt->fetchColumn();
        
        $gStmt = $pdo->prepare("INSERT INTO grades (student_term_data_id, subject_id, class_score, exam_score, status) VALUES (?, ?, ?, ?, ?)");
        $gStmt->execute([$reportId, $sId, $s[1], $s[2], $s[3]]);
    }
    
    echo "Seed data inserted successfully. User: admin@school.com / admin, Student: ST001.<br>";
    echo "<a href='index.html'>Go to App</a>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
