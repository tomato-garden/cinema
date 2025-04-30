<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

require_once 'db.php'; // DB 연결

// ✅ 로그인 확인
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => '로그인이 필요합니다.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $user_id = $_SESSION['user_id'];

    // ✅ Prepared Statement 사용
    $sql = "
        SELECT 
            order_id,
            product_type,
            name AS product_name,
            price,
            quantity,
            location,
            date
        FROM purchases
        WHERE user_id = ?
        ORDER BY date DESC
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception('쿼리 준비 실패: ' . $conn->error);

    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $purchases = [];

    while ($row = $result->fetch_assoc()) {
        $utcTime = new DateTime($row['date'], new DateTimeZone('UTC'));
        $utcTime->setTimezone(new DateTimeZone('Asia/Seoul'));

        $purchases[] = [
            'orderId'       => $row['order_id'],
            'productType'   => $row['product_type'],
            'name'          => $row['product_name'],
            'totalPrice'    => (int)$row['price'] * (int)$row['quantity'],
            'paymentMethod' => '카드', // 추후 확장 가능
            'quantity'      => (int)$row['quantity'],
            'date'          => $utcTime->format('n/j (D) H:i')
        ];
    }

    echo json_encode($purchases, JSON_UNESCAPED_UNICODE);

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500); // 서버 에러 코드 설정
    echo json_encode(['error' => '서버 오류 발생: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
