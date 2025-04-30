document.addEventListener("DOMContentLoaded", function () {
    fetch("/php/get_movies.php")
        .then(res => {
            if (!res.ok) throw new Error("서버 응답 오류");
            return res.json();
        })
        .then(data => {
            if (!data || typeof data !== "object") throw new Error("데이터 오류");
            renderMovies(data.current, "list1");
            renderMovies(data.upcoming, "list2");
            renderMovies(data.all, "list3");
        })
        .catch(err => {
            console.error("영화 불러오기 실패:", err);
            alert("영화 목록을 불러오는 데 실패했습니다.");
        });

    document.querySelectorAll(".more-button").forEach((button, index) => {
        button.addEventListener("click", () => {
            const categories = ["current", "upcoming", "all"];
            window.location.href = `/html/movie-list.html?category=${categories[index]}`;
        });
    });
});

function renderMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(movies)) return;
    container.innerHTML = "";

    movies.slice(0, 5).forEach(movie => {
        const div = document.createElement("div");
        div.className = "movie";

        const img = document.createElement("img");
        img.src = movie.poster_path || "/img/default.jpg";
        img.alt = movie.title || "포스터";

        const title = document.createElement("div");
        title.className = "movie-title";
        title.textContent = movie.title || "제목 없음";

        const time = document.createElement("div");
        time.className = "movie-time";
        time.textContent = movie.duration || "상영시간 미정";

        const buttons = document.createElement("div");
        buttons.className = "movie-buttons";

        const reserveBtn = document.createElement("button");
        reserveBtn.textContent = "예매하기";
        reserveBtn.className = "reserve-btn";
        reserveBtn.dataset.id = movie.movie_id;

        const detailBtn = document.createElement("button");
        detailBtn.textContent = "상세정보";
        detailBtn.className = "detail-btn";
        detailBtn.dataset.id = movie.movie_id;

        buttons.appendChild(reserveBtn);
        buttons.appendChild(detailBtn);

        div.appendChild(img);
        div.appendChild(buttons);
        div.appendChild(title);
        div.appendChild(time);

        container.appendChild(div);
    });

    container.querySelectorAll(".reserve-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            fetch("/php/check_login.php", { credentials: "include" })
                .then(res => res.json())
                .then(data => {
                    if (data.loggedIn) {
                        window.location.href = `/html/booking.html?movie_id=${btn.dataset.id}`;
                    } else {
                        alert("예매하려면 로그인이 필요합니다.");
                        window.location.href = "/html/login.html";
                    }
                })
                .catch(error => {
                    console.error("로그인 확인 실패:", error);
                    alert("예매 요청 중 오류가 발생했습니다.");
                });
        });
    });
    

    container.querySelectorAll(".detail-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const movieId = btn.dataset.id;
            window.location.href = `/html/movie-detail.html?movie_id=${movieId}`;
        });
    });
}
