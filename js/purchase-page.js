let selectedProduct = null; // ✅ 이거 추가
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("item_id");

  // ✅ 상품 정보 로드 (item_id 기반)
  if (itemId) {
    fetch("/php/store-fetch.php")
      .then(res => res.json())
      .then(products => {
        const product = products.find(p => String(p.id) === itemId);

        if (!product) {
          alert("상품을 찾을 수 없습니다.");
          return;
        }

        selectedProduct = product;

        const formattedPrice = `${Number(product.price).toLocaleString()}원`;

        // 구매 요약 영역
        const summaryRow = document.querySelector(".purchase-summary .item-row");
        if (summaryRow) {
          summaryRow.querySelector(".item-name").textContent = product.name;
          summaryRow.querySelector(".item-price").textContent = formattedPrice;
          summaryRow.querySelector(".item-qty").textContent = "1개";
        }

        // 결제 정보 영역
        const infoSpans = document.querySelectorAll(".payment-info span");
        if (infoSpans.length >= 2) {
          infoSpans[0].textContent = product.name;
          infoSpans[1].textContent = formattedPrice;
        }

        // 총 합계
        const totalPrice = document.querySelector(".total-price");
        if (totalPrice) totalPrice.textContent = formattedPrice;
      })
      .catch(err => {
        console.error("상품 정보 로드 실패:", err);
      });
  } else {
    alert("잘못된 접근입니다.");
  }

  // ✅ 카드 필드 제어
  const payButton = document.querySelector(".pay-button");
  const paymentMethod = document.getElementById("payment-method");
  const cardFields = ["card-number", "card-expiry", "card-cvc"].map(id => document.getElementById(id));
  const cardNumberInput = document.getElementById("card-number");
  const cardExpiryInput = document.getElementById("card-expiry");

  if (!payButton || !paymentMethod || !cardNumberInput) return;

  // 카드번호 자동 하이픈
  cardNumberInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const segments = [];
    for (let i = 0; i < value.length; i += 4) {
      segments.push(value.slice(i, i + 4));
    }
    e.target.value = segments.join("-");
  });

  // 유효기간 자동 포맷
  cardExpiryInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = value.length >= 3 ? value.slice(0, 2) + "/" + value.slice(2) : value;
  });

  // 결제수단 변경 시 카드 입력 필드 토글
  paymentMethod.addEventListener("change", () => {
    const isCard = paymentMethod.value === "card";
    cardFields.forEach(field => {
      field.disabled = !isCard;
      field.parentElement.style.display = isCard ? "flex" : "none";
    });
  });

  // 초기 카드 비활성화 처리
  if (paymentMethod.value !== "card") {
    cardFields.forEach(field => {
      field.disabled = true;
      field.parentElement.style.display = "none";
    });
  }
});

// ✅ 결제 버튼 클릭 시 실행
async function goToPurchase() {
  if (!selectedProduct) {
    alert("상품 정보를 불러오지 못했습니다.");
    return;
  }

  const methodSelect = document.getElementById("payment-method");
  const method = methodSelect ? methodSelect.value : "none";

  const cardNumber = document.getElementById("card-number").value.trim();
  const cardExpiry = document.getElementById("card-expiry").value.trim();
  const cardCVC = document.getElementById("card-cvc").value.trim();

  if (method === "card") {
    const cardPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvcPattern = /^\d{3}$/;

    if (!cardPattern.test(cardNumber)) {
      alert("카드 번호 형식이 올바르지 않습니다 (예: 1234-5678-9012-3456)");
      return;
    }

    if (!expiryPattern.test(cardExpiry)) {
      alert("유효 기간 형식이 잘못되었습니다 (예: MM/YY)");
      return;
    }

    if (!cvcPattern.test(cardCVC)) {
      alert("CVC는 3자리 숫자여야 합니다.");
      return;
    }
  }

  try {
    const res = await fetch("/php/save_purchase.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        item_id: selectedProduct.id,
        quantity: 1,
        location: "영화관 매점"
      })
    });

    const result = await res.json();
    console.log("✅ DB 응답:", result);

    if (result.success) {
      alert("구매가 완료되었습니다.");
      window.location.href = `/html/buying.html?order_id=${result.order_id}&method=${method}`;
    } else {
      alert("❌ 저장 실패: " + result.message);
    }
  } catch (err) {
    alert("🚨 서버 오류 발생: " + err.message);
  }
}
