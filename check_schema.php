<?php
$c = new mysqli('localhost', 'root', '', 'tako_sda_db');
foreach(['schools', 'users', 'classes', 'subjects', 'students'] as $table) {
    echo "Table: $table\n";
    $res = $c->query("DESCRIBE $table");
    while($row = $res->fetch_assoc()) echo "  " . $row['Field'] . "\n";
}
