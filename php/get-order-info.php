<?php
header('Content-Type: application/json');
include 'db.php';

$order_id = $_GET['order_id'] ?? '';

if (!$order_id) {
    echo json_encode(['success' => false, 'message' => '주문번호 없음']);
    exit;
}

$sql = "SELECT * FROM purchases WHERE order_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $order_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => '주문 정보 없음']);
}
?>
