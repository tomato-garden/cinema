<?php
header("Content-Type: application/json");
require_once("db.php");

$movie_id   = $_GET['movie_id']   ?? null;
$cinema_id  = $_GET['cinema_id']  ?? null;
$show_date  = $_GET['show_date']  ?? null;
$show_time  = $_GET['show_time']  ?? null;

if (
  !$movie_id || !$cinema_id || !$show_date || !$show_time ||
  !ctype_digit($movie_id) || !ctype_digit($cinema_id) ||
  !preg_match('/^\d{4}-\d{2}-\d{2}$/', $show_date) ||
  !preg_match('/^\d{2}:\d{2}$/', $show_time)
) {
  echo json_encode(["success" => false, "message" => "잘못된 파라미터"]);
  exit;
}

$stmt = $conn->prepare("
  SELECT seat_code FROM reservations 
  WHERE movie_id = ? AND cinema_id = ? AND show_date = ? AND show_time = ?
");
$stmt->bind_param("iiss", $movie_id, $cinema_id, $show_date, $show_time);
$stmt->execute();
$result = $stmt->get_result();

$reserved = [];
while ($row = $result->fetch_assoc()) {
  $seats = explode(",", $row['seat_code']);
  $reserved = array_merge($reserved, $seats);
}

echo json_encode(["success" => true, "reserved" => array_values(array_unique($reserved))]);

$stmt->close();
$conn->close();
