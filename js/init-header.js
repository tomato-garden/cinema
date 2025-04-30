// js/init-header.js
fetch("/html/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    // header.js 로드하고, 그 안의 함수들을 직접 실행
    const script = document.createElement("script");
    script.src = "/js/header.js";
    script.onload = () => {
      // ✅ 함수 실행은 여기에!
      if (typeof initSearchEvent === "function") initSearchEvent();
      if (typeof updateAuthInDropdown === "function") updateAuthInDropdown();
    };
    document.body.appendChild(script);
  });
