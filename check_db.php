<?php
$c = new mysqli('localhost', 'root', '', 'tako_sda_db');
if($c->connect_error) {
    die('Connect Error: ' . $c->connect_error);
}
$res = $c->query('SHOW TABLES');
if ($res) {
    while($row = $res->fetch_array()) {
        echo $row[0] . "\n";
    }
} else {
    echo "No tables found or error: " . $c->error;
}
