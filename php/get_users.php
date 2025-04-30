<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "관리자 권한이 필요합니다."]);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db.php';

$sql = "SELECT id, name, username FROM users";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(['success' => false, 'error' => $conn->error]);
    exit;
}

$users = [];
while ($row = $result->fetch_assoc()) {
    $user_id = $row['id'];

    // ✅ 매점 구매 내역
    $store_sql = "SELECT name, price, quantity, location, date FROM purchases WHERE user_id = ? AND product_type = 'store'";
    $store_stmt = $conn->prepare($store_sql);
    $store_stmt->bind_param("i", $user_id);
    $store_stmt->execute();
    $store_result = $store_stmt->get_result();

    $store_purchases = [];
    $store_score_total = 0;
    while ($store_row = $store_result->fetch_assoc()) {
        $store_purchases[] = $store_row;
        $store_score_total += (int)$store_row['quantity'];
    }

    // ✅ 영화관 예매 내역
    $cinema_sql = "
        SELECT 
            r.movie_id,
            m.title AS movie_title,
            r.total_price,
            r.show_date,
            r.show_time,
            r.seat_code
        FROM reservations r
        JOIN movies m ON r.movie_id = m.movie_id
        WHERE r.user_id = ?
    ";
    $cinema_stmt = $conn->prepare($cinema_sql);
    $cinema_stmt->bind_param("i", $user_id);
    $cinema_stmt->execute();
    $cinema_result = $cinema_stmt->get_result();

    $cinema_reservations = [];
    $cinema_score_total = 0;
    while ($cinema_row = $cinema_result->fetch_assoc()) {
        $cinema_reservations[] = $cinema_row;
        $cinema_score_total++;
    }

    // ✅ 점수 갱신
    $update_score_sql = "UPDATE users SET store_score = ?, cinema_score = ? WHERE id = ?";
    $update_stmt = $conn->prepare($update_score_sql);
    $update_stmt->bind_param("iii", $store_score_total, $cinema_score_total, $user_id);
    $update_stmt->execute();

    // ✅ 사용자 데이터 구성
    $users[] = [
        'id' => $row['id'],
        'name' => $row['name'],
        'username' => $row['username'],
        'store_score' => $store_score_total,
        'cinema_score' => $cinema_score_total,
        'purchases' => [
            'store' => $store_purchases,
            'cinema' => $cinema_reservations
        ]
    ];
}

echo json_encode([
    'success' => true,
    'users' => $users
], JSON_UNESCAPED_UNICODE);
?>
