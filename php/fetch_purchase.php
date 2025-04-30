<?php
header('Content-Type: application/json');
session_start();
include 'db.php';

$order_id = $_GET['order_id'] ?? '';

if (!$order_id) {
    echo json_encode(['success' => false, 'message' => '주문번호가 없습니다.']);
    exit;
}

$stmt = $conn->prepare("SELECT name, price FROM purchases WHERE order_id = ?");
$stmt->bind_param("s", $order_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => '주문 정보를 찾을 수 없습니다.']);
    exit;
}

$purchase = $result->fetch_assoc();

echo json_encode([
    'success' => true,
    'name' => $purchase['name'],
    'price' => $purchase['price']
]);
?>
