<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json; charset=UTF-8');

// 로그인 확인
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => '로그인이 필요합니다.']);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT 
            order_id,
            product_type,
            name AS product_name,
            price,
            quantity,
            location,
            date
        FROM purchases
        WHERE user_id = ?
        ORDER BY date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$purchases = [];

while ($row = $result->fetch_assoc()) {
    // 서울 시간으로 변환
    $utcTime = new DateTime($row['date'], new DateTimeZone('UTC'));
    $utcTime->setTimezone(new DateTimeZone('Asia/Seoul'));

    $formattedDate = $utcTime->format('n/j (D) H:i');

    $purchases[] = [
        'name'          => $row['product_name'],
        'date'          => $formattedDate,
        'quantity'      => (int)$row['quantity'],
        'totalPrice'    => (int)$row['price'] * (int)$row['quantity'],
        'paymentMethod' => '카드', // 실제 결제 수단이 없어서 임시로 카드 고정
        'orderId'       => $row['order_id']
    ];
}

echo json_encode($purchases, JSON_UNESCAPED_UNICODE);
?>