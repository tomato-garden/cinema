<?php
session_start();
require_once './db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // 로그인 여부 확인
    if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => '로그인이 필요합니다.']);
        exit;
    }

    $userId = intval($_SESSION['user_id']);
    $movieId = $_POST['movie_id'] ?? null;
    $change = $_POST['change'] ?? null;

    if (!is_numeric($movieId) || !in_array($change, ['up', 'down'])) {
        http_response_code(400);
        echo json_encode(['error' => '잘못된 요청입니다.']);
        exit;
    }

    $movieId = intval($movieId);

    if ($change === 'up') {
        $stmt = $conn->prepare("INSERT IGNORE INTO movie_likes (movie_id, user_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $movieId, $userId);
        $stmt->execute();
    } else {
        $stmt = $conn->prepare("DELETE FROM movie_likes WHERE movie_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $movieId, $userId);
        $stmt->execute();
    }

    // 최신 좋아요 수 조회
    $stmt = $conn->prepare("SELECT COUNT(*) FROM movie_likes WHERE movie_id = ?");
    $stmt->bind_param("i", $movieId);
    $stmt->execute();
    $stmt->bind_result($likeCount);
    $stmt->fetch();
    $stmt->close();

    echo json_encode(['success' => true, 'likes' => $likeCount]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => '서버 오류',
        'message' => $e->getMessage()
    ]);
}
?>
