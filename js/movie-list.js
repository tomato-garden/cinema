document.addEventListener("DOMContentLoaded", () => {
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;
            initPage();
        })
        .catch(error => console.error("Header load error:", error));
});

function initPage() {
    const category = new URLSearchParams(window.location.search).get("category") || "current";

    ["current", "upcoming", "all"].forEach(cat => {
        const btn = document.getElementById(cat);
        if (btn) {
            btn.addEventListener("click", () => {
                changeCategory(cat);
                updateShowMoreVisibility();
            });
        }
    });

    changeCategory(category);

    fetch("/php/get_movies.php")
        .then(res => {
            if (!res.ok) throw new Error("서버 응답 오류");
            return res.json();
        })
        .then(data => {
            if (!data || typeof data !== "object") throw new Error("응답 구조 오류");
            renderMovies(data.current, "current-list");
            renderMovies(data.upcoming, "upcoming-list");
            renderMovies(data.all, "all-list");
            updateShowMoreVisibility();
        })
        .catch(err => {
            console.error("영화 로드 실패:", err);
            alert("영화 데이터를 불러오는 데 실패했습니다.");
        });

    const showMoreBtn = document.querySelector('.show-more');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', expandMovies);
    }
}

function changeCategory(category) {
    document.querySelectorAll('.category-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(category)?.classList.add('active');

    ["current-list", "upcoming-list", "all-list"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });

    const target = document.getElementById(`${category}-list`);
    if (target) {
        target.style.display = "block";
        target.scrollIntoView({ behavior: "smooth" });
    }
}

function renderMovies(movies, containerId) {
    const container = document.querySelector(`#${containerId} .movie-list`);
    if (!container || !Array.isArray(movies)) return;
    container.innerHTML = "";

    movies.forEach(movie => {
        const div = document.createElement("div");
        div.className = "movie";

        const img = document.createElement("img");
        img.src = movie.poster_path || "/img/default.jpg";
        img.alt = movie.title || "영화 포스터";

        const title = document.createElement("div");
        title.className = "movie-title";
        title.textContent = movie.title || "제목 없음";

        const time = document.createElement("div");
        time.className = "movie-time";
        time.textContent = movie.duration || "상영시간 미정";

        const buttons = document.createElement("div");
        buttons.className = "movie-buttons";

        const btnReserve = document.createElement("button");
        btnReserve.textContent = "예매하기";
        btnReserve.dataset.id = movie.movie_id;
        btnReserve.classList.add("btn-reserve");

        const btnDetail = document.createElement("button");
        btnDetail.textContent = "상세정보";
        btnDetail.dataset.id = movie.movie_id;
        btnDetail.classList.add("btn-detail");

        buttons.appendChild(btnReserve);
        buttons.appendChild(btnDetail);

        div.appendChild(img);
        div.appendChild(buttons);
        div.appendChild(title);
        div.appendChild(time);

        container.appendChild(div);
    });

    container.querySelectorAll('.btn-reserve').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log("예매 버튼 클릭됨");
            fetch('/php/check_login.php')
                .then(res => res.json())
                .then(data => {
                    console.log("로그인 상태:", data);
                    if (data.loggedIn) {
                        console.log("로그인 확인 완료, 이동 시작");
                        window.location.href = `/html/booking.html?movie_id=${btn.dataset.id}`;
                    } else {
                        alert("예매하려면 로그인이 필요합니다.");
                        window.location.href = '/html/login.html';
                    }
                })
                .catch(error => {
                    console.error("로그인 상태 확인 실패:", error);
                    alert("예매 처리 중 문제가 발생했습니다.");
                });
        });
        
    });
    

    container.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', () => {
            const movieId = btn.dataset.id;
            window.location.href = `/html/movie-detail.html?movie_id=${movieId}`;
        });
    });
}

function expandMovies() {
    const visible = document.querySelector('.category:not([style*="display: none"]) .movie-list');
    if (visible) {
        visible.classList.add('expanded');
        document.querySelector('.show-more').style.display = 'none';
    }
}

function updateShowMoreVisibility() {
    const visible = document.querySelector('.category:not([style*="display: none"]) .movie-list');
    if (!visible) return;

    const movieCount = visible.querySelectorAll('.movie').length;
    const rows = Math.ceil(movieCount / 5);

    const showMoreButton = document.querySelector('.show-more');
    if (rows > 4) {
        showMoreButton.style.display = 'block';
        visible.classList.remove('expanded');
    } else {
        showMoreButton.style.display = 'none';
    }
}
