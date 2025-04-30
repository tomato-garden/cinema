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

    if (!is_numeric($reviewId)) {
        http_response_code(400);
        echo json_encode(['error' => '유효하지 않은 리뷰 ID']);
        exit;
    }

    // 본인 소유 리뷰인지 확인
    $check = $conn->prepare("SELECT user_id FROM reviews WHERE id = ?");
    $check->bind_param("i", $reviewId);
    $check->execute();
    $result = $check->get_result();
    $row = $result->fetch_assoc();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => '리뷰를 찾을 수 없습니다.']);
        exit;
    }

    if ($row['user_id'] != $userId) {
        http_response_code(403);
        echo json_encode(['error' => '본인의 리뷰만 삭제할 수 있습니다.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM reviews WHERE id = ?");
    $stmt->bind_param("i", $reviewId);
    $stmt->execute();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => '서버 오류', 'message' => $e->getMessage()]);
}
?>
