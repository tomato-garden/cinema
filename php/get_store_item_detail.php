<?php
header('Content-Type: application/json');
include('db.php');

$item_id = $_GET['item_id'] ?? null;

if (!$item_id) {
  echo json_encode(["error" => "item_id 없음"]);
  exit;
}

$stmt = $conn->prepare("SELECT name, price, components, image_path FROM store_items WHERE id = ?");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();
$item = $result->fetch_assoc();

if ($item) {
  echo json_encode($item, JSON_UNESCAPED_UNICODE);
} else {
  echo json_encode(["error" => "상품 없음"]);
}
?>
