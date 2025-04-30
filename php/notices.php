<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$host = 'localhost';
$user = 'root';
$pass = '1234';
$dbname = 'movie';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "DB 연결 실패: " . $conn->connect_error]);
    exit;
}
$conn->set_charset("utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// ✅ 관리자 인증이 필요한 메서드
$methods_need_auth = ['POST', 'PUT', 'DELETE'];
if (in_array($method, $methods_need_auth)) {
    if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "관리자 권한이 필요합니다."]);
        exit;
    }
}

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $conn->prepare("SELECT id, title, content, author, created_at FROM notices WHERE id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result()->fetch_assoc();
                if (!$result) {
                    http_response_code(404);
                    echo json_encode(["error" => "해당 공지사항을 찾을 수 없습니다."]);
                    exit;
                }
                echo json_encode($result, JSON_UNESCAPED_UNICODE);
            } else {
                $stmt = $conn->prepare("SELECT id, title, content, author, created_at FROM notices ORDER BY created_at DESC");
                $stmt->execute();
                $result = $stmt->get_result();
                $notices = [];
                while ($row = $result->fetch_assoc()) {
                    $notices[] = $row;
                }
                echo json_encode($notices, JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data || !isset($data['title'], $data['content'], $data['author'])) {
                http_response_code(400);
                echo json_encode(["error" => "입력값이 올바르지 않습니다."]);
                exit;
            }
            if (mb_strlen($data['title']) > 255 || mb_strlen($data['author']) > 100) {
                http_response_code(400);
                echo json_encode(["error" => "제목 또는 작성자가 너무 깁니다."]);
                exit;
            }
            $stmt = $conn->prepare("INSERT INTO notices (title, content, author) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $data['title'], $data['content'], $data['author']);
            $stmt->execute();
            echo json_encode(["message" => "공지사항 등록 완료"]);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                throw new Exception("공지사항 ID가 필요합니다.");
            }
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $conn->prepare("UPDATE notices SET title = ?, content = ?, author = ? WHERE id = ?");
            $stmt->bind_param("sssi", $data['title'], $data['content'], $data['author'], $id);
            $stmt->execute();
            echo json_encode(["message" => "공지사항 수정 완료"]);
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                throw new Exception("공지사항 ID가 필요합니다.");
            }
            $stmt = $conn->prepare("DELETE FROM notices WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(["message" => "공지사항 삭제 완료"]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "허용되지 않은 요청 메서드"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "서버 오류", "message" => $e->getMessage()]);
}

$conn->close();
