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

function initializeSalesPage() {
    console.log("✅ admin-sales.js 실행됨");
  
    const quarterSelect = document.getElementById("quarterSelect");
  
    if (!quarterSelect) {
      console.warn("❌ quarterSelect 요소가 없습니다. 페이지가 아직 로드되지 않았을 수 있습니다.");
      return;
    }
  
    function loadStats(startMonth, endMonth) {
      console.log(`📦 ${startMonth}월부터 ${endMonth}월까지의 매출 데이터를 불러옵니다...`);
  
      fetch(`/php/admin-sales.php?startMonth=${startMonth}&endMonth=${endMonth}`)
        .then(res => res.text())
        .then(txt => {
          console.log("🟡 응답 원본:", txt);
  
          let data;
          try {
            data = JSON.parse(txt);
          } catch (e) {
            console.error("❌ JSON 파싱 오류:", e);
            return;
          }
  
          console.log("✅ 파싱된 JSON:", data);
  
          // 총 매출 / 일일 매출 출력
          const totalSalesEl = document.getElementById("totalSales");
          const avgSalesEl = document.getElementById("avgSales");
  
          if (totalSalesEl && avgSalesEl) {
            totalSalesEl.textContent = `₩${Number(data.totalSales).toLocaleString()}`;
            avgSalesEl.textContent = `₩${Number(data.dailySales).toLocaleString()}`;
          } else {
            console.warn("❌ 총매출 또는 일일매출 요소를 찾을 수 없습니다!");
          }
  
          // 🎬 영화 선호도 출력
          const movieStatsEl = document.getElementById("movieStats");
          if (movieStatsEl && Array.isArray(data.movies)) {
            movieStatsEl.innerHTML = '';
            data.movies.forEach((item, index) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>${item.count}회</td>
              `;
              movieStatsEl.appendChild(row);
            });
          }
  
          // 🍿 음식 선호도 출력
          const foodStatsEl = document.getElementById("foodStats");
          if (foodStatsEl && Array.isArray(data.foods)) {
            foodStatsEl.innerHTML = '';
            data.foods.forEach((item, index) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.count}개</td>
              `;
              foodStatsEl.appendChild(row);
            });
          }
        })
        .catch(err => {
          console.error("❌ fetch 에러:", err);
        });
    }
  
    // 최초 1분기 로드
    loadStats(1, 3);
  
    quarterSelect.addEventListener("change", function () {
      const quarter = parseInt(this.value);
      const quarters = {
        1: [1, 3],
        2: [4, 6],
        3: [7, 9],
        4: [10, 12]
      };
      const [startMonth, endMonth] = quarters[quarter];
      loadStats(startMonth, endMonth);
    });
  }
  
  // ✅ admin-main.js에서 라우팅 이후 자동 실행되도록 보장
  initializeSalesPage();
  