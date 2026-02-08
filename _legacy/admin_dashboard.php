<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: index.php");
    exit;
}

// Handle Teacher Addition
if (isset($_POST['add_teacher'])) {
    $name = cleanInput($_POST['name']);
    $username = cleanInput($_POST['username']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, 'teacher')");
        $stmt->execute([$username, $password, $name]);
        $success = "Teacher added successfully!";
    } catch(PDOException $e) {
        $error = "Error adding teacher: " . $e->getMessage();
    }
}

// Handle Class Creation
if (isset($_POST['add_class'])) {
    $name = cleanInput($_POST['class_name']);
    $teacher_id = $_POST['class_teacher_id'] ?: null;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO classes (name, class_teacher_id) VALUES (?, ?)");
        $stmt->execute([$name, $teacher_id]);
        $success = "Class created successfully!";
    } catch(PDOException $e) {
        $error = "Error creating class: " . $e->getMessage();
    }
}

// Fetch Data
$teachers = $pdo->query("SELECT * FROM users WHERE role = 'teacher'")->fetchAll();
$classes = $pdo->query("SELECT c.*, u.full_name as teacher_name FROM classes c LEFT JOIN users u ON c.class_teacher_id = u.id")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Outfit', 'sans-serif'] }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 font-sans text-gray-800">

    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
            <div class="h-20 flex items-center px-6 border-b border-gray-800">
                <ion-icon name="school" class="text-2xl text-blue-500 mr-2"></ion-icon>
                <span class="font-bold text-lg">Admin Panel</span>
            </div>
            <nav class="flex-1 overflow-y-auto py-4">
                <a href="admin_dashboard.php" class="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white">
                    <ion-icon name="grid-outline"></ion-icon> Dashboard
                </a>
                <a href="manage_students.php" class="flex items-center gap-3 px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800">
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

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-8">
            <header class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold">Dashboard Overview</h1>
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        <?= substr($_SESSION['name'], 0, 1) ?>
                    </div>
                    <span><?= htmlspecialchars($_SESSION['name']) ?></span>
                </div>
            </header>

            <?php if(isset($success)): ?>
                <div class="bg-green-100 text-green-700 p-4 rounded-lg mb-6 border border-green-200"><?= $success ?></div>
            <?php endif; ?>
            
            <?php if(isset($error)): ?>
                <div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200"><?= $error ?></div>
            <?php endif; ?>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <!-- Quick Add Teacher -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <ion-icon name="person-add-outline" class="text-blue-500"></ion-icon> Add Teacher
                    </h2>
                    <form method="POST" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input type="text" name="name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                                <input type="text" name="username" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                            <input type="password" name="password" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <button type="submit" name="add_teacher" class="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-colors">Create Account</button>
                    </form>

                    <div class="mt-6">
                        <h3 class="font-bold text-sm text-gray-500 uppercase mb-2">Existing Teachers</h3>
                        <div class="max-h-40 overflow-y-auto space-y-2">
                            <?php foreach($teachers as $teacher): ?>
                                <div class="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <span><?= htmlspecialchars($teacher['full_name']) ?></span>
                                    <span class="text-xs text-gray-400">@<?= htmlspecialchars($teacher['username']) ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <!-- Manage Classes -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <ion-icon name="easel-outline" class="text-green-500"></ion-icon> Manage Classes
                    </h2>
                    <form method="POST" class="space-y-4 mb-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Class Name</label>
                                <input type="text" name="class_name" placeholder="e.g. JHS 1 A" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Class Teacher</label>
                                <select name="class_teacher_id" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                                    <option value="">-- Select --</option>
                                    <?php foreach($teachers as $teacher): ?>
                                        <option value="<?= $teacher['id'] ?>"><?= htmlspecialchars($teacher['full_name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>
                        <button type="submit" name="add_class" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">Create Class</button>
                    </form>

                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left text-gray-500 border-b">
                                    <th class="pb-2">Class</th>
                                    <th class="pb-2">Teacher</th>
                                    <th class="pb-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                <?php foreach($classes as $class): ?>
                                <tr>
                                    <td class="py-3 font-bold"><?= htmlspecialchars($class['name']) ?></td>
                                    <td class="py-3 text-gray-600"><?= $class['teacher_name'] ? htmlspecialchars($class['teacher_name']) : '<span class="text-red-400 italic">Unassigned</span>' ?></td>
                                    <td class="py-3 text-right">
                                        <button class="text-blue-500 hover:text-blue-700">Edit</button>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    </div>

</body>
</html>
