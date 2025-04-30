<?php
session_start();
require_once './db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => '로그인이 필요합니다.']);
        exit;
    }

    $userId = intval($_SESSION['user_id']);
    $movieId = $_POST['movieId'] ?? null;
    $review = trim($_POST['review'] ?? '');

    if (!is_numeric($movieId) || empty($review)) {
        http_response_code(400);
        echo json_encode(['error' => '유효하지 않은 입력입니다.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO reviews (movie_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())");
    if (!$stmt) throw new Exception($conn->error);

    $stmt->bind_param("iis", $movieId, $userId, $review);
    $success = $stmt->execute();

    echo json_encode(['success' => $success]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => '서버 오류', 'message' => $e->getMessage()]);
}
?>
