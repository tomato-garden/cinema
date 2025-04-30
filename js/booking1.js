let currentUserId = null;

fetch('/php/check_login.php', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      currentUserId = data.userId;
    } else {
      alert("예매를 진행하려면 로그인이 필요합니다.");
      window.location.href = "/html/login.html";
    }
  })
  .catch(err => {
    console.error("로그인 상태 확인 실패:", err);
    alert("로그인 상태 확인 중 오류가 발생했습니다.");
    window.location.href = "/html/login.html";
  });


(function () {
  const completeWrapper = document.querySelector(".complete-wrapper");
  const regionSelect = document.getElementById("region");
  const movieSection = document.getElementById("movieList")?.closest(".slider-wrapper");
  const timeSection = document.getElementById("timeList")?.closest(".slider-wrapper");

  let selectedDay = null;
  let selectedRegion = null;
  let selectedCinema = null;
  let selectedMovie = null;
  let selectedTime = null;

  generateDayItems();
  completeWrapper.style.display = "none";
  regionSelect.disabled = true;
  movieSection.style.pointerEvents = "none";
  movieSection.style.opacity = 0.4;
  timeSection.style.pointerEvents = "none";
  timeSection.style.opacity = 0.4;

  function generateDayItems() {
    const dayList = document.getElementById("dayList");
    const weekNames = ['일', '월', '화', '수', '목', '금', '토'];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate.getTime());
      d.setDate(baseDate.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const weekday = weekNames[d.getDay()];
      const label = `${month}/${date}(${weekday})`;
      const fullDate = `${year}-${month}-${date}`;

      const div = document.createElement('div');
      div.className = 'slider-item day-item';
      div.textContent = label;
      div.dataset.date = fullDate;

      div.addEventListener("click", () => {
        document.querySelectorAll(".day-item").forEach(i => i.classList.remove("active"));
        div.classList.add("active");
        selectedDay = div.dataset.date;
        regionSelect.disabled = false;
        checkAllSelected();
      });

      dayList.appendChild(div);
    }
  }

  regionSelect.addEventListener("change", e => {
    selectedRegion = e.target.value;
    if (selectedRegion) updateCinemaButtons();
    checkAllSelected();
  });

  function updateCinemaButtons() {
    const region = regionSelect.value;
    const cinemaList = document.getElementById("cinemaList");
    cinemaList.innerHTML = "";

    fetch(`/php/get_booking_data.php?region=${region}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cinemas) {
          data.cinemas.forEach(c => {
            const button = document.createElement("button");
            button.textContent = c.name;
            button.classList.add("time-item");
            button.classList.add("cinema-item"); // ✅ 명확한 구분 위해 클래스 추가

            button.addEventListener("click", () => {
              document.querySelectorAll("#cinemaList .time-item").forEach(btn => btn.classList.remove("active"));
              button.classList.add("active");
              selectedCinema = c.cinema_id;
              movieSection.style.pointerEvents = "auto";
              movieSection.style.opacity = 1;
              fetchMoviesByCinema(c.cinema_id);
              checkAllSelected();
            });

            cinemaList.appendChild(createSliderItem(button));
          });
        }
      });
  }

  function fetchMoviesByCinema(cinemaId) {
    const movieList = document.getElementById("movieList");
    movieList.innerHTML = "";

    fetch(`/php/get_booking_data.php?cinema_id=${cinemaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.movies) {
          data.movies.forEach(movie => {
            const item = document.createElement("div");
            item.className = "slider-item movie-item";
            item.dataset.movieId = movie.movie_id;
            item.innerHTML = `
              <strong>${movie.title}</strong><br>
              ${movie.director} / ${movie.duration}<br>
              <button class="select-btn">선택</button>
            `;

            item.querySelector(".select-btn").addEventListener("click", () => {
              if (!selectedCinema || !selectedDay) {
                alert("날짜와 영화관을 먼저 선택해주세요.");
                return;
              }
              document.querySelectorAll(".movie-item").forEach(i => i.classList.remove("selected"));
              item.classList.add("selected");
              selectedMovie = {
                id: movie.movie_id,
                title: movie.title
              };
              timeSection.style.pointerEvents = "auto";
              timeSection.style.opacity = 1;
              fetchTimesByMovieAndCinema(movie.movie_id, selectedCinema, selectedDay);
              checkAllSelected();
            });

            movieList.appendChild(item);
          });
        }
      });
  }

  function fetchTimesByMovieAndCinema(movieId, cinemaId, showDate) {
    const timeList = document.getElementById("timeList");
    timeList.innerHTML = "";

    fetch(`/php/get_booking_data.php?cinema_id=${cinemaId}&movie_id=${movieId}&show_date=${showDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.times) {
          data.times.forEach(time => {
            const div = document.createElement("div");
            div.className = "slider-item time-item";
            div.textContent = time.slice(0, 5);

            div.addEventListener("click", () => {
              document.querySelectorAll("#timeList .time-item").forEach(i => i.classList.remove("active"));
              div.classList.add("active");
              selectedTime = div.textContent;

              // ✅ 시간 선택 후에도 선택된 cinema-item에 active 유지
              const selectedCinemaBtn = document.querySelector("#cinemaList .cinema-item.active");
              if (selectedCinemaBtn) {
                selectedCinemaBtn.classList.add("active");
              }

              checkAllSelected();
            });

            timeList.appendChild(div);
          });

          timeSection.style.pointerEvents = "auto";
          timeSection.style.opacity = 1;
        }
      });
  }

  function createSliderItem(childElement) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("slider-item");
    wrapper.appendChild(childElement);
    return wrapper;
  }

  function checkAllSelected() {
    if (selectedDay && selectedRegion && selectedCinema && selectedMovie && selectedTime) {
      completeWrapper.style.display = "block";
    } else {
      completeWrapper.style.display = "none";
    }
  }

  const completeBtn = document.querySelector(".complete-btn");
completeBtn?.addEventListener("click", () => {
  if (selectedDay && selectedRegion && selectedCinema && selectedMovie && selectedTime) {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const bookingData = {
      user_id: currentUserId, // ✅ 추가
      movie_id: selectedMovie.id,
      movie_title: selectedMovie.title,
      cinema_id: selectedCinema,
      show_date: selectedDay,
      show_time: selectedTime,
      teen: 0,
      adult: 0,
      seats: []
    };

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    if (window.loadPage) {
      loadPage("/html/booking2.html");
    } else {
      location.href = "/html/booking2.html";
    }
  } else {
    alert("모든 항목을 선택해주세요.");
  }
});
})();
