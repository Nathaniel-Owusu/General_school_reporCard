<?php
require_once 'config/db_connect.php';
$r = $conn->query('DESCRIBE schools;');
while ($row = $r->fetch_assoc()) {
    print_r($row);
}
