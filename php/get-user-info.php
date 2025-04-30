<?php
session_start(); // 로그인 세션 사용

header("Content-Type: application/json; charset=UTF-8");

// ✅ 세션 확인 먼저
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "로그인되어 있지 않습니다."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$mysqli = new mysqli("localhost", "root", "1234", "movie");
$mysqli->set_charset("utf8mb4");

// ✅ DB 연결 확인
if ($mysqli->connect_errno) {
    echo json_encode([
        "success" => false,
        "message" => "DB 연결에 실패했습니다."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$user_id = $_SESSION['user_id'];

$query = "SELECT id, username, name FROM users WHERE id = ?";
$stmt = $mysqli->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

// ✅ 사용자 존재 여부 확인
if (!$user) {
    echo json_encode([
        "success" => false,
        "message" => "사용자 정보를 찾을 수 없습니다."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ✅ 최종 응답
echo json_encode([
    "success" => true,
    "user_id" => $user["id"],
    "username" => $user["username"],
    "name" => $user["name"] ?? null
], JSON_UNESCAPED_UNICODE);
?>
