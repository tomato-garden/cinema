<?php
require_once './db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

try {
    // movie_id 입력 유효성 확인
    if (!isset($_GET['movie_id']) || !is_numeric($_GET['movie_id'])) {
        http_response_code(400);
        echo json_encode(['error' => '유효하지 않은 요청입니다.']);
        exit;
    }

    $movieId = intval($_GET['movie_id']);

    // 필요한 필드만 조회
    $sql = "SELECT movie_id, title, description, director, duration, poster_path, quote, reviews FROM movies WHERE movie_id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("쿼리 준비 실패: " . $conn->error);
    $stmt->bind_param("i", $movieId);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$movie = $result->fetch_assoc()) {
        http_response_code(404);
        echo json_encode(['error' => '영화 정보를 찾을 수 없습니다.']);
        exit;
    }
    $stmt->close();

    // 최신 좋아요 수 가져오기
    $likeSql = "SELECT COUNT(*) AS likes FROM movie_likes WHERE movie_id = ?";
    $likeStmt = $conn->prepare($likeSql);
    if (!$likeStmt) throw new Exception("좋아요 쿼리 준비 실패: " . $conn->error);
    $likeStmt->bind_param("i", $movieId);
    $likeStmt->execute();
    $likeResult = $likeStmt->get_result();

    $movie['likes'] = ($likeRow = $likeResult->fetch_assoc()) ? (int)$likeRow['likes'] : 0;
    $likeStmt->close();

    echo json_encode($movie, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => '서버 오류', 'message' => $e->getMessage()]);
}
?>
