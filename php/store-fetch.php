<?php
session_start();
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(["error" => "관리자 권한이 필요합니다."]);
    exit;
}

// 운영 서버에서는 에러 출력 비활성화
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// 개발 환경(localhost)에서는 에러 출력
if ($_SERVER['SERVER_NAME'] === 'localhost') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
}

// JSON 형식 지정
header("Content-Type: application/json; charset=utf-8");

// DB 접속 정보 포함
require_once __DIR__ . '/config.php';

// DB 연결
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// 연결 에러 처리
if ($conn->connect_error) {
    http_response_code(500);
    error_log("DB 연결 실패: " . $conn->connect_error);
    echo json_encode(["error" => "서버 오류가 발생했습니다."], JSON_UNESCAPED_UNICODE);
    exit;
}

// 문자셋 설정
$conn->set_charset("utf8");

// SQL 쿼리 준비
$query = "SELECT id, name, price, components, purchase_limit, validity, image_path FROM store_items ORDER BY id DESC";
$stmt = $conn->prepare($query);

// 쿼리 준비 실패
if (!$stmt) {
    http_response_code(500);
    error_log("쿼리 준비 실패: " . $conn->error);
    echo json_encode(["error" => "서버 오류가 발생했습니다."], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

// 실행
$stmt->execute();

// 결과 가져오기
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $row["id"] = (int)$row["id"];
    $row["price"] = (int)$row["price"];
    $row["purchase_limit"] = (int)$row["purchase_limit"];
    $products[] = $row;
}

// JSON 출력
echo json_encode($products, JSON_UNESCAPED_UNICODE);

// 정리
$stmt->close();
$conn->close();
?>
