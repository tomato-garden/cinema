document.addEventListener("DOMContentLoaded", async () => {
  // 🔐 관리자 인증 확인
  const isAdmin = await verifyAdmin();
if (!isAdmin) {
  alert("관리자 권한이 필요합니다.");
  location.href = "/html/admin-login.html";
  return;
}

  // ✅ 관리자 인증 후 사이드바 로드
  const sidebar = document.getElementById("sidebar-container");
  if (sidebar) {
    fetch("/html/admin-include.html")
      .then(res => res.text())
      .then(html => {
        sidebar.innerHTML = html;
        setupSidebarEvents();
      })
      .catch(err => {
        console.error("사이드바 로드 실패:", err);
      });
  }
});

// ✅ 관리자 권한 확인 함수
async function verifyAdmin() {
  try {
    const res = await fetch("/php/check_admin.php", { credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error("관리자 확인 오류:", e);
    return false;
  }
}

// ✅ 메뉴 클릭 시 iframe 변경
function setupSidebarEvents() {
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      const target = item.dataset.target;
      if (target && document.getElementById("main-iframe")) {
        document.getElementById("main-iframe").src = target;
      }
    });
  });
}
