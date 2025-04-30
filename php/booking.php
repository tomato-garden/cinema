<?php
include 'booking_db.php';
$conn->set_charset("utf8"); // 문자셋 설정

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'add_region':
        $region = $_POST['region_name'] ?? '';
        $sql = "INSERT INTO booking_region (name) VALUES (?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $region);
        $stmt->execute();
        echo "✅ 지역 추가 완료";
        break;

    case 'add_cinema':
        $region_id = $_POST['region_id'] ?? 0;
        $name = $_POST['cinema_name'] ?? '';
        $sql = "INSERT INTO booking_cinema (region_id, name) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $region_id, $name);
        $stmt->execute();
        echo "✅ 영화관 추가 완료";
        break;

    case 'add_movie':
        $title = $_POST['title'] ?? '';
        $genre = $_POST['genre'] ?? '';
        $rating = $_POST['rating'] ?? '';
        $sql = "INSERT INTO booking_movie (title, genre, rating) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $title, $genre, $rating);
        $stmt->execute();
        echo "✅ 영화 추가 완료";
        break;

    case 'add_schedule':
        $cinema_id = $_POST['cinema_id'] ?? 0;
        $movie_id = $_POST['movie_id'] ?? 0;
        $date = $_POST['show_date'] ?? '';
        $time = $_POST['show_time'] ?? '';
        $sql = "INSERT INTO booking_schedule (cinema_id, movie_id, show_date, show_time) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiss", $cinema_id, $movie_id, $date, $time);
        $stmt->execute();
        echo "✅ 상영정보 추가 완료";
        break;

    // 여기에 예매, 좌석 등 추가 가능

    default:
        echo "❌ 잘못된 요청입니다.";
        break;
}
?>
