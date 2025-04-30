<?php
header("Content-Type: application/json");
session_start();
require_once("db.php");

// ✅ 로그인 여부 확인
if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "로그인이 필요합니다."]);
  exit;
}

$user_id = $_SESSION['user_id'];
$reservation_id = $_GET['id'] ?? '';

// ✅ 예약 ID 형식 검증 (rs_ 접두 + 안전한 문자만)
if (!preg_match('/^rs_[\w\-\.]+$/', $reservation_id)) {
  echo json_encode(["success" => false, "message" => "잘못된 예약 번호입니다."]);
  exit;
}

// ✅ 본인의 예약 정보만 조회
$stmt = $conn->prepare("
  SELECT 
    r.show_date,
    r.show_time,
    r.seat_code,
    m.title,
    m.poster_path,
    c.name AS cinema_name
  FROM reservations r
  JOIN movies m ON r.movie_id = m.movie_id
  JOIN cinemas c ON r.cinema_id = c.cinema_id
  WHERE r.reservation_id = ? AND r.user_id = ?
");
$stmt->bind_param("si", $reservation_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
  echo json_encode([
    "success" => true,
    "title" => $row["title"],
    "poster_path" => $row["poster_path"],
    "cinema_name" => $row["cinema_name"],
    "show_date" => $row["show_date"],
    "show_time" => $row["show_time"],
    "seat_code" => $row["seat_code"]
  ]);
} else {
  echo json_encode(["success" => false, "message" => "해당 예매 내역을 찾을 수 없습니다."]);
}

$stmt->close();
$conn->close();
