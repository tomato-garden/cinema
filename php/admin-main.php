<?php
// 필요한 경우 PHP 로직 삽입 (예: 세션 확인, 로그인 여부 등)
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>관리자 페이지</title>
  <link rel="stylesheet" href="/css/admin-include.css">
  <style>
    body {
      margin: 0;
      display: flex;
      font-family: Arial, sans-serif;
    }
    #content-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <!-- 사이드바 삽입될 영역 -->
  <div id="sidebar-container"></div>

  <!-- 콘텐츠 로드될 영역 -->
  <div id="content-container">
  </div>

  <!-- 사이드바 로더 -->
  <script src="/js/admin-include.js"></script>

  <!-- 메인 로직 -->
  <script src="/js/admin-main.js"></script>
</body>
</html>
