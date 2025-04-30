<?php
session_start();

// ✅ HTML 직접 접근 시 /html/mypage.html로 강제 리디렉션
if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'text/html') !== false && !isset($_GET['section'])) {
    header('Location: /html/mypage.html');
    exit;
}

// ✅ JSON 응답 헤더 설정
header('Content-Type: application/json; charset=utf-8');

// ✅ 로그인 여부 확인
if (!isset($_SESSION['user_id'])) {
    if (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') !== false) {
        header('Location: /html/login.html');
        exit;
    }

    echo json_encode(['error' => '로그인 후 이용해주세요.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ✅ DB 연결
require_once './db.php';
$userId = $_SESSION['user_id'];
$section = $_GET['section'] ?? '';

if ($section === 'account') {
    $stmt = $conn->prepare("SELECT username, name, phone, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode($row, JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['error' => '사용자 정보를 찾을 수 없습니다.'], JSON_UNESCAPED_UNICODE);
    }
    $stmt->close();

} elseif ($section === 'booking') {
    $stmt = $conn->prepare("
        SELECT 
            r.reservation_id,
            m.title,
            m.poster_path,
            m.director,
            r.show_date,
            r.show_time,
            r.seat_code,
            c.name AS cinema_name
        FROM reservations r
        JOIN movies m ON r.movie_id = m.movie_id
        JOIN cinemas c ON r.cinema_id = c.cinema_id
        WHERE r.user_id = ?
        ORDER BY r.show_date DESC, r.show_time DESC
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        $reservations[] = [
            'ticket'   => $row['reservation_id'],
            'title'    => $row['title'],
            'director' => $row['director'],
            'img'      => $row['poster_path'] ?: '/img/default.jpg',
            'date'     => $row['show_date'],
            'time'     => $row['show_time'],
            'cinema'   => $row['cinema_name'],
            'seat'     => $row['seat_code'],
            'rating'   => '-'
        ];
    }

    echo json_encode(['data' => $reservations], JSON_UNESCAPED_UNICODE);
    $stmt->close();

} elseif ($section === 'purchase') {
    $stmt = $conn->prepare("
        SELECT 
            name,
            price,
            quantity,
            created_at,
            order_id,
            location
        FROM purchases
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $purchases = [];
    while ($row = $result->fetch_assoc()) {
        $purchases[] = [
            'name'          => $row['name'],
            'totalPrice'    => $row['price'],
            'quantity'      => $row['quantity'],
            'date'          => $row['created_at'],
            'orderId'       => $row['order_id'],
            'paymentMethod' => $row['location'] ?? '매점'
        ];
    }

    echo json_encode($purchases, JSON_UNESCAPED_UNICODE);
    $stmt->close();

} else {
    echo json_encode(['error' => '유효하지 않은 섹션입니다.'], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
