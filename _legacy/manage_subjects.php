<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: index.php");
    exit;
}

// Handle Add Subject
if (isset($_POST['add_subject'])) {
    $name = cleanInput($_POST['subject_name']);
    try {
        $stmt = $pdo->prepare("INSERT INTO subjects (name) VALUES (?)");
        $stmt->execute([$name]);
        $success = "Subject added successfully!";
    } catch(PDOException $e) {
        $error = "Error adding subject: " . $e->getMessage();
    }
}

// Handle Teacher Assignment
if (isset($_POST['assign_teacher'])) {
    $teacher_id = $_POST['teacher_id'];
    $subject_id = $_POST['subject_id'];
    $class_id = $_POST['class_id'];
    
    // Check duplication
    $check = $pdo->prepare("SELECT * FROM teacher_subjects WHERE teacher_id=? AND subject_id=? AND class_id=?");
    $check->execute([$teacher_id, $subject_id, $class_id]);
    
    if ($check->rowCount() == 0) {
        try {
            $stmt = $pdo->prepare("INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES (?, ?, ?)");
            $stmt->execute([$teacher_id, $subject_id, $class_id]);
            $assign_success = "Teacher assigned successfully!";
        } catch(PDOException $e) {
            $assign_error = "Error assigning teacher: " . $e->getMessage();
        }
    } else {
        $assign_error = "This teacher is already assigned to this subject for this class.";
    }
}

// Fetch Data
$subjects = $pdo->query("SELECT * FROM subjects ORDER BY name ASC")->fetchAll();
$teachers = $pdo->query("SELECT * FROM users WHERE role = 'teacher' ORDER BY full_name ASC")->fetchAll();
$classes = $pdo->query("SELECT * FROM classes ORDER BY name ASC")->fetchAll();

$assignments = $pdo->query("
    SELECT ts.*, u.full_name as teacher_name, s.name as subject_name, c.name as class_name
    FROM teacher_subjects ts
    JOIN users u ON ts.teacher_id = u.id
    JOIN subjects s ON ts.subject_id = s.id
    JOIN classes c ON ts.class_id = c.id
    ORDER BY c.name ASC, s.name ASC
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Subjects & Assignments</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: { extend: { fontFamily: { sans: ['Outfit', 'sans-serif'] } } }
        }
    </script>
</head>
<body class="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden">

    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div class="h-20 flex items-center px-6 border-b border-gray-800">
            <ion-icon name="school" class="text-2xl text-blue-500 mr-2"></ion-icon>
            <span class="font-bold text-lg">Admin Panel</span>
        </div>
        <nav class="flex-1 overflow-y-auto py-4">
            <a href="admin_dashboard.php" class="flex items-center gap-3 px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800">
                <ion-icon name="grid-outline"></ion-icon> Dashboard
            </a>
            <a href="manage_students.php" class="flex items-center gap-3 px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800">
                <ion-icon name="people-outline"></ion-icon> Students
            </a>
            <a href="manage_subjects.php" class="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white">
                <ion-icon name="book-outline"></ion-icon> Subjects & Assignments
            </a>
            <a href="logout.php" class="flex items-center gap-3 px-6 py-3 text-red-400 hover:bg-gray-800 mt-auto">
                <ion-icon name="log-out-outline"></ion-icon> Logout
            </a>
        </nav>
    </aside>

    <main class="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Column 1: Subjects -->
        <section>
            <h2 class="text-xl font-bold mb-4">Subjects</h2>
            
            <?php if(isset($success)): ?>
                <div class="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm"><?= $success ?></div>
            <?php endif; ?>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <form method="POST" class="flex gap-2">
                    <input type="text" name="subject_name" placeholder="New Subject Name" required class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <button type="submit" name="add_subject" class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">Add</button>
                </form>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ul class="divide-y divide-gray-100">
                    <?php foreach($subjects as $s): ?>
                        <li class="px-6 py-3 flex justify-between items-center text-sm">
                            <span class="font-medium"><?= htmlspecialchars($s['name']) ?></span>
                            <button class="text-red-400 hover:text-red-600 text-xs">Delete</button>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </section>

        <!-- Column 2: Assignments -->
        <section>
            <h2 class="text-xl font-bold mb-4">Assign Teachers</h2>
            
            <?php if(isset($assign_success)): ?>
                <div class="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm"><?= $assign_success ?></div>
            <?php endif; ?>
            <?php if(isset($assign_error)): ?>
                <div class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm"><?= $assign_error ?></div>
            <?php endif; ?>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <form method="POST" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select name="teacher_id" required class="px-3 py-2 border rounded-lg text-sm">
                            <option value="">Teacher</option>
                            <?php foreach($teachers as $t): ?>
                                <option value="<?= $t['id'] ?>"><?= htmlspecialchars($t['full_name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <select name="subject_id" required class="px-3 py-2 border rounded-lg text-sm">
                            <option value="">Subject</option>
                            <?php foreach($subjects as $s): ?>
                                <option value="<?= $s['id'] ?>"><?= htmlspecialchars($s['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <select name="class_id" required class="px-3 py-2 border rounded-lg text-sm">
                            <option value="">Class</option>
                            <?php foreach($classes as $c): ?>
                                <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button type="submit" name="assign_teacher" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold text-sm">Assign</button>
                </form>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 text-gray-500 font-bold sticky top-0">
                        <tr>
                            <th class="px-4 py-3">Class</th>
                            <th class="px-4 py-3">Subject</th>
                            <th class="px-4 py-3">Teacher</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <?php foreach($assignments as $a): ?>
                            <tr>
                                <td class="px-4 py-3 font-bold"><?= htmlspecialchars($a['class_name']) ?></td>
                                <td class="px-4 py-3"><?= htmlspecialchars($a['subject_name']) ?></td>
                                <td class="px-4 py-3 text-blue-600"><?= htmlspecialchars($a['teacher_name']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

        </section>
    </main>
</body>
</html>
