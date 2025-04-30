async function loadPurchases() {
  const resLogin = await fetch('/php/get-user-info.php', { credentials: 'include' });
  const info     = await resLogin.json();
  if (!info.username) {
    alert('로그인이 필요합니다.');
    return window.location.href = '/html/login.html';
  }

  const pagination     = document.getElementById('pagination');
  const modal          = document.getElementById('store-modal');
  const closeModal     = document.getElementById('closeStoreModal');
  const boxesContainer = document.getElementById('boxes-container');

  if (!pagination || !modal || !closeModal || !boxesContainer) {
    console.warn('⚠️ 요소 누락 — loadPurchases 중단');
    return;
  }

  const modalElements = {
    name:       document.getElementById('store-product-name'),
    totalPrice: document.getElementById('store-total-price'),
    payment:    document.getElementById('store-payment-method'),
    quantity:   document.getElementById('store-quantity'),
    date:       document.getElementById('store-date'),
    orderId:    document.getElementById('store-order-id'),
  };

  closeModal.onclick = () => modal.style.display = 'none';

  const boxesPerPage = 10;
  let purchases = [];

  function showPage(page) {
    document.querySelectorAll('.purchase-box').forEach((box, i) => {
      box.style.display = (i >= (page - 1) * boxesPerPage && i < page * boxesPerPage)
        ? 'block' : 'none';
    });
    document.querySelectorAll('#pagination span')
      .forEach((btn, i) => btn.classList.toggle('active', i + 1 === page));
  }

  function createPagination() {
    const total = Math.ceil(purchases.length / boxesPerPage);
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
    purchases.forEach(p => {
      const name          = p.name || '이름 없음';
      const quantity      = p.quantity || 0;
      const price         = p.price || 0;
      const totalPrice    = p.totalPrice || (price * quantity);
      const paymentMethod = p.paymentMethod || '미확인';
      const orderId       = p.orderId || '없음';
      const date          = (p.date || '').slice(0, 10);

      const box = document.createElement('div');
      box.className = 'purchase-box';
      box.innerHTML = `
        <h3>${name}</h3>
        <p>구매일: ${date}</p>
      `;
      box.onclick = () => {
        modalElements.name.textContent       = name;
        modalElements.totalPrice.textContent = `${totalPrice.toLocaleString()}원`;
        modalElements.payment.textContent    = paymentMethod;
        modalElements.quantity.textContent   = `${quantity}개`;
        modalElements.date.textContent       = date;
        modalElements.orderId.textContent    = orderId;
        modal.style.display = 'flex';
      };
      boxesContainer.appendChild(box);
    });
  }

  try {
    const res = await fetch('/php/get-purchases.php', { credentials: 'include' });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return window.location.href = '/html/login.html';
    }
    purchases = data || [];
    createBoxes();
    createPagination();
  } catch (e) {
    console.error('❌ loadPurchases 에러:', e);
    alert('스토어 내역을 불러오는 중 문제가 발생했습니다.');
  }
}

document.addEventListener('DOMContentLoaded', loadPurchases);
