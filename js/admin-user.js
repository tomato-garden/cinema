// 🔐 관리자 인증 확인
(async () => {
  try {
    const res = await fetch("/php/check_admin.php", { credentials: "include" });
    const data = await res.json();
    if (!data.success) {
      alert("관리자 권한이 없습니다.");
      location.href = "/html/admin-login.html";
      return;
    }
  } catch (err) {
    console.error("인증 확인 실패:", err);
    location.href = "/html/admin-login.html";
  }
})();


// 이미 선언되어 있다면 다시 선언하지 않도록
window.users = window.users || [];

function fetchUsers() {
    fetch('/php/get_users.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.users)) {
          window.users = data.users; // ✅ 전역 users 배열에 저장
          renderTable(data.users);  // ✅ 테이블 렌더링
        } else {
          console.error("❌ 서버 응답 형식 오류:", data);
        }
      })
      .catch(err => console.error("유저 데이터 불러오기 실패:", err));
}

function renderTable(data) {
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";
    data.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td onclick="showDetails('${user.username}', 'store')">${user.store_score}</td>
            <td onclick="showDetails('${user.username}', 'cinema')">${user.cinema_score}</td>
        `;
        tbody.appendChild(row);
    });
}

function searchUser() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const filtered = window.users.filter(user => 
        user.username.toLowerCase().includes(keyword) || user.name.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
    document.getElementById("purchaseDetails").innerHTML = "";
}

function showDetails(userId, category) {
    const user = users.find(u => u.username === userId);
    if (!user) return;
  
    const data = user.purchases?.[category] || [];
    let html = `
      <h2>${userId}님의 ${category === "store" ? "매점" : "영화관"} ${category === "store" ? "구매" : "예매"} 내역</h2>
      <table>
        <thead>
          <tr><th>물품 이름</th><th>가격</th><th>${category === "store" ? "구매 날짜" : "예매 일자"}</th></tr>
        </thead><tbody>
    `;
  
    data.forEach(item => {
      let itemName, itemPrice, itemDate;
  
      if (category === "cinema") {
        itemName = item.movie_title || "제목 없음";  // ✅ 영화 제목
        itemPrice = item.total_price || item.price || "-"; // ✅ 총 가격 우선
        itemDate = item.show_date || item.date || "-";
      } else {
        itemName = item.name || "상품명 없음";
        itemPrice = item.price || "-";
        itemDate = item.date || "-";
      }
  
      html += `<tr><td>${itemName}</td><td>${itemPrice.toLocaleString()}원</td><td>${itemDate}</td></tr>`;
    });
  
    html += "</tbody></table>";
    document.getElementById("purchaseDetails").innerHTML = html;
  }
  


fetchUsers(); // ✅ 로드되면 자동 실행
