async function showContent(type) {
  const validSections = ['account', 'booking', 'purchase'];
  if (!validSections.includes(type)) {
    document.getElementById("content").innerHTML = '<p>유효하지 않은 섹션입니다.</p>';
    return;
  }

  const content = document.getElementById("content");
  let htmlFile = '', cssFile = '', jsFile = '';

  if (type === 'account') {
    htmlFile = '/html/mypage-account.html';
    cssFile = '/css/mypage-account.css';
    jsFile = '/js/mypage-account.js';
  } else if (type === 'booking') {
    htmlFile = '/html/mypage-booking.html';
    cssFile = '/css/mypage-booking.css';
    jsFile = '/js/mypage-booking.js';
  } else if (type === 'purchase') {
    htmlFile = '/html/mypage-store.html';
    cssFile = '/css/mypage-store.css';
    jsFile = '/js/mypage-store.js';
  }

  // 기존 CSS/JS 제거
  document.getElementById('dynamic-css')?.remove();
  document.getElementById('dynamic-js')?.remove();

  // CSS 추가
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssFile;
  link.id = 'dynamic-css';
  document.head.appendChild(link);

  // HTML 로딩
  try {
    const res = await fetch(htmlFile);
    if (!res.ok) throw new Error("페이지 로딩에 실패했습니다.");
    content.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p style="color:red;">페이지를 불러오는 데 문제가 발생했습니다.</p>`;
    return;
  }

  // JS 삽입 및 실행 보장
  const script = document.createElement('script');
  script.src = jsFile;
  script.id = 'dynamic-js';
  script.onload = () => {
    console.log(`✅ ${jsFile} 로드 완료`);

    // 로드된 함수 실행
    if (type === 'account' && typeof loadUserInfo === 'function') loadUserInfo();
    if (type === 'booking') {
      if (typeof initializeElements === 'function') initializeElements();
      if (typeof loadReservations === 'function') loadReservations();
    }
    if (type === 'purchase') {
      if (typeof initializeElements === 'function') initializeElements();
      if (typeof loadPurchases === 'function') loadPurchases();
    }
  };
  script.onerror = () => {
    console.error(`❌ ${jsFile} 로딩 실패`);
  };
  document.body.appendChild(script);
}

// ✅ URL 쿼리에서 section 값 추출
function getSectionFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('section') || 'account';
}

// ✅ URL 변경하며 이동
function navigateTo(section) {
  const validSections = ['account', 'booking', 'purchase'];
  if (!validSections.includes(section)) return;
  history.pushState({}, '', `?section=${section}`);
  showContent(section);
}

// ✅ 로그인 체크 후 콘텐츠 로딩
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/php/get-user-info.php', { credentials: 'include' });
    const data = await res.json();
    if (!data || data.error || !data.username) {
      alert('로그인이 필요합니다.');
      location.href = '/html/login.html';
      return;
    }

    const section = getSectionFromURL();
    showContent(section);
  } catch (e) {
    console.error("❌ 세션 확인 오류:", e);
    alert('로그인 상태를 확인할 수 없습니다.');
    location.href = '/html/login.html';
  }
});
