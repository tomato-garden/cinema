<?php
session_start();
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo "접근 권한이 없습니다.";
    exit;
}

require_once __DIR__ . '/config.php';
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
    die("연결 실패: " . $conn->connect_error);
}

$id = $_POST["id"] ?? 0;
$stmt = $conn->prepare("DELETE FROM store_items WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo "삭제 완료";
} else {
    echo "오류: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
