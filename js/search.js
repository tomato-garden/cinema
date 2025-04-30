document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get("q") || "").trim();

  if (keyword.length < 2) {
    alert("검색어는 최소 2자 이상 입력해주세요.");
    location.href = "/html/main.html";
    return;
  }

  fetch(`/php/search_combined.php?q=${encodeURIComponent(keyword)}`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      console.log("✅ 검색 결과:", data);

      try {
        if (!data.success) {
          alert(data.message || "검색에 실패했습니다.");
          return;
        }

        renderResults(data.movies || [], "search-movie-list", "movie");
        renderResults(data.store_items || [], "search-store-list", "store");
      } catch (e) {
        console.error("데이터 렌더링 오류:", e);
      }
    })
    .catch(err => {
      console.error("통합 검색 오류:", err);
      renderResults([], "search-movie-list", "movie");
      renderResults([], "search-store-list", "store");
    });

  setupMoreButton("more-movies", "search-movie-list");
  setupMoreButton("more-store", "search-store-list");
});

function renderResults(data, containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const moreButtonId = type === "movie" ? "more-movies" : "more-store";
  const moreButton = document.getElementById(moreButtonId);

  if (!Array.isArray(data) || data.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "no-result";
    emptyMsg.textContent = "검색 결과가 없음";
    container.appendChild(emptyMsg);
    if (moreButton) moreButton.style.display = "none";
    return;
  }

  container.dataset.visibleCount = "4";

  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "search-item";
    if (index >= 4) card.style.display = "none";

    const imagePath = type === "movie" ? item.poster_path : item.image_path;
    const title = type === "movie" ? item.title : item.name;
    const description =
      type === "movie"
        ? item.duration || "상영시간 미정"
        : item.components || "";
    const priceText =
      type === "store" && item.price
        ? `₩ ${Number(item.price).toLocaleString()}`
        : "";

    const buttonsHTML = type === "movie"
      ? `
        <button onclick="handleReserve(${item.movie_id})">예매하기</button>
        <button onclick="location.href='/html/movie-detail.html?movie_id=${item.movie_id}'">상세정보</button>
      `
      : `
        <button onclick="location.href='/html/menu.html?item_id=${item.id}'">구매하기</button>
      `;

    card.innerHTML = `
      <img src="${imagePath}" alt="${title}" onerror="this.src='/img/default.jpg'">
      <div class="movie-title">${title}</div>
      ${priceText ? `<div class="movie-time">${priceText}</div>` : ""}
      <div class="movie-time">${description}</div>
      <div class="movie-buttons">${buttonsHTML}</div>
    `;

    container.appendChild(card);
  });

  moreButton.style.display = data.length <= 4 ? "none" : "inline-block";
}

function setupMoreButton(buttonId, listContainerId) {
  const moreButton = document.getElementById(buttonId);
  const list = document.getElementById(listContainerId);

  if (!moreButton || !list) return;

  moreButton.addEventListener("click", () => {
    const allItems = list.querySelectorAll(".search-item");
    let visibleCount = parseInt(list.dataset.visibleCount || "4");
    const newVisibleCount = visibleCount + 8;

    allItems.forEach((item, index) => {
      if (index < newVisibleCount) item.style.display = "block";
    });

    list.dataset.visibleCount = newVisibleCount.toString();

    if (newVisibleCount >= allItems.length) {
      moreButton.style.display = "none";
    }
  });
}

// 🔐 예매 버튼 클릭 시 로그인 확인
function handleReserve(movieId) {
  fetch('/php/check_login.php', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        location.href = `/html/booking.html?movie_id=${movieId}`;
      } else {
        alert("예매하려면 로그인해야 합니다.");
        location.href = "/html/login.html";
      }
    })
    .catch(err => {
      console.error("로그인 상태 확인 실패:", err);
      alert("로그인 상태 확인 중 오류가 발생했습니다.");
    });
}
