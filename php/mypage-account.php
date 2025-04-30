<?php
session_start();

require_once __DIR__ . '/config.php';
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
    echo json_encode(["error" => "DB 연결 실패"]);
    exit;
}

$user = $_SESSION['user'] ?? null;
if (!$user) {
    echo json_encode(["error" => "로그인 후 이용해주세요."]);
    exit;
}

$type = $_POST['type'] ?? '';
$response = "";

// 아이디 변경
if ($type === "id" && !empty($_POST['newId'])) {
    $newId = trim($_POST['newId']);

    // 아이디 중복 확인
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $newId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $response = "이미 사용 중인 아이디입니다.";
    } else {
        // 아이디 변경
        $stmt = $conn->prepare("UPDATE users SET username = ? WHERE username = ?");
        $stmt->bind_param("ss", $newId, $user['username']);
        if ($stmt->execute()) {
            $_SESSION['user']['username'] = $newId;
            $response = "아이디가 성공적으로 변경되었습니다.";
        } else {
            $response = "아이디 변경 실패.";
        }
    }
    $stmt->close();
}

// 비밀번호 변경
elseif ($type === "password" && !empty($_POST['newPassword'])) {
    $newPassword = $_POST['newPassword'];
    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
    $stmt->bind_param("ss", $hashed, $user['username']);
    if ($stmt->execute()) {
        session_regenerate_id(true);
        $response = "비밀번호가 성공적으로 변경되었습니다.";
    } else {
        $response = "비밀번호 변경 실패.";
    }
    $stmt->close();
}

$conn->close();
echo json_encode(["message" => $response]);
?>
