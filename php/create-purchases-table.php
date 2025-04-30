<?php
$host = 'localhost';
$user = 'your_username';
$pass = 'your_password';
$dbname = 'store'; // 너가 쓰는 DB 이름

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("연결 실패: " . $conn->connect_error);
}

$sql = "
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    product_type ENUM('movie', 'food') NOT NULL,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL,
    location VARCHAR(255),
    date DATETIME NOT NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "purchases 테이블이 성공적으로 생성되었습니다.";
} else {
    echo "테이블 생성 오류: " . $conn->error;
}

$conn->close();
?>
