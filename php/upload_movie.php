<?php
session_start();
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '관리자 권한이 없습니다.']);
    exit;
}

header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

include './db.php';

// ✅ 필드 수신
$title        = $_POST['title'] ?? null;
$director     = $_POST['director'] ?? null;
$actors       = $_POST['actors'] ?? null;
$duration     = $_POST['duration'] ?? null;
$reviews      = $_POST['reviews'] ?? null;
$description  = $_POST['description'] ?? null;
$start_date   = $_POST['startDate'] ?? null;
$end_date     = $_POST['endDate'] ?? null;
$quote        = $_POST['quote'] ?? null;
$adult_price  = intval($_POST['adult_price'] ?? 0);
$teen_price   = intval($_POST['teen_price'] ?? 0);
$cinema_ids   = explode(",", $_POST['cinema_ids'] ?? "");
$show_datetimes_raw = $_POST['show_datetimes'] ?? "";
$show_datetimes = array_filter(explode("|", $show_datetimes_raw));

// ✅ 포스터 업로드 처리
$poster_path = '';
if (isset($_FILES['poster']) && $_FILES['poster']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../img/movie-poster/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

    $filename = time() . '_' . basename($_FILES['poster']['name']);
    $target_path = $upload_dir . $filename;
    $web_path = '/img/movie-poster/' . $filename;

    if (move_uploaded_file($_FILES['poster']['tmp_name'], $target_path)) {
        $poster_path = $web_path;
    } else {
        echo json_encode(['success' => false, 'message' => '포스터 업로드 실패']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => '포스터 파일이 첨부되지 않았습니다.']);
    exit;
}

// ✅ 필수값 체크
if (!$title || !$director || !$start_date || !$end_date || !$description || !$duration) {
    echo json_encode(['success' => false, 'message' => '필수 항목이 누락되었습니다.']);
    exit;
}

// ✅ 영화 테이블에 INSERT
$sql = "INSERT INTO movies (title, description, start_date, end_date, director, actors, duration, reviews, quote, poster_path, adult_price, teen_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'SQL 준비 실패: ' . $conn->error]);
    exit;
}

$stmt->bind_param(
    "ssssssssssii",
    $title, $description, $start_date, $end_date,
    $director, $actors, $duration, $reviews,
    $quote, $poster_path, $adult_price, $teen_price
);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => '영화 등록 실패: ' . $stmt->error]);
    exit;
}

$movie_id = $stmt->insert_id;
$stmt->close();

// ✅ 영화-영화관 매핑 저장
foreach ($cinema_ids as $cinema_id) {
    if (!is_numeric($cinema_id)) continue;
    $conn->query("INSERT INTO movie_cinemas (movie_id, cinema_id) VALUES ($movie_id, $cinema_id)");
}

// ✅ 영화 상영 일정 저장
foreach ($show_datetimes as $dt) {
    $parts = explode(" ", $dt);
    if (count($parts) !== 2) continue;

    $show_date = $parts[0];
    $show_time = $parts[1];
    foreach ($cinema_ids as $cinema_id) {
        if (!is_numeric($cinema_id)) continue;
        $conn->query("INSERT INTO movie_showtimes (movie_id, cinema_id, show_date, show_time)
                      VALUES ($movie_id, $cinema_id, '$show_date', '$show_time')");
    }
}

echo json_encode(['success' => true, 'message' => '영화 등록 완료']);
?>
