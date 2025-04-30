<?php
$servername = "localhost";
$username = "root";
$password = "1234";
$dbname = "movie"; // 데이터베이스 이름 (예: movie)

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4");

// 연결 체크
if ($conn->connect_error) {
    die("연결 실패: " . $conn->connect_error);
}
?>
