<?php
session_start();

// 운영 환경에서는 에러 출력 비활성화
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['SERVER_NAME'] === 'localhost') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
}

header('Content-Type: application/json; charset=utf-8');

// DB 접속
require_once __DIR__ . '/config.php';

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
    error_log("DB 연결 실패: " . $conn->connect_error);
    http_response_code(500);
    echo json_encode(["error" => "서버 오류 발생"], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn->set_charset("utf8");

// ✅ 로그인 세션 체크
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "로그인 후 이용해 주세요"], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$user_id = $_SESSION['user_id'];

// ✅ POST로 item_id 받기
$item_id = isset($_POST['item_id']) ? (int)$_POST['item_id'] : 0;

if ($item_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "잘못된 요청입니다"], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

// ✅ 상품 조회
$stmt = $conn->prepare("SELECT id, name, price FROM store_items WHERE id = ?");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "상품을 찾을 수 없습니다"], JSON_UNESCAPED_UNICODE);
    $stmt->close();
    $conn->close();
    exit;
}

$product = $result->fetch_assoc();
$stmt->close();

// ✅ 주문번호(order_id) 생성
$order_id = '#ORD' . str_pad(mt_rand(0, 99999999), 8, '0', STR_PAD_LEFT);

// ✅ 현재 날짜
$date = date('Y-m-d H:i:s');

// ✅ location은 'store'로 지정 (나중에 필요하면 확장 가능)
$location = 'store';

// ✅ 구매 기록 저장
$insert = $conn->prepare(
    "INSERT INTO purchases (order_id, user_id, product_type, name, price, quantity, location, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

$product_type = 'store'; // 매점 상품
$quantity = 1; // 기본 1개 구매

$insert->bind_param(
    "ssssisss",
    $order_id,
    $user_id,
    $product_type,
    $product['name'],
    $product['price'],
    $quantity,
    $location,
    $date
);

if ($insert->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "구매 완료",
        "order_id" => $order_id
    ], JSON_UNESCAPED_UNICODE);
} else {
    error_log("구매 저장 실패: " . $conn->error);
    http_response_code(500);
    echo json_encode(["error" => "구매 처리 중 오류 발생"], JSON_UNESCAPED_UNICODE);
}

$insert->close();
$conn->close();
?>
