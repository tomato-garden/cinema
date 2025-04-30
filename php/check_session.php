<?php
session_start();
header('Content-Type: text/plain; charset=utf-8');

if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    echo "✅ 로그인된 사용자 정보\n";
    echo "🔹 user_id: " . $_SESSION['user_id'] . "\n";
    echo "🔹 username: " . $_SESSION['username'] . "\n";
} else {
    echo "❌ 로그인 세션이 없습니다.\n";
    echo "로그인 후 다시 시도해주세요.";
}
?>
