<?php
header('Content-Type: application/json');

// 분기 값 받기
$quarter = isset($_GET['quarter']) ? intval($_GET['quarter']) : 1;

// 예시용 더미 데이터
$stats = [
  "totalSales" => 1320000,
  "totalDays" => 30,
  "moviePreferences" => [
    [
      "name" => "듄 2",
      "sales" => [
        "성인" => ["count" => 5, "total" => 70000],
        "청소년" => ["count" => 4, "total" => 48000]
      ]
    ],
    [
      "name" => "진격의 거인",
      "sales" => [
        "성인" => ["count" => 3, "total" => 42000],
        "청소년" => ["count" => 2, "total" => 24000]
      ]
    ]
  ],
  "foodPreferences" => [
    ["name" => "팝콘", "count" => 10, "total" => 50000],
    ["name" => "콜라", "count" => 6, "total" => 24000]
  ]
];

echo json_encode($stats);
?>