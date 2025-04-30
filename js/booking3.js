function initBooking3() {
  const payButton = document.querySelector(".pay-button");
  const paymentMethod = document.getElementById("payment-method");
  const cardFields = ["card-number", "card-expiry", "card-cvc"].map(id => document.getElementById(id));
  const cardNumberInput = document.getElementById("card-number");
  const cardExpiryInput = document.getElementById("card-expiry");

  if (!payButton || !paymentMethod || !cardNumberInput) return;

  // ✅ sessionStorage에서 예매 정보 로드
  const booking = JSON.parse(sessionStorage.getItem("bookingData") || "{}");
  if (!booking.movie_id || !booking.cinema_id || !booking.show_date || !booking.show_time || !booking.seats || !Array.isArray(booking.seats)) {
    alert("예매 정보가 누락되었거나 잘못되었습니다. 처음부터 다시 시도해주세요.");
    location.href = "/html/booking.html";
    return;
  }
  
  // ✅ 결제 정보 화면에 표시
  document.getElementById("summary-title").textContent = booking.movie_title || "제목 없음";
  document.getElementById("summary-date").textContent = booking.show_date || "-";
  document.getElementById("summary-seats").textContent = booking.seats?.join(", ") || "-";
  const totalPrice = (booking.teen * 7000 + booking.adult * 10000).toLocaleString();
  document.getElementById("summary-price").textContent = totalPrice + "원";

  // 💳 카드번호 입력 시 자동 하이픈 삽입
  cardNumberInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const segments = [];
    for (let i = 0; i < value.length; i += 4) {
      segments.push(value.slice(i, i + 4));
    }
    e.target.value = segments.join("-");
  });

  // 📆 카드 유효기간 입력 자동 포맷 (MM/YY)
  cardExpiryInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = value.length >= 3 ? value.slice(0, 2) + "/" + value.slice(2) : value;
  });

  // 💳 결제 방식 변경 시 카드 입력 필드 표시/숨김
  paymentMethod.addEventListener("change", () => {
    const isCard = paymentMethod.value === "card";
    cardFields.forEach(field => {
      field.disabled = !isCard;
      field.parentElement.style.display = isCard ? "flex" : "none";
    });
  });

  // 초기 상태에서 카드가 아니면 숨김 처리
  if (paymentMethod.value !== "card") {
    cardFields.forEach(field => {
      field.disabled = true;
      field.parentElement.style.display = "none";
    });
  }

  // ✅ 결제 버튼 클릭 시 실행
  payButton.addEventListener("click", () => {
    const selectedMethod = paymentMethod.value;
  
    // 🐛 디버깅용 로그 출력
    console.log("전송 데이터 확인:", {
      user_id: booking.user_id,
      movie_id: booking.movie_id,
      cinema_id: booking.cinema_id,
      show_date: booking.show_date,
      show_time: booking.show_time,
      seats: booking.seats
    });

    // 💳 카드 선택 시 유효성 검사
    if (selectedMethod === "card") {
      const [number, expiry, cvc] = cardFields.map(field => field.value.trim());
      const cardNumberRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      const cvcRegex = /^\d{3}$/;

      if (!cardNumberRegex.test(number)) {
        alert("카드 번호 형식이 올바르지 않습니다. (예: 1234-5678-9012-3456)");
        return;
      }

      if (!expiryRegex.test(expiry)) {
        alert("유효 기간 형식이 올바르지 않습니다. (예: MM/YY)");
        return;
      }

      if (!cvcRegex.test(cvc)) {
        alert("CVC는 3자리 숫자여야 합니다.");
        return;
      }
    }

    // 💾 좌석 정보 DB 저장 요청
    fetch("/php/save_seats.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: booking.user_id, // 서버에서는 session 기준으로 최종 확인
        movie_id: booking.movie_id,
        cinema_id: booking.cinema_id,
        show_date: booking.show_date,
        show_time: booking.show_time,
        seats: booking.seats,
        teen: booking.teen,
        adult: booking.adult
        // ❌ price 정보는 보내지 않음 → 서버에서 재계산
      }),
      credentials: "include"
    })
    
    .then(res => res.text()) // 먼저 텍스트로 응답을 받음
    .then(responseText => {
      try {
        // 응답을 JSON으로 파싱
        const data = JSON.parse(responseText);
        if (data.success) {
          alert("결제가 완료되었습니다!");

          // ✅ 예약 ID를 저장 (booking4에서 사용)
          sessionStorage.setItem("reservationId", data.reservation_id);

          // ✅ 다음 단계로 이동
          if (window.loadPage) {
            loadPage("/html/booking4.html");
          }
        } else {
          alert("좌석 저장 실패: " + data.message);
        }
      } catch (error) {
        console.error("응답을 JSON으로 파싱하는 중 오류 발생:", error);
        alert("서버 응답 오류: " + responseText); // HTML 응답일 경우 표시
      }
    })
    .catch(err => {
      console.error("결제 처리 중 오류 발생:", err);
      alert("결제 중 오류가 발생했습니다.");
    });
  });
}

// ✅ 함수 전역 등록
window.initBooking3 = initBooking3;
