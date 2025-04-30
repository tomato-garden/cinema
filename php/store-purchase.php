<?php
$db = new SQLite3('../db/store.db');  // 경로 맞춰야 함

$user_id = $_POST['user_id'];
$item_type = $_POST['item_type'];  // 'food' or 'movie'
$item_name = $_POST['item_name'];
$price = $_POST['price'];
$quantity = $_POST['quantity'];

$query = $db->prepare("INSERT INTO purchases (user_id, item_type, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)");
$query->bindValue(1, $user_id, SQLITE3_TEXT);
$query->bindValue(2, $item_type, SQLITE3_TEXT);
$query->bindValue(3, $item_name, SQLITE3_TEXT);
$query->bindValue(4, $price, SQLITE3_INTEGER);
$query->bindValue(5, $quantity, SQLITE3_INTEGER);

if ($query->execute()) {
    echo "구매 완료";
} else {
    echo "오류 발생";
}
?>
