<?php
// 세션 시작 및 JSON 응답 헤더 설정
session_start();
header("Content-Type: application/json; charset=UTF-8");

// 로그인 여부 확인
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "로그인된 사용자가 없습니다."], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = $_SESSION['user_id'];

// DB 연결
require_once __DIR__ . '/config.php';
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);


// 🔥 한글 처리용 문자셋 설정 (중요!)
$conn->set_charset("utf8");

if ($conn->connect_errno) {
    echo json_encode(["error" => "DB 연결 실패"], JSON_UNESCAPED_UNICODE);
    exit;
}

// 비밀번호 변경 처리
if (isset($_POST['newPassword']) && !empty($_POST['newPassword'])) {
    $newPassword = $_POST['newPassword'];

    // 현재 비밀번호 가져오기
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    // 비밀번호가 동일한 경우
    if (password_verify($newPassword, $user['password'])) {
        echo json_encode(["message" => "비밀번호가 일치합니다."], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        exit;
    }

    // 새로운 비밀번호 해싱
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // 비밀번호 변경
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $hashedPassword, $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["message" => "비밀번호가 성공적으로 변경되었습니다."], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["error" => "비밀번호 변경 실패"], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
}

// 아이디 변경 처리
if (isset($_POST['newId']) && !empty($_POST['newId'])) {
    $newId = $_POST['newId'];

    // 현재 아이디 가져오기
    $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // 아이디가 동일한 경우
    if ($newId === $user['username']) {
        echo json_encode(["message" => "아이디가 일치합니다."], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        exit;
    }

    // 아이디 변경
    $stmt = $conn->prepare("UPDATE users SET username = ? WHERE id = ?");
    $stmt->bind_param("si", $newId, $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $_SESSION['username'] = $newId;
        echo json_encode([
            "message" => "아이디가 성공적으로 변경되었습니다.",
            "newId" => $newId
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["error" => "아이디 변경 실패"], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
}

$conn->close();
?>
