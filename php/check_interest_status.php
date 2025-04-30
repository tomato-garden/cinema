<?php
require_once './db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    if (!isset($_GET['movie_id'], $_GET['user_id']) || 
        !is_numeric($_GET['movie_id']) || !is_numeric($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode(['error' => '유효하지 않은 요청입니다.']);
        exit;
    }

    $movieId = intval($_GET['movie_id']);
    $userId = intval($_GET['user_id']);

    $stmt = $conn->prepare("SELECT 1 FROM movie_likes WHERE movie_id = ? AND user_id = ?");
    if (!$stmt) {
        throw new Exception("쿼리 준비 실패: " . $conn->error);
    }

    $stmt->bind_param("ii", $movieId, $userId);
    $stmt->execute();
    $stmt->store_result();

    $isInterests = $stmt->num_rows > 0;

    echo json_encode(['isInterests' => $isInterests]);
    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => '서버 오류', 'message' => $e->getMessage()]);
}
?>
