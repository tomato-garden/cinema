<?php
require_once 'db.php';

$itemId = $_GET['item_id'] ?? null;

if (!$itemId) {
    http_response_code(400);
    echo json_encode(["error" => "아이템 ID 누락"]);
    exit;
}

$sql = "SELECT * FROM store_items WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $itemId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(["error" => "해당 아이템 없음"]);
}
?>
