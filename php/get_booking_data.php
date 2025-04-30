<?php
header("Content-Type: application/json");
require_once("db.php");  // $conn (MySQLi 객체)

function respond($data, $success = true) {
    echo json_encode(array_merge(["success" => $success], $data));
    exit;
}

// ✅ 1. 지역으로 영화관 목록
if (isset($_GET['region'])) {
    $region = trim($_GET['region']);

    if (!preg_match('/^[가-힣]{2,10}$/u', $region)) {
        respond(["message" => "잘못된 지역 형식입니다."], false);
    }

    $stmt = $conn->prepare("SELECT cinema_id, name FROM cinemas WHERE region = ?");
    $stmt->bind_param("s", $region);
    $stmt->execute();
    $result = $stmt->get_result();

    $cinemas = [];
    while ($row = $result->fetch_assoc()) {
        $cinemas[] = $row;
    }

    respond(["cinemas" => $cinemas]);
}

// ✅ 2. 특정 영화관의 상영 영화 목록
if (isset($_GET['cinema_id']) && !isset($_GET['movie_id'])) {
    $cinema_id = $_GET['cinema_id'];

    if (!ctype_digit($cinema_id)) {
        respond(["message" => "cinema_id는 숫자여야 합니다."], false);
    }

    $stmt = $conn->prepare("
        SELECT m.movie_id, m.title, m.director, m.duration
        FROM movies m
        JOIN movie_cinemas mc ON m.movie_id = mc.movie_id
        WHERE mc.cinema_id = ?
    ");
    $stmt->bind_param("i", $cinema_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $movies = [];
    while ($row = $result->fetch_assoc()) {
        $movies[] = $row;
    }

    respond(["movies" => $movies]);
}

// ✅ 3. 영화관 + 영화 + 날짜로 상영 시간 목록
if (isset($_GET['cinema_id'], $_GET['movie_id'], $_GET['show_date'])) {
    $cinema_id = $_GET['cinema_id'];
    $movie_id = $_GET['movie_id'];
    $show_date = $_GET['show_date'];

    if (!ctype_digit($cinema_id) || !ctype_digit($movie_id)) {
        respond(["message" => "cinema_id와 movie_id는 숫자여야 합니다."], false);
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $show_date)) {
        respond(["message" => "날짜 형식이 잘못되었습니다."], false);
    }

    $stmt = $conn->prepare("
        SELECT show_time FROM movie_showtimes 
        WHERE cinema_id = ? AND movie_id = ? AND show_date = ?
        ORDER BY show_time ASC
    ");
    $stmt->bind_param("iis", $cinema_id, $movie_id, $show_date);
    $stmt->execute();
    $result = $stmt->get_result();

    $times = [];
    while ($row = $result->fetch_assoc()) {
        $times[] = $row['show_time'];
    }

    respond(["times" => $times]);
}

// ✅ 어떤 조건도 만족하지 않을 경우
respond(["message" => "요청 파라미터가 올바르지 않습니다."], false);
