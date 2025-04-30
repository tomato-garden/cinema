<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
  echo json_encode(["success" => false, "message" => "아이디와 비밀번호를 입력하세요."]);
  exit;
}

require_once("db.php");
$conn->set_charset("utf8mb4");

// ✅ 관리자만 로그인 가능
$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ? AND is_admin = 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
  echo json_encode(["success" => false, "message" => "존재하지 않거나 관리자 권한이 없는 계정입니다."]);
  exit;
}

// ✅ 비밀번호 검증
if (!password_verify($password, $user['password'])) {
  echo json_encode(["success" => false, "message" => "비밀번호가 일치하지 않습니다."]);
  exit;
}

// ✅ 로그인 성공 → 세션에 관리자 권한 부여
$_SESSION['admin_id'] = $user['id'];
$_SESSION['is_admin'] = true;
$_SESSION['username'] = $user['username'];

echo json_encode(["success" => true, "message" => "로그인 성공"]);
