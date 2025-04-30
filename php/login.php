<?php
session_start();
ini_set('display_errors', 1); // ✅ 개발 시에만 사용
error_reporting(E_ALL);

header("Content-Type: text/plain; charset=utf-8");

include __DIR__ . "/db.php";

// 사용자 입력
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (!$username || !$password) {
    echo "아이디 또는 비밀번호가 누락되었습니다.";
    exit;
}

// SQL Injection 방지
$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        // ✅ 세션 고정 공격 방지
        session_regenerate_id(true);

        // ✅ 세션 저장
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        echo "success";
    } else {
        echo "비밀번호가 틀렸습니다.";
    }
} else {
    echo "존재하지 않는 아이디입니다.";
}
