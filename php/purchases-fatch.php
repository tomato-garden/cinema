<?php
$db = new SQLite3('../db/store.db');
$result = $db->query("SELECT * FROM purchases");

$data = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $data[] = $row;
}
echo json_encode($data);
?>
