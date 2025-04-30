<?php
session_start();
header('Content-Type: application/json');
include 'db.php';

// 🟡 세션 확인
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => '로그인 필요 (세션 없음)',
        'debug' => $_SESSION
    ]);
    exit;
}

// 🟡 클라이언트 데이터 수집
$user_id = $_SESSION['user_id'];
$product_type = $_POST['product_type'] ?? 'food';
$name = $_POST['name'] ?? '이름없음';
$price = intval($_POST['price'] ?? 0);
$quantity = intval($_POST['quantity'] ?? 1);
$location = $_POST['location'] ?? '영화관 매점';
$date = date("Y-m-d H:i:s");

// ✅ 주문번호 생성 - 고유하게 만들기 위해 microtime 사용
$randomNumber = rand(1000, 9999);
$micro = substr(str_replace('.', '', microtime(true)), -6);  // 더 고유하게
$order_id = 'ORD' . $randomNumber . $micro;

// ✅ 로그로 생성된 주문번호 확인 (같은 번호 반복되는지 추적용)
file_put_contents(__DIR__ . "/order_log.txt", date("Y-m-d H:i:s") . " - $order_id\n", FILE_APPEND);

// 🟡 DB 연결 확인
if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'DB 연결 실패',
        'error' => mysqli_connect_error()
    ]);
    exit;
}

// 🟡 INSERT 실행
$sql = "INSERT INTO purchases (order_id, user_id, product_type, name, price, quantity, location, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => '쿼리 준비 실패',
        'error' => $conn->error
    ]);
    exit;
}

$stmt->bind_param("sssissss", $order_id, $user_id, $product_type, $name, $price, $quantity, $location, $date);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'order_id' => $order_id,
        'message' => 'DB 저장 완료'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => '쿼리 실행 실패',
        'error' => $stmt->error
    ]);
}
?>
