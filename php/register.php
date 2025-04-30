<?php
session_start();

// ✅ 개발 중에만 에러 출력, 실서버에서는 주석 처리 또는 ini 설정 변경
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ✅ DB 연결
include 'db.php';

// ✅ 입력값 수신
$username = trim($_POST['username'] ?? '');
$name     = trim($_POST['name'] ?? '');
$phone    = trim($_POST['phone'] ?? '');
$password = $_POST['password'] ?? '';

// ✅ 필수값 검증
if (!$username || !$name || !$phone || !$password) {
    header("Location: /html/register.html?error=empty");
    exit;
}

// ✅ 전화번호 형식 검증 (서버 측도 반드시 적용)
$cleanPhone = str_replace('-', '', $phone);
if (!preg_match("/^010\d{8}$/", $cleanPhone)) {
    header("Location: /html/register.html?error=invalid_phone");
    exit;
}

// ✅ 아이디 중복 검사
$check = $conn->prepare("SELECT username FROM users WHERE username = ?");
$check->bind_param("s", $username);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    header("Location: /html/register.html?error=duplicate");
    exit;
}

// ✅ 비밀번호 해시화
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// ✅ 사용자 정보 저장
$query = "INSERT INTO users (username, name, phone, password) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("ssss", $username, $name, $cleanPhone, $hashedPassword);

if ($stmt->execute()) {
    header("Location: /html/login.html?registered=success");
    exit;
} else {
    // 예외 상황 처리
    error_log("회원가입 실패: " . $conn->error);
    header("Location: /html/register.html?error=server");
    exit;
}
?>
