<?php
require_once 'db.php';

// 보안 헤더 추가
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // 준비된 문장 사용 (인젝션 위험은 없지만 원칙적으로 사용)
    $sql = "SELECT movie_id, title, description, poster_path FROM movies ORDER BY likes DESC LIMIT 7";
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["error" => "서버 내부 오류(쿼리 준비 실패)"]);
        exit;
    }

    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $movies = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // description이 너무 길 경우, 잘라서 전송 (예: 300자 제한)
        $row['description'] = mb_strimwidth($row['description'] ?? '', 0, 300, '...', 'UTF-8');
        $movies[] = $row;
    }

    echo json_encode($movies, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "추천 영화 정보를 불러오는 데 실패했습니다."]);
    // 실제 서비스에선 error_log($e) 기록 필요 (화면 출력은 X)
}
?>
