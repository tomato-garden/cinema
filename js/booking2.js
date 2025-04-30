(function () {
  const teenInput = document.getElementById('teen-count');
  if (!teenInput) {
    console.warn("teen-count 요소가 없음");
    return;
  }

  const adultInput = document.getElementById('adult-count');
  const selectedSeatsSpan = document.getElementById('selected-seats');
  const totalViewersSpan = document.getElementById('total-viewers');
  const totalPriceSpan = document.getElementById('total-price');
  const leftZone = document.querySelector('.seat-zone.left');
  const centerZone = document.querySelector('.seat-zone.center');
  const rightZone = document.querySelector('.seat-zone.right');

  leftZone.innerHTML = '';
  centerZone.innerHTML = '';
  rightZone.innerHTML = '';

  const rows = 'ABCDEFGHIJ'.split('');
  const seats = [];
  let selected = [];
  let reservedSeats = [];

  const oldData = JSON.parse(sessionStorage.getItem("bookingData") || "{}");

  // ✅ bookingData 유효성 확인
  if (!oldData.movie_id || !oldData.cinema_id || !oldData.show_date || !oldData.show_time) {
    alert("예매 정보가 누락되었습니다. 처음부터 다시 진행해주세요.");
    location.href = "/html/booking.html";
    return;
  }

  let TEEN_PRICE = 0;
  let ADULT_PRICE = 0;

  // ✅ 가격 정보 불러오기 (표시용)
  fetch(`/php/get_prices.php?movie_id=${oldData.movie_id}`, { credentials: 'include' })
    .then(res => res.json())
    .then(priceData => {
      if (priceData.teen_price !== undefined && priceData.adult_price !== undefined) {
        TEEN_PRICE = priceData.teen_price;
        ADULT_PRICE = priceData.adult_price;
        updateInfo(); // 초기 금액 반영 (표시용)
      } else {
        console.warn("❗ 영화 가격 정보 오류:", priceData);
      }
    })
    .catch(err => {
      console.warn("❌ 가격 요청 실패:", err);
    });

  // ✅ 좌석 예약 정보 불러오기
  fetch(`/php/get_reserved_seats.php?movie_id=${oldData.movie_id}&cinema_id=${oldData.cinema_id}&show_date=${oldData.show_date}&show_time=${oldData.show_time}`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      reservedSeats = Array.isArray(data.reserved)
        ? data.reserved
        : typeof data.reserved === 'string'
          ? data.reserved.split(',').map(s => s.trim())
          : [];

      createNumberLabels();
      generateSeats();
      updateSeatAvailability();
    })
    .catch(err => {
      console.warn("❌ 좌석 정보 불러오기 실패:", err);
      reservedSeats = [];
      createNumberLabels();
      generateSeats();
      updateSeatAvailability();
    });

  function createNumberLabels() {
    const numberRowLeft = document.createElement('div');
    numberRowLeft.className = 'seat-row';
    const spacer = document.createElement('div');
    spacer.style.width = "30px";
    numberRowLeft.appendChild(spacer);
    for (let i = 1; i <= 3; i++) {
      const label = document.createElement('div');
      label.className = 'seat-number-label';
      label.textContent = i;
      numberRowLeft.appendChild(label);
    }

    const numberRowCenter = document.createElement('div');
    numberRowCenter.className = 'seat-row';
    for (let i = 4; i <= 7; i++) {
      const label = document.createElement('div');
      label.className = 'seat-number-label';
      label.textContent = i;
      numberRowCenter.appendChild(label);
    }

    const numberRowRight = document.createElement('div');
    numberRowRight.className = 'seat-row';
    for (let i = 8; i <= 10; i++) {
      const label = document.createElement('div');
      label.className = 'seat-number-label';
      label.textContent = i;
      numberRowRight.appendChild(label);
    }

    leftZone.appendChild(numberRowLeft);
    centerZone.appendChild(numberRowCenter);
    rightZone.appendChild(numberRowRight);
  }

  function generateSeats() {
    rows.forEach(row => {
      const rowLeft = document.createElement('div');
      rowLeft.className = 'seat-row';
      const label = document.createElement('div');
      label.className = 'seat-label';
      label.textContent = row;
      rowLeft.appendChild(label);

      const rowCenter = document.createElement('div');
      rowCenter.className = 'seat-row';
      const rowRight = document.createElement('div');
      rowRight.className = 'seat-row';

      for (let i = 1; i <= 10; i++) {
        const seatNum = `${row}${i}`;
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.seat = seatNum;

        if (reservedSeats.includes(seatNum)) {
          seat.classList.add('reserved', 'disabled');
        } else {
          seat.classList.add('disabled');
          seat.addEventListener('click', () => {
            if (seat.classList.contains('disabled')) return;

            if (seat.classList.contains('selected')) {
              seat.classList.remove('selected');
              selected = selected.filter(s => s !== seatNum);
            } else {
              if (selected.length >= getTotalPeople()) {
                alert(`선택한 인원 수(${getTotalPeople()}명)를 초과할 수 없습니다.`);
                return;
              }
              seat.classList.add('selected');
              selected.push(seatNum);
            }

            updateInfo();
          });
        }

        if (i <= 3) rowLeft.appendChild(seat);
        else if (i <= 7) rowCenter.appendChild(seat);
        else rowRight.appendChild(seat);

        seats.push(seat);
      }

      leftZone.appendChild(rowLeft);
      centerZone.appendChild(rowCenter);
      rightZone.appendChild(rowRight);
    });
  }

  function getTotalPeople() {
    return (parseInt(teenInput.value) || 0) + (parseInt(adultInput.value) || 0);
  }

  function updateSeatAvailability() {
    selected = [];
    seats.forEach(seat => {
      if (!seat.classList.contains('reserved')) {
        seat.classList.remove('disabled', 'selected');
      }
    });
    updateInfo();
  }

  function updateInfo() {
    const teen = parseInt(teenInput.value) || 0;
    const adult = parseInt(adultInput.value) || 0;
    const total = teen + adult;

    totalViewersSpan.textContent = total;
    selectedSeatsSpan.textContent = selected.length > 0 ? selected.join(', ') : '없음';

    const price = teen * TEEN_PRICE + adult * ADULT_PRICE;
    totalPriceSpan.textContent = price.toLocaleString(); // 표시용
  }

  teenInput.addEventListener('input', updateSeatAvailability);
  adultInput.addEventListener('input', updateSeatAvailability);

  const nextBtn = document.querySelector('.next-button');
  if (!nextBtn) {
    console.warn("❌ next-button 요소 없음");
    return;
  }

  let currentUserId = null;
  fetch('/php/check_login.php', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        currentUserId = data.userId;
      }
    });

  nextBtn.addEventListener('click', () => {
    const totalPeople = getTotalPeople();
    if (totalPeople === 0 || selected.length !== totalPeople) {
      alert("인원 수와 좌석 수가 일치해야 합니다.");
      return;
    }

    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const bookingData = {
      ...oldData,
      user_id: currentUserId,
      teen: parseInt(teenInput.value) || 0,
      adult: parseInt(adultInput.value) || 0,
      seats: selected
    };

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    if (window.loadPage) {
      loadPage("/html/booking3.html");
    } else {
      location.href = "/html/booking3.html";
    }
  });
})();
