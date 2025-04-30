window.addEventListener('DOMContentLoaded', () => {
  // 🔄 배너 이미지 순환
  const banners = ['/img/banner1.png', '/img/banner2.png', '/img/banner3.png'];
  let currentBanner = 0;
  const bannerImg = document.querySelector('.banner-img img');
  if (bannerImg) {
    setInterval(() => {
      currentBanner = (currentBanner + 1) % banners.length;
      bannerImg.src = banners[currentBanner];
    }, 5000);
  }

  // 🔢 숫자 카운트 애니메이션
  const movieCounts = document.querySelectorAll('.movie-count');
  const countTargets = [0, 0, 0];
  movieCounts.forEach((el, i) => {
    let count = 0;
    const step = Math.ceil(countTargets[i] / 40);
    const interval = setInterval(() => {
      count += step;
      if (count >= countTargets[i]) {
        count = countTargets[i];
        clearInterval(interval);
      }
      el.innerText = count;
    }, 30);
  });
});

// ✅ 추천 영화 TOP 7 동적 로딩
fetch('/php/get_top_movies.php')
  .then(res => {
    if (!res.ok) throw new Error('서버 응답 오류');
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) {
      if (data.error) throw new Error(data.error);
      throw new Error('추천 영화 데이터 형식 오류');
    }

    const container = document.getElementById('topMoviesContainer');
    container.innerHTML = '';

    data.forEach((movie, index) => {
      const movieItem = document.createElement('div');
      movieItem.className = 'movie-item';

      const rankClass = index < 3 ? 'top-left-rank' : '';

      movieItem.innerHTML = `
        <div class="movie-box">
          <img src="${movie.poster_path}" alt="${movie.title} 포스터" onerror="this.src='/img/default.jpg'">
          <div class="movie-rank ${rankClass}"><i>${index + 1}</i></div>
          <div class="movie-overlay"></div>
        </div>
        <div class="movie-buttons">
          <button class="btn-reserve" data-id="${movie.movie_id}">예매하기</button>
          <button class="btn-detail" data-id="${movie.movie_id}">상세정보</button>
        </div>
      `;

      // XSS 방지: description을 직접 추가
      const overlay = movieItem.querySelector('.movie-overlay');
      const desc = document.createElement('p');
      desc.textContent = movie.description || '줄거리가 등록되지 않았습니다.';
      overlay.appendChild(desc);

      container.appendChild(movieItem);
    });

    // ✅ 예매하기 버튼 처리
    document.querySelectorAll('.btn-reserve').forEach(btn => {
      btn.addEventListener('click', () => {
        const movieId = btn.dataset.id;

        fetch('/php/check_login.php', {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => {
            if (data.loggedIn) {
              window.location.href = `/html/booking.html?movie_id=${movieId}`;
            } else {
              alert("예매하려면 로그인이 필요합니다.");
              window.location.href = '/html/login.html';
            }
          })
          .catch(err => {
            console.error("로그인 확인 실패:", err);
            alert("로그인 상태를 확인할 수 없습니다.");
          });
      });
    });

    // ✅ 상세정보 버튼 처리
    document.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const movieId = btn.dataset.id;
        window.location.href = `/html/movie-detail.html?movie_id=${movieId}`;
      });
    });
  })
  .catch(err => {
    console.error("추천 영화 불러오기 실패:", err);
    alert("영화 목록을 불러오지 못했습니다. 나중에 다시 시도해주세요.");
  });

// ✅ 이번 달 영화 수 불러오기
fetch('/php/get_new_movie_count.php')
  .then(res => {
    if (!res.ok) throw new Error('서버 응답 오류');
    return res.json();
  })
  .then(data => {
    const countStr = String(data.count).padStart(3, '0');
    const digits = document.querySelectorAll('.movie-count');
    digits.forEach((el, i) => {
      el.innerText = countStr[i] || '0';
    });
  })
  .catch(err => {
    console.error("이번 달 영화 수 로드 실패:", err);
  });
