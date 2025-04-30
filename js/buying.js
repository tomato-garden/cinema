document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const method = params.get("method") || "결제수단 없음";
  const orderId = params.get("order_id") || "주문번호 없음";

  if (!orderId || orderId === "주문번호 없음") {
    alert("주문 정보가 없습니다.");
    return;
  }

  fetch(`/php/fetch_purchase.php?order_id=${orderId}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || "구매 정보를 불러오지 못했습니다.");
        return;
      }

      const productName = data.name || "알 수 없음";
      const productPrice = data.price || 0;

      const formattedPrice = `${Number(productPrice).toLocaleString()}원`;

      // 상품명
      document.querySelector(".receipt-body .line:nth-child(1)").innerHTML =
        `<strong>상품:</strong> ${productName}`;
      
      // 총 금액
      document.querySelector(".receipt-body .line:nth-child(2)").innerHTML =
        `<strong>총금액:</strong> ${formattedPrice}`;
      
      // 결제수단
      document.querySelector(".receipt-body .line:nth-child(3)").innerHTML =
        `<strong>결제수단:</strong> ${method}`;

      // 주문번호
      document.querySelector(".receipt-body .line:nth-child(4)").innerHTML =
        `<strong>주문번호:</strong> ${orderId}`;
    })
    .catch(err => {
      console.error("구매 정보 로드 실패:", err);
      alert("서버 오류가 발생했습니다.");
    });
});
