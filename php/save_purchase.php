<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => '로그인이 필요합니다.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

$item_id = $data['item_id'] ?? 0;
$quantity = $data['quantity'] ?? 1;
$location = $data['location'] ?? '기본 매점';
$product_type = 'store';
$date = date("Y-m-d H:i:s");

// ✅ 고유한 주문번호 생성
$order_id = "ORD" . rand(10000000, 99999999);

// ✅ item_id 유효성 체크
if (!$item_id) {
    echo json_encode(['success' => false, 'message' => '상품 정보가 없습니다.']);
    exit;
}

// ✅ store_items 테이블에서 상품 조회
$stmt = $conn->prepare("SELECT name, price FROM store_items WHERE id = ?");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => '상품을 찾을 수 없습니다.']);
    exit;
}

$product = $result->fetch_assoc();
$name = $product['name'];
$price = $product['price'];

// ✅ DB에 구매 기록 저장
$insert = $conn->prepare("INSERT INTO purchases (order_id, user_id, product_type, name, price, quantity, location, date)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$insert->bind_param("sisssiss", $order_id, $user_id, $product_type, $name, $price, $quantity, $location, $date);

if ($insert->execute()) {
    echo json_encode([
        'success' => true,
        'order_id' => $order_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => $insert->error
    ]);
}
?>
