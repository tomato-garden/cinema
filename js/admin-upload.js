// 🔐 관리자 인증 확인
(async () => {
  try {
    const res = await fetch("/php/check_admin.php", { credentials: "include" });
    const data = await res.json();
    if (!data.success) {
      alert("관리자 권한이 없습니다.");
      location.href = "/html/admin-login.html";
      return;
    }
  } catch (err) {
    console.error("인증 확인 실패:", err);
    location.href = "/html/admin-login.html";
  }
})();


// ✅ 영화관 선택 관리 (ID:이름 구조)
window.selectedCinemas = window.selectedCinemas || new Map();

function previewPoster(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('posterPreview');
  const text = document.getElementById('posterText');

  if (file) {
    text.innerText = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = '';
    preview.style.display = 'none';
    text.innerText = '포스터 등록';
  }
}

// ✅ 포스터 미리보기
function previewPoster(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('posterText').innerText = file.name;
  }
}


// ✅ 영화관 추가
function addCinema() {
  const dropdown = document.getElementById('cinemaDropdown');
  const id = dropdown.value;
  const name = dropdown.options[dropdown.selectedIndex].text;

  if (!id || selectedCinemas.has(id)) return;

  selectedCinemas.set(id, name);
  renderCinemaTags();
}

// ✅ 태그 제거
function removeCinema(id) {
  selectedCinemas.delete(id);
  renderCinemaTags();
}

// ✅ 영화관 태그 렌더링
function renderCinemaTags() {
  const container = document.getElementById('cinemaTags');
  container.innerHTML = '';
  selectedCinemas.forEach((name, id) => {
    const tag = document.createElement('span');
    tag.innerText = name;
    tag.className = 'cinema-tag';
    tag.onclick = () => removeCinema(id);
    container.appendChild(tag);
  });
}

// ✅ 업로드 처리
function handleUpload() {
  const title = document.getElementById('title').value.trim();
  const director = document.getElementById('director').value.trim();
  const actors = document.getElementById('actors').value.trim();
  const duration = document.getElementById('duration').value.trim();
  const reviews = document.getElementById('reviews').value.trim();
  const description = document.getElementById('description').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const quote = document.getElementById('quote').value.trim(); // ✅ 명대사

  const poster = document.getElementById('posterInput').files[0];
  const cinemaIds = Array.from(selectedCinemas.keys());
  const showDate = document.getElementById('showDateInput').value;
  const adultPrice = document.getElementById('adultPrice').value;
  const teenPrice = document.getElementById('teenPrice').value;

  if (!title || !director || !description || !duration || !startDate || !endDate || cinemaIds.length === 0 || !poster) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('director', director);
  formData.append('actors', actors);
  formData.append('duration', duration);
  formData.append('reviews', reviews);
  formData.append('description', description);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('poster', poster);
  formData.append('cinema_ids', cinemaIds.join(','));
  formData.append('show_date', showDate);
  formData.append('quote', quote);
  formData.append('adult_price', adultPrice);
  formData.append('teen_price', teenPrice);

  // ✅ 상영 날짜+시간 목록 구성
  let showDatetimeList = [];
  selectedShowDatetimes.forEach((times, date) => {
    times.forEach(time => {
      showDatetimeList.push(`${date} ${time}`);
    });
  });
  formData.append('show_datetimes', showDatetimeList.join('|'));

  fetch('/php/upload_movie.php', { method: 'POST', body: formData })
    .then(res => res.text())
    .then(text => {
      try {
        const json = JSON.parse(text);
        if (json.success) {
          alert("✅ 업로드 성공: " + json.message);
        } else {
          alert("❌ 업로드 실패: " + json.error);
        }
      } catch (e) {
        console.error("⚠️ JSON 파싱 실패:", e);
        console.warn("서버 응답:\n", text);
        alert("❌ 서버 오류 발생. 관리자에게 문의하세요.");
      }
    });
}

// ✅ 상영 날짜+시간 세트 관리
window.selectedShowDatetimes = window.selectedShowDatetimes || new Map();

function addShowDatetime() {
  const date = document.getElementById('showDateInput').value;
  const time = document.getElementById('showTimeInput').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!date || !time) return;

  if (!startDate || !endDate) {
    alert("먼저 상영 시작일과 종료일을 설정해주세요.");
    return;
  }

  if (date < startDate || date > endDate) {
    alert("상영 날짜는 시작일과 종료일 사이여야 합니다.");
    return;
  }

  if (!selectedShowDatetimes.has(date)) {
    selectedShowDatetimes.set(date, new Set());
  }

  const times = selectedShowDatetimes.get(date);
  if (times.has(time)) return;

  times.add(time);
  renderShowDatetimeTags();
}

function removeShowDatetime(date, time) {
  const times = selectedShowDatetimes.get(date);
  if (times) {
    times.delete(time);
    if (times.size === 0) selectedShowDatetimes.delete(date);
    renderShowDatetimeTags();
  }
}

function renderShowDatetimeTags() {
  const container = document.getElementById('showDatetimeTags');
  container.innerHTML = '';

  selectedShowDatetimes.forEach((times, date) => {
    times.forEach(time => {
      const tag = document.createElement('span');
      tag.className = 'cinema-tag';
      tag.innerText = `${date} ${time}`;
      tag.onclick = () => removeShowDatetime(date, time);
      container.appendChild(tag);
    });
  });
}

function updateShowDateRange() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  const showDateInput = document.getElementById('showDateInput');
  if (start) showDateInput.min = start;
  if (end) showDateInput.max = end;
}

// ✅ 명대사 미리보기
function previewQuote() {
  const quote = document.getElementById("quote").value.trim();

  if (quote) {
    document.getElementById("result-message").innerHTML =
      `<strong>📝 입력한 명대사 미리보기:</strong><br><em>${quote}</em>`;
  } else {
    document.getElementById("result-message").innerHTML =
      "❗ 명대사가 입력되지 않았습니다.";
  }
}

// ✅ 날짜 변경 시 상영일 범위 조정
document.getElementById('startDate').addEventListener('change', updateShowDateRange);
document.getElementById('endDate').addEventListener('change', updateShowDateRange);

