<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

try {
    if (isset($_SESSION['user_id']) && is_numeric($_SESSION['user_id'])) {
        echo json_encode([
            'loggedIn' => true,
            'userId' => intval($_SESSION['user_id'])
        ]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'loggedIn' => false,
        'error' => '세션 처리 오류',
        'message' => $e->getMessage()
    ]);
}
?>
