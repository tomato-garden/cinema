<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ✅ 관리자 인증 확인
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "관리자 권한이 필요합니다."]);
    exit;
}

require_once 'db.php';

// ✅ GET 파라미터 받기 (기본: 1분기)
$startMonth = isset($_GET['startMonth']) ? (int)$_GET['startMonth'] : 1;
$endMonth   = isset($_GET['endMonth']) ? (int)$_GET['endMonth'] : 3;

try {
    // ✅ 총 매출
    $sqlTotal = "
        SELECT SUM(price) AS total FROM (
            SELECT total_price AS price, created_at AS date FROM reservations
            UNION ALL
            SELECT price, date FROM purchases
        ) AS combined
        WHERE MONTH(date) BETWEEN ? AND ?
    ";
    $stmt = $conn->prepare($sqlTotal);
    $stmt->bind_param("ii", $startMonth, $endMonth);
    $stmt->execute();
    $totalSales = $stmt->get_result()->fetch_assoc()['total'] ?? 0;

    // ✅ 일일 매출 (오늘 기준)
    $sqlToday = "
        SELECT SUM(price) AS total FROM (
            SELECT total_price AS price, created_at AS date FROM reservations
            WHERE DATE(created_at) = CURDATE()
            UNION ALL
            SELECT price, date FROM purchases
            WHERE DATE(date) = CURDATE()
        ) AS today_combined
    ";
    $resultToday = $conn->query($sqlToday);
    $dailySales = $resultToday->fetch_assoc()['total'] ?? 0;

    // ✅ 영화 선호도
    $sqlMovies = "
        SELECT m.title, COUNT(*) AS count
        FROM reservations r
        JOIN movies m ON r.movie_id = m.movie_id
        WHERE MONTH(r.created_at) BETWEEN ? AND ?
        GROUP BY m.title
        ORDER BY count DESC
        LIMIT 5
    ";
    $stmtMovies = $conn->prepare($sqlMovies);
    $stmtMovies->bind_param("ii", $startMonth, $endMonth);
    $stmtMovies->execute();
    $movies = $stmtMovies->get_result()->fetch_all(MYSQLI_ASSOC);

    // ✅ 음식 선호도
    $sqlFoods = "
        SELECT name, COUNT(*) AS count
        FROM purchases
        WHERE MONTH(date) BETWEEN ? AND ?
        GROUP BY name
        ORDER BY count DESC
        LIMIT 5
    ";
    $stmtFoods = $conn->prepare($sqlFoods);
    $stmtFoods->bind_param("ii", $startMonth, $endMonth);
    $stmtFoods->execute();
    $foods = $stmtFoods->get_result()->fetch_all(MYSQLI_ASSOC);

    // ✅ JSON 응답
    echo json_encode([
        'totalSales' => (int)$totalSales,
        'dailySales' => (int)$dailySales,
        'movies'     => $movies,
        'foods'      => $foods,
        'startMonth' => $startMonth,
        'endMonth'   => $endMonth
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>
