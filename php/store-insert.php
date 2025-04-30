<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: text/html; charset=utf-8");

require_once __DIR__ . '/config.php';
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$conn->set_charset("utf8mb4");
if ($conn->connect_error) {
    die("연결 실패: " . $conn->connect_error);
}
$conn->set_charset("utf8");

// POST로 받은 값 필터링
$name = isset($_POST["product-name"]) ? $_POST["product-name"] : "";
$price = isset($_POST["price"]) ? intval($_POST["price"]) : 0;
$components = isset($_POST["components"]) ? $_POST["components"] : "";
$limit = isset($_POST["purchase-limit"]) ? intval($_POST["purchase-limit"]) : 0;
$validity = isset($_POST["validity"]) ? $_POST["validity"] : "";
$imagePath = "";

$uploadDir = "/img/store/";  // ✅ img 폴더 내 store 서브폴더 (정리용)
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES["product-image"]) && $_FILES["product-image"]["error"] === 0) {
    $filename = basename($_FILES["product-image"]["name"]);
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($_FILES["product-image"]["tmp_name"], $targetPath)) {
        $imagePath = "/img/store/" . $filename;  // ✅ 웹경로로 저장
    } else {
        echo "파일 업로드 실패!";
        exit;
    }
}

// ✅ SQL 인젝션 방지를 위한 Prepared Statement 사용
$stmt = $conn->prepare("INSERT INTO store_items (name, price, components, purchase_limit, validity, image_path)
                        VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sisiss", $name, $price, $components, $limit, $validity, $imagePath);

if ($stmt->execute()) {
    header("Location: ../html/admin-store.html");  // 파일 위치 따라 경로 조정
    exit;
} else {
    echo "오류: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
