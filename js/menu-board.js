document.addEventListener("DOMContentLoaded", () => {
    fetch("/php/store-fetch.php")
        .then(res => res.json())
        .then(products => {
            renderProducts(products); // 상품 렌더링 먼저
            setupBuyButtons();        // 렌더링 후 버튼 이벤트 연결
        })
        .catch(err => console.error("상품 로드 실패:", err));
});

function renderProducts(products) {
    const list1 = document.getElementById("list1");
    const list2 = document.getElementById("list2");

    list1.innerHTML = "";
    list2.innerHTML = "";

    let count1 = 0;
    let count2 = 0;

    products.forEach(product => {
        const cleanPath = product.image_path.replace(/^\/+/, '');

        const item = document.createElement("div");
        item.className = "product-item";
        item.setAttribute('data-id', product.id); // ✅ 상품 id를 data-id로 저장!

        item.innerHTML = `
            <img src="/${cleanPath}" alt="${product.name}">
            <hr class="divider-hr">
            <div class="product-buttons"></div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price.toLocaleString()}원</div>
            <button class="extra-button">구매하기</button>
        `;

        const isPopcorn = (
            product.components.includes("팝콘") ||
            product.components.includes("콜라") ||
            product.name.includes("팝콘") ||
            product.name.includes("콜라")
        );

        if (isPopcorn && count1 < 5) {
            list1.appendChild(item);
            count1++;
        } else if (!isPopcorn && count2 < 5) {
            list2.appendChild(item);
            count2++;
        }
    });
}


// 구매 버튼 이벤트 연결
function setupBuyButtons() {
    const buyButtons = document.querySelectorAll(".extra-button");

    buyButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const productItem = button.closest(".product-item");
            const productId = productItem.getAttribute('data-id'); // data-id 속성 사용 (필요)

            if (!productId) {
                alert("상품 정보를 찾을 수 없습니다.");
                return;
            }

            const query = new URLSearchParams({
                item_id: productId
            }).toString();

            window.location.href = `/html/menu.html?${query}`;
        });
    });
}
