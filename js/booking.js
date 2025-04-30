document.addEventListener("DOMContentLoaded", () => {
  // ✅ 로그인 상태 먼저 확인
  fetch("/php/check_login.php", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (!data.loggedIn) {
        alert("예매를 진행하려면 로그인이 필요합니다.");
        window.location.href = "/html/login.html";
      } else {
        initBookingSystem();  // 로그인 되어 있을 때만 예매 시작
      }
    })
    .catch(err => {
      console.error("로그인 확인 실패:", err);
      alert("로그인 상태 확인 중 오류가 발생했습니다.");
      window.location.href = "/html/login.html";
    });
});

function initBookingSystem() {
  const contentInner = document.querySelector(".content-inner");

  function removeAsset(type, name) {
    if (type === "script") {
      const oldScript = document.querySelector(`script[src="${name}"]`);
      if (oldScript) oldScript.remove();
    } else if (type === "css") {
      const oldCss = document.querySelector(`link[href="${name}"]`);
      if (oldCss) oldCss.remove();
    }
  }

  function removeAllDynamicCss() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      if (
        !link.href.includes("/css/booking.css") &&
        !link.href.includes("/css/header.css")
      ) {
        link.remove();
      }
    });
  }

  function loadJs(src, callback) {
    removeAsset("script", src);
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = () => {
      if (typeof callback === "function") callback();
    };
    document.body.appendChild(script);
  }

  function loadCss(href) {
    removeAsset("css", href);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function executeScripts(container) {
    const scripts = container.querySelectorAll("script");
    scripts.forEach(script => {
      const newScript = document.createElement("script");
      if (script.src) {
        if (!document.querySelector(`script[src="${script.src}"]`)) {
          newScript.src = script.src;
          newScript.defer = true;
          document.body.appendChild(newScript);
        }
      } else {
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      }
    });
  }

  function updateStepUI(pageUrl) {
    const stepsWrapper = document.querySelector(".steps-wrapper");
    const steps = stepsWrapper.querySelectorAll(".step");
    stepsWrapper.style.backgroundColor = "#1e1e1e";

    const activeColor = "#cccccc";
    const stepIndexMap = {
      "/html/booking1.html": 0,
      "/html/booking2.html": 1,
      "/html/booking3.html": 2,
      "/html/booking4.html": 3
    };
    const stepIndex = stepIndexMap[pageUrl] ?? 0;

    steps.forEach((step, idx) => {
      if (idx === stepIndex) {
        step.classList.add("active-step");
        step.style.backgroundColor = activeColor;
        step.style.color = "#000";
        step.style.border = "1px solid #888";
      } else {
        step.classList.remove("active-step");
        step.style.backgroundColor = "#fff";
        step.style.color = "#333";
        step.style.border = "1px solid #ccc";
      }
    });

    const urlObj = new URL(window.location.href);
    const params = urlObj.search;
    window.history.pushState({}, '', "/html/booking.html" + params);
  }

  function loadPage(pageUrl) {
    fetch(pageUrl)
      .then(res => res.text())
      .then(html => {
        const temp = document.createElement("div");
        temp.innerHTML = html;

        const innerContent = temp.querySelector(".content-inner") || temp;

        if (!pageUrl.includes("step=4")) {
          contentInner.innerHTML = innerContent.innerHTML;
        }

        removeAllDynamicCss();
        updateStepUI(pageUrl);

        switch (pageUrl) {
          case "/html/booking1.html":
            loadCss("/css/booking1.css");
            loadJs("/js/booking1.js");
            break;
          case "/html/booking2.html":
            loadCss("/css/booking2.css");
            loadJs("/js/booking2.js");
            break;
          case "/html/booking3.html":
            loadCss("/css/booking3.css");
            loadJs("/js/booking3.js", () => {
              console.log("✅ booking3.js loaded");
              if (typeof initBooking3 === "function") {
                console.log("✅ initBooking3 found, running...");
                initBooking3();
              } else {
                console.warn("⚠️ initBooking3 not found");
              }
            });
            break;
          case "/html/booking4.html":
            loadCss("/css/booking4.css");
            loadJs("/js/booking4.js");
            break;
        }

        executeScripts(temp);
      })
      .catch(err => {
        contentInner.innerHTML = "<p>페이지를 불러올 수 없습니다.</p>";
        console.error("Error loading page:", err);
      });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const step = urlParams.get("step") || "1";
  loadPage("/html/booking" + step + ".html");

  window.loadPage = loadPage;
}

function scrollSlider(listId, scrollAmount) {
  const list = document.getElementById(listId);
  if (list && list.parentElement) {
    list.parentElement.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  }
}
