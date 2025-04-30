<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once('./db.php');
session_start();

// ✅ 로그인 여부 확인
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['success' => false, 'message' => '로그인이 필요합니다.']);
  exit;
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
  echo json_encode(['success' => false, 'message' => '잘못된 요청 형식입니다.']);
  exit;
}

// ✅ 입력값 확인
$movie_id    = intval($input['movie_id'] ?? 0);
$cinema_id   = intval($input['cinema_id'] ?? 0);
$show_date   = $input['show_date'] ?? '';
$show_time   = $input['show_time'] ?? '';
$seats       = $input['seats'] ?? [];
$teen        = intval($input['teen'] ?? 0);
$adult       = intval($input['adult'] ?? 0);

if (!$movie_id || !$cinema_id || !$show_date || !$show_time || empty($seats)) {
  echo json_encode(['success' => false, 'message' => '필수 정보가 누락되었습니다.']);
  exit;
}

$total_people = $teen + $adult;
if ($total_people !== count($seats)) {
  echo json_encode(['success' => false, 'message' => '인원 수와 좌석 수가 일치하지 않습니다.']);
  exit;
}

$seat_code = implode(",", $seats);

// ✅ 가격 정보는 서버에서 재계산
$priceStmt = $conn->prepare("SELECT teen_price, adult_price FROM movies WHERE movie_id = ?");
$priceStmt->bind_param("i", $movie_id);
$priceStmt->execute();
$priceResult = $priceStmt->get_result();
if (!$priceResult || $priceResult->num_rows === 0) {
  echo json_encode(['success' => false, 'message' => '영화 가격 정보를 불러올 수 없습니다.']);
  exit;
}
$priceRow = $priceResult->fetch_assoc();
$teen_price = floatval($priceRow['teen_price']);
$adult_price = floatval($priceRow['adult_price']);

$total_price = $teen * $teen_price + $adult * $adult_price;
$price_per_person = $total_people > 0 ? round($total_price / $total_people, 2) : 0;

// ✅ 좌석 중복 여부 확인
$checkStmt = $conn->prepare("
  SELECT seat_code FROM reservations 
  WHERE movie_id = ? AND cinema_id = ? AND show_date = ? AND show_time = ?
");
$checkStmt->bind_param("iiss", $movie_id, $cinema_id, $show_date, $show_time);
$checkStmt->execute();
$existing = $checkStmt->get_result();

$existing_seats = [];
while ($row = $existing->fetch_assoc()) {
  $existing_seats = array_merge($existing_seats, explode(",", $row['seat_code']));
}
$overlap = array_intersect($existing_seats, $seats);
if (!empty($overlap)) {
  echo json_encode(['success' => false, 'message' => '이미 예약된 좌석이 포함되어 있습니다.', 'conflict' => $overlap]);
  exit;
}

// ✅ 예매 등록
$reservation_id = uniqid('rs_', true);
$insert = $conn->prepare("
  INSERT INTO reservations (
    reservation_id, user_id, movie_id, cinema_id,
    show_date, show_time, seat_code,
    teen, adult, price, total_price, payment_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')
");
$insert->bind_param(
  "siissssiidd",
  $reservation_id, $user_id, $movie_id, $cinema_id,
  $show_date, $show_time, $seat_code,
  $teen, $adult, $price_per_person, $total_price
);

if ($insert->execute()) {
  echo json_encode(['success' => true, 'reservation_id' => $reservation_id]);
} else {
  echo json_encode(['success' => false, 'message' => '예매 실패: ' . $insert->error]);
}

$insert->close();
$conn->close();
