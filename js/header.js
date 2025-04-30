// 🔍 검색 이벤트 초기화
function initSearchEvent() {
  const input = document.querySelector(".search-bar input");
  const btn = document.querySelector(".search-btn");
  if (!input || !btn) return;

  const trigger = () => {
    const q = input.value.trim();
    if (!q) return alert("검색어를 입력하세요.");
    location.href = `/html/search.html?q=${encodeURIComponent(q)}`;
  };

  btn.onclick = trigger;
  input.onkeypress = e => {
    if (e.key === "Enter") trigger();
  };
}

// 🔐 서버 세션에 물어보고 username 반환 or null
async function fetchLoginStatus() {
  try {
    const res = await fetch('/php/get-user-info.php', { credentials: 'include' });
    if (!res.ok) throw new Error("서버 응답 오류");
    const data = await res.json();
    return data.username || null;
  } catch (e) {
    console.error('로그인 상태 확인 오류:', e);
    return null;
  }
}

// 🔑 로그인/로그아웃 링크 설정
async function initAuthLink() {
  const a = document.getElementById('auth-link');
  if (!a) return;
  a.onclick = null;

  const user = await fetchLoginStatus();
  if (user) {
    // 로그인된 상태 → 로그아웃 링크로 변경
    a.textContent = '로그아웃';
    a.href = '/php/logout.php';
    a.onclick = e => {
      if (!confirm('로그아웃 하시겠습니까?')) {
        e.preventDefault(); // 취소 시 이동 안 함
      }
    };
  } else {
    // 비로그인 상태 → 로그인 링크
    a.textContent = '로그인';
    a.href = '/html/login.html';
    a.onclick = e => {
      e.preventDefault();
      location.href = '/html/login.html';
    };
  }
}

// 📂 마이페이지 메뉴 클릭 처리
function initMypageMenu() {
  const map = {
    'account-settings-link': 'account',
    'booking-history-link': 'booking',
    'store-history-link': 'purchase'
  };

  Object.entries(map).forEach(([id, section]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.onclick = async e => {
      e.preventDefault();
      const user = await fetchLoginStatus();
      if (user) {
        location.href = `/html/mypage.html?section=${section}`;
      } else {
        alert('로그인이 필요합니다.');
        location.href = '/html/login.html';
      }
    };
  });
}

// 🚨 헤더 비동기 로드 대기 후 초기화
function waitForHeader() {
  if (document.querySelector('.dropdown-menu')) {
    initSearchEvent();
    initAuthLink();
    initMypageMenu();
  } else {
    setTimeout(waitForHeader, 50);
  }
}
waitForHeader();
