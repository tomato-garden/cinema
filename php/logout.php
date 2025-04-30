<?php
session_start();

// ✅ 세션 데이터 삭제
session_unset();
session_destroy();

// ✅ 세션 쿠키도 클라이언트에서 제거
if (ini_get("session.use_cookies")) {
  $params = session_get_cookie_params();
  setcookie(
    session_name(),
    '',
    time() - 42000,
    $params["path"],
    $params["domain"],
    $params["secure"],
    $params["httponly"]
  );
}

// ✅ 메인 페이지로 안전하게 리다이렉트
header("Location: /html/main.html");
exit;
