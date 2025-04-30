async function loadReservations() {
  try {
    // 세션 확인
    const resLogin = await fetch('/php/get-user-info.php', { credentials: 'include' });
    const info = await resLogin.json();

    if (!info.username) {
      alert('로그인이 필요합니다.');
      return window.location.href = '/html/login.html';
    }

    // 요소 캐싱
    const pagination = document.getElementById('pagination');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const boxesContainer = document.getElementById('boxes-container');

    if (!pagination || !modal || !closeModal || !boxesContainer) {
      console.warn('❗ 일부 요소 누락 — loadReservations 중단');
      return;
    }

    const modalElements = {
      title:  document.getElementById('modal-title'),
      ticket: document.getElementById('modal-ticket'),
      rating: document.getElementById('modal-rating'),
      date:   document.getElementById('modal-date'),
      time:   document.getElementById('modal-time'),
      cinema: document.getElementById('modal-cinema'),
      seat:   document.getElementById('modal-seat'),
      img:    document.getElementById('modal-img')
    };

    const boxesPerPage = 10;
    let reservations = [];

    // 닫기 버튼
    closeModal.addEventListener('click', () => modal.style.display = 'none');

    // 페이지네이션
    function showPage(page) {
      document.querySelectorAll('.text-box').forEach((box, i) => {
        box.style.display = (i >= (page - 1) * boxesPerPage && i < page * boxesPerPage)
          ? 'block' : 'none';
      });
      document.querySelectorAll('#pagination span')
        .forEach((btn, i) => btn.classList.toggle('active', i + 1 === page));
    }

    function createPagination() {
      const total = Math.ceil(reservations.length / boxesPerPage);
      if (total <= 1) return;
      pagination.innerHTML = '';
      for (let i = 1; i <= total; i++) {
        const btn = document.createElement('span');
        btn.textContent = `[${i}]`;
        btn.onclick = () => showPage(i);
        pagination.appendChild(btn);
      }
      showPage(1);
    }

    function createBoxes() {
      boxesContainer.innerHTML = '';
      reservations.forEach(r => {
        const box = document.createElement('div');
        box.className = 'text-box';

        // 필드 확인
        const title = r.title || '';
        const director = r.director || '';
        const ticket = r.ticket || '';
        const rating = r.rating || '';
        const date = r.date || '';
        const time = r.time || '';
        const cinema = r.cinema || '';
        const seat = r.seat || '';
        const img = r.img || '';

        box.textContent = `${title} / ${director}`;

        box.onclick = () => {
          modalElements.title.textContent = title;
          modalElements.ticket.textContent = ticket;
          modalElements.rating.textContent = rating;
          modalElements.date.textContent = date;
          modalElements.time.textContent = time;
          modalElements.cinema.textContent = cinema;
          modalElements.seat.textContent = seat;
          modalElements.img.src = img;
          modal.style.display = 'flex';
        };

        boxesContainer.appendChild(box);
      });
    }

    // 데이터 요청
    const res = await fetch('/php/mypage.php?section=booking', { credentials: 'include' });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return window.location.href = '/html/login.html';
    }

    const today = new Date().toISOString().slice(0, 10);
    reservations = (data.data || []).filter(x => x.date >= today);
    createBoxes();
    createPagination();

  } catch (e) {
    console.error("❌ loadReservations 에러:", e);
    alert("예매 내역을 불러오는 중 문제가 발생했습니다.");
  }
}

document.addEventListener('DOMContentLoaded', loadReservations);
