<?php
session_start();
require_once 'db.php'; // DB 연결 설정

// 한글이 깨지지 않도록 문자 인코딩 설정
header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user']['username'])) {
    echo json_encode(['error' => '로그인이 필요합니다.']);
    exit;
}

$username = $_SESSION['user']['username']; // 사용자 이름을 사용

// 사용자 예약 정보 쿼리
$sql = "SELECT 
            r.id AS reservation_id,
            r.show_date,
            r.show_time,
            r.seat_code,
            m.title,
            m.director,
            m.rating,
            m.image_url,
            c.name AS cinema_name,
            c.theater_name
        FROM reservations r
        JOIN movies m ON r.movie_id = m.movie_id
        JOIN cinemas c ON r.cinema_id = c.cinema_id
        JOIN users u ON r.user_id = u.id
        WHERE u.username = ? 
        ORDER BY r.show_date DESC, r.show_time DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username); // 사용자 이름을 바인딩
$stmt->execute();
$result_set = $stmt->get_result(); // 결과 객체 저장

$reservations = [];

while ($row_data = $result_set->fetch_assoc()) { // fetch_assoc()로 데이터 추출
    // 영화 제목, 감독, 날짜, 시간 등 정보를 배열로 저장
    $reservations[] = [
        'title' => $row_data['title'], // 영화 제목
        'director' => $row_data['director'], // 영화 감독
        'date' => date('n/j (D)', strtotime($row_data['show_date'])), // 예약 날짜 포맷
        'time' => date('H:i', strtotime($row_data['show_time'])) . ' ~ ???', // 시작 시간 (끝나는 시간 필요 시 수정)
        'seat' => $row_data['seat_code'], // 좌석 코드
        'ticket' => sprintf("1111-2222-3333-%04d", $row_data['reservation_id']), // 예약 티켓 번호
        'cinema' => $row_data['cinema_name'] . ' ' . $row_data['theater_name'], // 상영관 정보
        'rating' => $row_data['rating'], // 영화 평점
        'img' => $row_data['image_url'] ?? 'default.jpg' // 영화 이미지 (없으면 기본 이미지 사용)
    ];
}

echo json_encode($reservations); // JSON 형태로 예약 정보 반환
?>
