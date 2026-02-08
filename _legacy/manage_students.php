<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: index.php");
    exit;
}

// Fetch Classes for Dropdown
$classes = $pdo->query("SELECT * FROM classes ORDER BY name ASC")->fetchAll();

// Handle Add Student
if (isset($_POST['add_student'])) {
    $name = cleanInput($_POST['name']);
    $index_number = cleanInput($_POST['index_number']);
    $class_id = $_POST['class_id'];
    
    try {
        $stmt = $pdo->prepare("INSERT INTO students (name, index_number, class_id) VALUES (?, ?, ?)");
        $stmt->execute([$name, $index_number, $class_id]);
        $success = "Student added successfully!";
    } catch(PDOException $e) {
        $error = "Error adding student: " . $e->getMessage();
    }
}

// Fetch Students List with Class Name
$students = $pdo->query("
    SELECT s.*, c.name as class_name 
    FROM students s 
    LEFT JOIN classes c ON s.class_id = c.id 
    ORDER BY s.created_at DESC LIMIT 50
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Students</title>
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

    <!-- Sidebar (Simplified Copy) -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div class="h-20 flex items-center px-6 border-b border-gray-800">
            <ion-icon name="school" class="text-2xl text-blue-500 mr-2"></ion-icon>
            <span class="font-bold text-lg">Admin Panel</span>
        </div>
        <nav class="flex-1 overflow-y-auto py-4">
            <a href="admin_dashboard.php" class="flex items-center gap-3 px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800">
                <ion-icon name="grid-outline"></ion-icon> Dashboard
            </a>
            <a href="manage_students.php" class="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white">
                <ion-icon name="people-outline"></ion-icon> Students
            </a>
            <a href="manage_subjects.php" class="flex items-center gap-3 px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800">
                <ion-icon name="book-outline"></ion-icon> Subjects & Assignments
            </a>
            <a href="logout.php" class="flex items-center gap-3 px-6 py-3 text-red-400 hover:bg-gray-800 mt-auto">
                <ion-icon name="log-out-outline"></ion-icon> Logout
            </a>
        </nav>
    </aside>

    <main class="flex-1 overflow-y-auto p-8">
        <h1 class="text-2xl font-bold mb-6">Manage Students</h1>

        <?php if(isset($success)): ?>
            <div class="bg-green-100 text-green-700 p-4 rounded-lg mb-6 border border-green-200"><?= $success ?></div>
        <?php endif; ?>
        <?php if(isset($error)): ?>
            <div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200"><?= $error ?></div>
        <?php endif; ?>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h2 class="text-lg font-bold mb-4">Register New Student</h2>
            <form method="POST" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label class="block text-sm font-bold text-gray-500 mb-1">Full Name</label>
                    <input type="text" name="name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-500 mb-1">Index Number (ID)</label>
                    <input type="text" name="index_number" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-500 mb-1">Assign Class</label>
                    <select name="class_id" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">-- Select Class --</option>
                        <?php foreach($classes as $c): ?>
                            <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="md:col-span-3">
                    <button type="submit" name="add_student" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold">Add Student</button>
                </div>
            </form>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                    <tr>
                        <th class="px-6 py-4 border-b">ID</th>
                        <th class="px-6 py-4 border-b">Name</th>
                        <th class="px-6 py-4 border-b">Class</th>
                        <th class="px-6 py-4 border-b text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <?php foreach($students as $student): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-3 font-mono text-gray-500"><?= htmlspecialchars($student['index_number']) ?></td>
                            <td class="px-6 py-3 font-bold text-gray-800"><?= htmlspecialchars($student['name']) ?></td>
                            <td class="px-6 py-3 text-blue-600 font-medium"><?= htmlspecialchars($student['class_name'] ?? 'Unassigned') ?></td>
                            <td class="px-6 py-3 text-right">
                                <button class="text-blue-500 hover:text-blue-700 text-sm font-bold">Edit</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

</body>
</html>
