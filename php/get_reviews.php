<?php
require_once './db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    if (!isset($_GET['movieId']) || !is_numeric($_GET['movieId'])) {
        http_response_code(400);
        echo json_encode(['error' => '유효하지 않은 요청입니다.']);
        exit;
    }

    $movieId = intval($_GET['movieId']);

    $stmt = $conn->prepare("
        SELECT r.id, r.user_id, r.content, r.created_at, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.movie_id = ?
        ORDER BY r.created_at DESC
    ");

    if (!$stmt) {
        throw new Exception("쿼리 준비 실패: " . $conn->error);
    }

    $stmt->bind_param("i", $movieId);
    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];

    while ($row = $result->fetch_assoc()) {
        $reviews[] = [
            'id' => (int)$row['id'],
            'user_id' => (int)$row['user_id'],
            'username' => $row['username'],
            'content' => $row['content'],
            'created_at' => $row['created_at'] // JS에서 locale 시간 처리
        ];
    }

    echo json_encode($reviews, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => '리뷰를 불러오는 중 오류 발생',
        'message' => $e->getMessage()
    ]);
}
?>
