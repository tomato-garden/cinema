<?php
session_start(); // ✅ 세션 시작

include 'db.php';

// ✅ 로그인 확인
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "로그인이 필요합니다."]);
    exit;
}

$user_id = $_SESSION['user_id']; // ✅ 세션에서 user_id 사용
$movie_id = $_POST['movie_id'];
$cinema_id = $_POST['cinema_id'];
$show_date = $_POST['show_date'];
$show_time = $_POST['show_time'];
$seat_code = $_POST['seat_code'];
$adult_count = $_POST['adult_count'];
$teen_count = $_POST['teen_count'];

// ✅ 입력값 검증
if (!isset($movie_id, $cinema_id, $show_date, $show_time, $seat_code, $adult_count, $teen_count) ||
    !is_numeric($movie_id) || !is_numeric($cinema_id) ||
    !preg_match('/^[A-Za-z0-9,]+$/', $seat_code) || !is_numeric($adult_count) || !is_numeric($teen_count)) {
    echo json_encode(["success" => false, "message" => "입력값 오류"]);
    exit;
}

// ✅ 예매 정보 삽입
$stmt = $conn->prepare("
    INSERT INTO reservations (user_id, movie_id, cinema_id, show_date, show_time, seat_code, adult_count, teen_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("iiisssii", $user_id, $movie_id, $cinema_id, $show_date, $show_time, $seat_code, $adult_count, $teen_count);

if ($stmt->execute()) {
    // ✅ 예매 수 증가 (선택 기능)
    $count = $adult_count + $teen_count;

    $update_movie = $conn->prepare("UPDATE movies SET reservation_count = reservation_count + ? WHERE movie_id = ?");
    $update_movie->bind_param("ii", $count, $movie_id);
    $update_movie->execute();
    $update_movie->close();

    $update_cinema = $conn->prepare("UPDATE cinemas SET reservation_count = reservation_count + ? WHERE cinema_id = ?");
    $update_cinema->bind_param("ii", $count, $cinema_id);
    $update_cinema->execute();
    $update_cinema->close();

    echo json_encode(["success" => true, "message" => "예매 완료"]);
} else {
    echo json_encode(["success" => false, "message" => "예매 실패"]);
}

$stmt->close();
$conn->close();
?>