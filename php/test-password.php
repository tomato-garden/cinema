<?php
$plain = 'admin1234';
$hash  = '$2y$12$RPsX7gTS9pvRARQvR2FecO.cwn7oh/cX645EfIG/3glESwjAePIYa';

if (password_verify($plain, $hash)) {
  echo "✅ 일치합니다.";
} else {
  echo "❌ 일치하지 않습니다.";
}
