<?php
require_once './db.php'; // 또는 db_connect.php

// 보안 헤더 설정
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$response = [];

try {
    $today = date("Y-m-d");

    // ✅ 추천 TOP 7 (likes 기준)
    $stmtTop = $conn->prepare("SELECT movie_id, title, description, director, poster_path, likes FROM movies ORDER BY likes DESC LIMIT 7");
    $stmtTop->execute();
    $resultTop = $stmtTop->get_result();
    $top = [];
    while ($row = $resultTop->fetch_assoc()) {
        $top[] = $row;
    }
    $response['top'] = $top;
    $stmtTop->close();

    // ✅ 전체 영화 → 현재, 예정, 전체로 분류
    $stmtAll = $conn->prepare("SELECT movie_id, title, duration, poster_path, start_date, end_date FROM movies ORDER BY start_date DESC");
    $stmtAll->execute();
    $resultAll = $stmtAll->get_result();

    $current = [];
    $upcoming = [];
    $all = [];

    while ($row = $resultAll->fetch_assoc()) {
        $all[] = $row;

        if ($row['start_date'] <= $today && $today <= $row['end_date']) {
            $current[] = $row;
        } elseif ($row['start_date'] > $today) {
            $upcoming[] = $row;
        }
    }

    $response['current'] = $current;
    $response['upcoming'] = $upcoming;
    $response['all'] = $all;
    $stmtAll->close();

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "서버 내부 오류",
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
