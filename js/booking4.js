console.log("✅ booking4.js 실행 시작");

const reservationId = sessionStorage.getItem("reservationId");
console.log("📦 reservationId:", reservationId);

// ✅ 예약 ID 형식 유효성 검사
if (!reservationId || !/^rs_[\w\-.]+$/.test(reservationId)) {
  alert("예약 정보가 유효하지 않습니다. 메인 페이지로 이동합니다.");
  location.href = "/html/main.html";
} else {
  fetch(`/php/get_reservation_detail.php?id=${reservationId}`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      console.log("🎬 reservation data:", data);

      // ✅ 응답 성공 여부 + 필드 검증
      if (
        !data.success ||
        !data.title ||
        !data.cinema_name ||
        !data.show_date ||
        !data.show_time ||
        !data.seat_code
      ) {
        alert("예매 정보를 불러오지 못했습니다. 로그인 후 다시 확인해주세요.");
        location.href = "/html/login.html";
        return;
      }

      const {
        title,
        poster_path,
        cinema_name,
        show_date,
        show_time,
        seat_code
      } = data;

      // ✅ 예매 정보 표시
      const detailHTML = `
        <div><strong> 영화 제목:</strong> ${title}</div>
        <div><strong> 상영관:</strong> ${cinema_name}</div>
        <div><strong> 날짜 및 시간:</strong> ${show_date} ${show_time}</div>
        <div><strong> 좌석:</strong> ${seat_code}</div>
        <div><strong> 예매 번호:</strong> ${generateBookingNumber(reservationId)}</div>
      `;

      const detailBox = document.querySelector(".booking-details");
      if (detailBox) {
        detailBox.innerHTML = detailHTML;
      } else {
        console.warn("📭 detailBox 요소 없음");
      }

      // ✅ 포스터 이미지 렌더링
      if (poster_path) {
        const img = document.createElement("img");
        img.alt = title;
        img.className = "poster-image";
        img.src = poster_path.replace(/^(\.\.\/)+/, "/");

        const posterBox = document.querySelector(".poster-placeholder");
        if (posterBox) {
          posterBox.innerHTML = "";
          posterBox.appendChild(img);
        } else {
          console.warn("📭 posterBox 요소 없음");
        }
      }
    })
    .catch(err => {
      console.error("❌ 예매 정보 조회 중 오류 발생:", err);
      alert("세션이 만료되었거나 접근할 수 없습니다. 다시 로그인해주세요.");
      location.href = "/html/login.html";
    });
}

// ✅ 예매 번호 생성 함수 (UI용)
function generateBookingNumber(id) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${today}-${String(id).padStart(6, "0")}`;
}
