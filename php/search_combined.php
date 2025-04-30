<?php
header('Content-Type: application/json; charset=utf-8');
require_once('db.php');
$conn->set_charset("utf8mb4");

$raw_keyword = trim($_GET['q'] ?? '');

// ✅ 입력 검증: 최소 2자 이상
if (mb_strlen($raw_keyword, 'UTF-8') < 2) {
  echo json_encode([
    "success" => false,
    "message" => "검색어는 최소 2자 이상 입력해주세요.",
    "movies" => [],
    "store_items" => []
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

$keyword = "%{$raw_keyword}%";
$movies = [];
$store_items = [];

try {
  // 🎬 영화 검색 (최대 20개)
  $stmt1 = $conn->prepare("SELECT movie_id, title, duration, poster_path FROM movies WHERE title LIKE ? LIMIT 20");
  $stmt1->bind_param("s", $keyword);
  $stmt1->execute();
  $result1 = $stmt1->get_result();
  while ($row = $result1->fetch_assoc()) {
    $row['poster_path'] = $row['poster_path'] ?? '';
    if (!empty($row['poster_path']) && strpos($row['poster_path'], '/') !== 0) {
      $row['poster_path'] = '/' . ltrim($row['poster_path'], './');
    }
    $movies[] = $row;
  }

  // 🍿 매점 검색 (최대 20개)
  $stmt2 = $conn->prepare("SELECT id, name, price, components, image_path FROM store_items WHERE name LIKE ? OR components LIKE ? LIMIT 20");
  $stmt2->bind_param("ss", $keyword, $keyword);
  $stmt2->execute();
  $result2 = $stmt2->get_result();
  while ($row = $result2->fetch_assoc()) {
    $row['image_path'] = $row['image_path'] ?? '';
    if (!empty($row['image_path']) && strpos($row['image_path'], '/') !== 0) {
      $row['image_path'] = '/' . ltrim($row['image_path'], './');
    }
    $store_items[] = $row;
  }

  echo json_encode([
    "success" => true,
    "movies" => $movies,
    "store_items" => $store_items
  ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
  echo json_encode([
    "success" => false,
    "message" => "검색 중 오류 발생",
    "error" => $e->getMessage(),
    "movies" => [],
    "store_items" => []
  ], JSON_UNESCAPED_UNICODE);
}
?>
