document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search); // ✅ 이 줄 추가해야 해
  const productName = urlParams.get("name");
  const productId = urlParams.get("item_id");

  const buyButton = document.querySelector(".button1");
  const accordion = document.querySelector(".accordion");
  const panel = document.querySelector(".panel");

  let selectedProduct = null;

  // ✅ 아코디언 열기/닫기
  accordion.addEventListener("click", function () {
    this.classList.toggle("active");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
  });

  // ✅ 상품 정보 로드
  if (productName || productId) {
    fetch("/php/store-fetch.php")
      .then((res) => res.json())
      .then((products) => {
        let product = null;

        if (productId) {
          product = products.find((p) => String(p.id) === productId);
        } else if (productName) {
          product = products.find((p) => p.name === productName);
        }

        if (product) {
          selectedProduct = product;

          // 상품 이미지 경로 설정
          const imagePath = product.image_path.startsWith("/") 
            ? product.image_path 
            : "/" + product.image_path; 

          document.querySelector("#product-image").src = imagePath;


          // ✅ 상품 상세 정보 DOM 업데이트
          document.querySelector("h2").textContent = product.name;
          document.querySelector(".price1").textContent = product.price.toLocaleString() + "원";
          document.querySelectorAll("p")[0].innerHTML = `<strong>구성품: </strong>${product.components}`;
          document.querySelectorAll("p")[1].innerHTML = `<strong>구매제한: </strong>구매당 최대 ${product.purchase_limit}개`;
          document.querySelectorAll("p")[2].innerHTML = `<strong>유효기간: </strong>${product.validity}`;

          // ✅ 구매 버튼 이벤트 바인딩 (localStorage 기반 로그인 체크)
          if (buyButton) {
            buyButton.addEventListener("click", function () {
              const user = localStorage.getItem('user');
          
              if (!user) {
                  alert("구매하려면 로그인을 먼저 진행해주세요.");
                  window.location.href = '/html/login.html';
                  return;
              }
          
              const confirmed = confirm("구매하시겠습니까?");
              if (confirmed) {
                  const query = new URLSearchParams({
                      item_id: selectedProduct.id
                  }).toString();
          
                  window.location.href = `/html/purchase-page.html?${query}`;
              }
          });
          
          }
        } else {
          alert("해당 상품을 찾을 수 없습니다.");
        }
      })
      .catch((err) => {
        console.error("상품 정보 로드 실패:", err);
      });
  }
});
