<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
  echo json_encode(["success" => false, "message" => "권한 없음"]);
  exit;
}

echo json_encode(["success" => true]);
