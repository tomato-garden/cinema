<?php
$host = "localhost";
$user = "root"; // XAMPP, MAMP는 보통 root
$password = "1234"; // 초기 비번 없음
$dbname = "movie"; // 사용 중인 DB 이름으로 바꾸세요

$conn = new mysqli($host, $user, $password, $dbname);
 $conn->set_charset("utf8mb4");


// 연결 확인
if ($conn->connect_error) {
    die("❌ DB 연결 실패: " . $conn->connect_error);
}
?>
