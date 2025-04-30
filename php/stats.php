<?php
header('Content-Type: application/json');
$mysqli = new mysqli("localhost", "root", "1234", "movie");
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(["error" => "DB 연결 실패"]);
    exit;
}

// 쿼터 값 받아오기
$quarter = isset($_GET['quarter']) ? intval($_GET['quarter']) : 1;
$year = date('Y');
$startMonth = ($quarter - 1) * 3 + 1;
$endMonth = $startMonth + 2;
$startDate = "$year-" . str_pad($startMonth, 2, '0', STR_PAD_LEFT) . "-01";
$endDate = date("Y-m-t", strtotime("$year-" . str_pad($endMonth, 2, '0', STR_PAD_LEFT) . "-01"));

// 전체 매출
$sqlTotal = "SELECT SUM(price * quantity) AS total FROM purchases WHERE date BETWEEN ? AND ?";
$stmt = $mysqli->prepare($sqlTotal);
$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$stmt->bind_result($totalSales);
$stmt->fetch();
$stmt->close();

// 일수 계산 & 평균 일매출
$dayCount = (strtotime($endDate) - strtotime($startDate)) / 86400 + 1;
$avgDailySales = round($totalSales / $dayCount);

// 영화 선호도
$sqlMovie = "SELECT name, SUM(quantity) AS total_count, SUM(price * quantity) AS total_sales
             FROM purchases
             WHERE product_type = 'movie' AND date BETWEEN ? AND ?
             GROUP BY name
             ORDER BY total_sales DESC";
$stmt = $mysqli->prepare($sqlMovie);
$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();
$moviePreferences = [];
while ($row = $result->fetch_assoc()) {
    $moviePreferences[] = $row;
}
$stmt->close();

// 음식 선호도
$sqlFood = "SELECT name, SUM(quantity) AS total_count, SUM(price * quantity) AS total_sales
            FROM purchases
            WHERE product_type = 'food' AND date BETWEEN ? AND ?
            GROUP BY name
            ORDER BY total_sales DESC";
$stmt = $mysqli->prepare($sqlFood);
$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();
$foodPreferences = [];
while ($row = $result->fetch_assoc()) {
    $foodPreferences[] = $row;
}
$stmt->close();

// 응답 전송
echo json_encode([
    "totalSales" => $totalSales,
    "avgDailySales" => $avgDailySales,
    "moviePreferences" => $moviePreferences,
    "foodPreferences" => $foodPreferences
]);

echo json_encode([
    "totalSales" => $totalSales,
    "avgDailySales" => $avgDailySales,
    "moviePreferences" => $moviePreferences,
    "foodPreferences" => $foodPreferences
]);
?>