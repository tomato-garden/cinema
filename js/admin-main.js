// ✅ 관리자 인증 보호
(async () => {
  try {
    const res = await fetch("/php/check_admin.php", { credentials: "include" });
    const data = await res.json();
    if (!data.success) {
      alert("관리자 권한이 필요합니다.");
      location.href = "/html/admin-login.html";
      return;
    }

    // 인증 성공 시 라우팅 시작
    bindSidebarEvents();

  } catch (e) {
    console.error("인증 확인 실패:", e);
    location.href = "/html/admin-login.html";
  }
})();

// ✅ 관리자 페이지 라우팅 정의
const routes = {
  "영화 등록": {
    html: "/html/admin-upload.html",
    css: "/css/admin-upload.css",
    js: "/js/admin-upload.js"
  },
  "공지사항 등록": {
    html: "/html/admin-notice.html",
    css: "/css/admin-notice.css",
    js: "/js/admin-notice.js"
  },
  "고객 관리": {
    html: "/html/admin-user.html",
    css: "/css/admin-user.css",
    js: "/js/admin-user.js"
  },
  "매출 및 통계": {
    html: "/html/admin-sales.html",
    css: "/css/admin-sales.css",
    js: [
      "https://cdn.jsdelivr.net/npm/chart.js",
      "/js/admin-sales.js"
    ]
  },
  "매점 관리": {
    iframe: "/html/admin-store.html"
  }
};

// ✅ CSS 동적 로드
function loadCSS(href) {
  document.querySelectorAll('link[data-spa-css]').forEach(el => el.remove());
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-spa-css", "true");
  document.head.appendChild(link);
}

// ✅ JS 동적 로드
function loadJS(src) {
  document.querySelectorAll('script[data-spa-js]').forEach(el => el.remove());

  const loadScript = (s) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = s;
      script.setAttribute("data-spa-js", "true");
      script.onload = () => {
        console.log(`${s} loaded`);
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  if (Array.isArray(src)) {
    src.reduce((prev, cur) => prev.then(() => loadScript(cur)), Promise.resolve());
  } else {
    loadScript(src);
  }
}

// ✅ 콘텐츠 로딩 처리
function loadContent(menuText) {
  const route = routes[menuText];
  const container = document.getElementById("content-container");

  if (!route) {
    container.innerHTML = `<p>준비 중인 페이지입니다.</p>`;
    return;
  }

  if (route.iframe) {
    container.innerHTML = `<iframe src="${route.iframe}" style="width:100%; height:1000px;"></iframe>`;
    return;
  }

  fetch(route.html)
    .then(res => res.text())
    .then(html => {
      const temp = document.createElement("div");
      temp.innerHTML = html;

      const content = temp.querySelector(".content") || temp.querySelector(".main-content");
      container.innerHTML = content?.outerHTML || "<p>내용 없음</p>";

      if (route.css) loadCSS(route.css);
      if (route.js) loadJS(route.js);
    });
}

// ✅ 사이드바 메뉴 이벤트 바인딩
function bindSidebarEvents() {
  const observer = new MutationObserver(() => {
    const items = document.querySelectorAll(".menu li");
    if (items.length > 0) {
      items.forEach(item => {
        item.addEventListener("click", () => {
          document.querySelectorAll(".menu li").forEach(li => li.classList.remove("guswo"));
          item.classList.add("guswo");
          loadContent(item.textContent.trim());
        });
      });
      items[0].click(); // 첫 메뉴 자동 클릭
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById("sidebar-container"), { childList: true, subtree: true });
}
