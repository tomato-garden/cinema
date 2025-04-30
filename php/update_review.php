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
    $reviewId = $_POST['reviewId'] ?? null;
    $newReview = trim($_POST['newReview'] ?? '');

    if (!is_numeric($reviewId) || empty($newReview)) {
        http_response_code(400);
        echo json_encode(['error' => '입력이 올바르지 않습니다.']);
        exit;
    }

    // 본인 리뷰인지 확인
    $check = $conn->prepare("SELECT user_id FROM reviews WHERE id = ?");
    $check->bind_param("i", $reviewId);
    $check->execute();
    $result = $check->get_result();
    $row = $result->fetch_assoc();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => '리뷰가 존재하지 않습니다.']);
        exit;
    }

    if ((int)$row['user_id'] !== $userId) {
        http_response_code(403);
        echo json_encode(['error' => '본인의 리뷰만 수정할 수 있습니다.']);
        exit;
    }

    // 수정 실행
    $stmt = $conn->prepare("UPDATE reviews SET content = ?, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param("si", $newReview, $reviewId);
    $stmt->execute();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '서버 오류',
        'message' => $e->getMessage()
    ]);
}
?>
