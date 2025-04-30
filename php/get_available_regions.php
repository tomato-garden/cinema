<?php
require_once "db.php"; // DB 연결

$show_date = $_GET['show_date'] ?? '';
$show_time = $_GET['show_time'] ?? '';

if (!$show_date || !$show_time) {
  echo json_encode(['success' => false, 'message' => '날짜 또는 시간이 누락됨']);
  exit;
}

$stmt = $mysqli->prepare("
  SELECT DISTINCT region 
  FROM cinemas c
  JOIN movie_showtimes s ON c.cinema_id = s.cinema_id
  WHERE s.show_date = ? AND s.show_time = ?
");
$stmt->bind_param("ss", $show_date, $show_time);
$stmt->execute();
$result = $stmt->get_result();

$regions = [];
while ($row = $result->fetch_assoc()) {
  $regions[] = $row['region'];
}

echo json_encode(['success' => true, 'regions' => $regions]);
