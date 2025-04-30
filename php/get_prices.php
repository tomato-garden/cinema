<?php
header("Content-Type: application/json");
require_once("db.php");

$movie_id = $_GET['movie_id'] ?? null;

if (!$movie_id || !ctype_digit($movie_id)) {
  echo json_encode(["success" => false, "message" => "잘못된 movie_id"]);
  exit;
}

$stmt = $conn->prepare("SELECT teen_price, adult_price FROM movies WHERE movie_id = ?");
$stmt->bind_param("i", $movie_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
  echo json_encode([
    "success" => true,
    "teen_price" => floatval($row['teen_price']),
    "adult_price" => floatval($row['adult_price'])
  ]);
} else {
  echo json_encode(["success" => false, "message" => "해당 영화 정보를 찾을 수 없습니다."]);
}

$stmt->close();
$conn->close();
