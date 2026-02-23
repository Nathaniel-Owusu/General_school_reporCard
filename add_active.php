<?php
require_once 'config/db_connect.php';
$conn->query("ALTER TABLE schools ADD COLUMN active BOOLEAN DEFAULT 1;");
echo "Done";
