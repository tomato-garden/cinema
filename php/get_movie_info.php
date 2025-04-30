<?php
require_once 'db.php';

$movieId = $_GET['movie_id'] ?? null;

if (!$movieId) {
    http_response_code(400);
    echo json_encode(["error" => "영화 ID 누락"]);
    exit;
}

$sql = "SELECT * FROM movies WHERE movie_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $movieId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(["error" => "해당 영화 없음"]);
}
?>
