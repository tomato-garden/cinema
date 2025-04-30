<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // DB 연결
    require_once __DIR__ . '/config.php';
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "DB 연결 실패"]);
        exit;
    }

    $conn->set_charset("utf8");

    // 이번 달의 첫 날과 마지막 날
    $start = date("Y-m-01");
    $end = date("Y-m-t");

    // 이번 달 영화 개수 조회
    $sql = "SELECT COUNT(*) AS count FROM movies WHERE start_date BETWEEN ? AND ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["error" => "쿼리 준비 실패"]);
        exit;
    }

    $stmt->bind_param("ss", $start, $end);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = $result->fetch_assoc();
    $count = isset($data['count']) ? intval($data['count']) : 0;

    echo json_encode(["count" => $count], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "영화 수 조회 중 서버 오류 발생"]);
    // error_log($e->getMessage());  ← 운영 환경에서는 이걸로 로그 남겨줘
}
?>
