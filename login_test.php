<?php

/**
 * Login Diagnostic Tool
 * Visit: yourdomain.com/login_test.php
 * DELETE this file after debugging!
 */
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html>

<head>
    <title>Login Diagnostic</title>
    <style>
        body {
            font-family: monospace;
            padding: 20px;
            background: #1a1a2e;
            color: #eee;
        }

        h2 {
            color: #e94560;
        }

        .ok {
            color: #4ecca3;
        }

        .fail {
            color: #e94560;
        }

        .warn {
            color: #f7c59f;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        td,
        th {
            padding: 8px 12px;
            border: 1px solid #333;
            text-align: left;
        }

        th {
            background: #16213e;
        }

        pre {
            background: #0f3460;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
        }
    </style>
</head>

<body>
    <h2>🔍 Login Diagnostic Tool</h2>

    <?php
    // 1. Basic PHP Info
    echo "<h3>1. PHP Environment</h3>";
    echo "<table>";
    echo "<tr><th>Check</th><th>Value</th><th>Status</th></tr>";
    echo "<tr><td>PHP Version</td><td>" . phpversion() . "</td><td class='ok'>✅</td></tr>";
    echo "<tr><td>HTTP Host</td><td>" . htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'N/A') . "</td><td class='ok'>ℹ️</td></tr>";
    echo "<tr><td>Server Addr</td><td>" . htmlspecialchars($_SERVER['SERVER_ADDR'] ?? 'N/A') . "</td><td class='ok'>ℹ️</td></tr>";
    echo "<tr><td>Script Path</td><td>" . htmlspecialchars(__DIR__) . "</td><td class='ok'>ℹ️</td></tr>";
    echo "</table>";

    // 2. Config Detection
    echo "<h3>2. Config Detection</h3>";
    $is_localhost = false;
    $http_host = strtolower($_SERVER['HTTP_HOST'] ?? '');
    if ($http_host === 'localhost' || strpos($http_host, '127.0.0.1') !== false || strpos($http_host, '::1') !== false) {
        $is_localhost = true;
    }
    $env = $is_localhost ? '<span class="warn">⚠️ LOCALHOST (Using local DB)</span>' : '<span class="ok">✅ PRODUCTION (Using prod_config.php)</span>';
    echo "<p>Detected Environment: $env</p>";

    $prod_file = __DIR__ . '/config/prod_config.php';
    if (file_exists($prod_file)) {
        echo "<p class='ok'>✅ prod_config.php EXISTS</p>";
    } else {
        echo "<p class='fail'>❌ prod_config.php NOT FOUND at: $prod_file</p>";
    }

    // 3. Database Connection
    echo "<h3>3. Database Connection</h3>";
    require_once __DIR__ . '/config/db_connect.php';
    if (isset($conn) && !$conn->connect_error) {
        echo "<p class='ok'>✅ Database Connected Successfully!</p>";
        echo "<p>Host: <b>" . htmlspecialchars($db_host) . "</b> | DB: <b>" . htmlspecialchars($db_name) . "</b> | User: <b>" . htmlspecialchars($db_user) . "</b></p>";

        // 4. Check Tables
        echo "<h3>4. Database Tables</h3>";
        echo "<table><tr><th>Table</th><th>Row Count</th><th>Status</th></tr>";
        $tables = ['schools', 'users', 'students', 'classes', 'subjects'];
        foreach ($tables as $table) {
            $r = $conn->query("SELECT COUNT(*) as cnt FROM `$table`");
            if ($r) {
                $row = $r->fetch_assoc();
                $cnt = $row['cnt'];
                $status = $cnt > 0 ? "<span class='ok'>✅ Has data</span>" : "<span class='warn'>⚠️ Empty</span>";
                echo "<tr><td>$table</td><td>$cnt</td><td>$status</td></tr>";
            } else {
                echo "<tr><td>$table</td><td>-</td><td class='fail'>❌ Table missing: " . $conn->error . "</td></tr>";
            }
        }
        echo "</table>";

        // 5. Test Login Query
        echo "<h3>5. Test: Student Login Query</h3>";
        $test_id = 'ST_001';
        $stmt = $conn->prepare("SELECT id, name, class FROM students WHERE id = ? LIMIT 1");
        if ($stmt) {
            $stmt->bind_param("s", $test_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($student = $result->fetch_assoc()) {
                echo "<p class='ok'>✅ Test student found: <b>" . htmlspecialchars($student['name']) . "</b> (ID: ST_001)</p>";
            } else {
                echo "<p class='warn'>⚠️ Test student ST_001 not found (login with any valid student ID)</p>";
            }
            $stmt->close();
        }

        // 6. Test Staff Login Query
        echo "<h3>6. Test: Staff Login Query</h3>";
        $r = $conn->query("SELECT id, name, email, role FROM users LIMIT 5");
        if ($r && $r->num_rows > 0) {
            echo "<table><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
            while ($row = $r->fetch_assoc()) {
                echo "<tr><td>" . htmlspecialchars($row['id']) . "</td><td>" . htmlspecialchars($row['name']) . "</td><td>" . htmlspecialchars($row['email']) . "</td><td>" . htmlspecialchars($row['role']) . "</td></tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='fail'>❌ No users found in DB. Login will fail for everyone.</p>";
        }
    } else {
        echo "<p class='fail'>❌ Database Connection FAILED: " . ($conn->connect_error ?? 'Unknown error') . "</p>";
        echo "<p>Check: host=<b>" . htmlspecialchars($db_host) . "</b>, db=<b>" . htmlspecialchars($db_name) . "</b>, user=<b>" . htmlspecialchars($db_user) . "</b></p>";
    }
    ?>

    <h3>7. API URL Test</h3>
    <p>The login page will try to call: <code id="apiurl">checking...</code></p>
    <div id="apiresult">
        <p class="warn">⏳ Testing API...</p>
    </div>

    <script>
        const base = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        const apiUrl = base + '/api/login.php';
        document.getElementById('apiurl').textContent = apiUrl;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'student',
                id: 'TEST_DIAG'
            })
        }).then(r => r.json()).then(data => {
            const el = document.getElementById('apiresult');
            el.innerHTML = '<p class="ok">✅ API is reachable! Response: <pre>' + JSON.stringify(data, null, 2) + '</pre></p>';
        }).catch(err => {
            document.getElementById('apiresult').innerHTML = '<p class="fail">❌ API unreachable: ' + err.message + '</p>';
        });
    </script>

    <hr>
    <p style="color:#666">⚠️ <b>DELETE login_test.php after debugging!</b> It exposes database info.</p>
</body>

</html>