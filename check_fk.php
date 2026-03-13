<?php
$c = new mysqli('localhost', 'root', '', 'tako_sda_db');
$res = $c->query("SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
                  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE REFERENCED_TABLE_SCHEMA = 'tako_sda_db'");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
