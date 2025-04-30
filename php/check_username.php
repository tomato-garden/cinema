<?php
// /php/check_username.php
include 'db.php'; // DB 연결 파일

$username = $_POST['username'] ?? '';

if (!$username) {
    echo json_encode(['available' => false, 'message' => '아이디가 입력되지 않았습니다.']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['available' => false, 'message' => '이미 사용 중인 아이디입니다.']);
} else {
    echo json_encode(['available' => true, 'message' => '사용 가능한 아이디입니다.']);
}
$stmt->close();
$conn->close();
?>
