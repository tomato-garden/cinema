<?php
header('Content-Type: application/json');
include './db.php';

$movie_id = $_GET['movie_id'] ?? null;

if (!$movie_id) {
  echo json_encode(['success' => false, 'message' => '영화 ID 없음']);
  exit;
}

$query = "SELECT adult_price, teen_price FROM movies WHERE movie_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $movie_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
  echo json_encode([
    'success' => true,
    'adult_price' => (int)$row['adult_price'],
    'teen_price' => (int)$row['teen_price']
  ]);
} else {
  echo json_encode(['success' => false, 'message' => '영화 정보를 찾을 수 없습니다.']);
}
?>
