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
  

let products = [];
let editIndex = null;

// 이미지 미리보기 처리
document.getElementById('product-image').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '#';
        preview.style.display = 'none';
    }
});

// ✅ 상품 등록 시 카테고리별 5개 제한 검사
document.getElementById('storeForm').addEventListener('submit', function (event) {
    const name = document.getElementById('product-name').value.trim();
    const components = document.getElementById('components').value.trim();

    const isPopcornCategory = (
        name.includes("팝콘") || name.includes("콜라") ||
        components.includes("팝콘") || components.includes("콜라")
    );

    const countInSameCategory = products.filter(p => {
        const cat = (
            p.name.includes("팝콘") || p.name.includes("콜라") ||
            p.components.includes("팝콘") || p.components.includes("콜라")
        );
        return cat === isPopcornCategory;
    }).length;

    if (countInSameCategory >= 5) {
        event.preventDefault();
        alert("해당 카테고리에는 최대 5개까지만 등록할 수 있습니다.");
    }

    // ✅ 그 외는 기본 전송 허용됨
});

// ✅ 등록된 상품 목록 렌더링 (DB에서 불러온 데이터 기준)
function renderProducts() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = '';

    products.forEach((product, index) => {
        const row = document.createElement('tr');

        // 이미지 셀
        const imgCell = document.createElement('td');
        if (product.image_path) {
            const img = document.createElement('img');
            img.src = product.image_path.startsWith("/") ? product.image_path : "/" + product.image_path;
            img.style.maxWidth = '80px';
            img.style.maxHeight = '80px';
            imgCell.appendChild(img);
        }
        row.appendChild(imgCell);

        // 텍스트 셀들
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        row.appendChild(nameCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = product.price.toLocaleString();
        row.appendChild(priceCell);

        const compCell = document.createElement('td');
        compCell.textContent = product.components;
        row.appendChild(compCell);

        const limitCell = document.createElement('td');
        limitCell.textContent = product.purchase_limit;
        row.appendChild(limitCell);

        const validCell = document.createElement('td');
        validCell.textContent = product.validity;
        row.appendChild(validCell);

        // 액션 버튼
        const actionCell = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = "수정";
        editBtn.className = "edit-btn";
        editBtn.dataset.index = index;

        const delBtn = document.createElement('button');
        delBtn.textContent = "삭제";
        delBtn.className = "delete-btn";
        delBtn.dataset.index = index;

        actionCell.appendChild(editBtn);
        actionCell.appendChild(delBtn);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}


// ✅ 삭제 및 수정 버튼 처리
document.getElementById('productTable').addEventListener('click', function (event) {
    const target = event.target;
    const index = target.getAttribute('data-index');

    if (target.classList.contains('delete-btn')) {
        if (confirm('상품을 삭제하시겠습니까?')) {
            const product = products[index];
            const formData = new FormData();
            formData.append("id", product.id);

            fetch("../php/store-delete.php", {
                method: "POST",
                body: formData
            })
            .then(res => res.text())
            .then(result => {
                if (result.includes("삭제 완료")) {
                    products.splice(index, 1);
                    renderProducts();
                } else {
                    alert("DB 삭제 실패: " + result);
                }
            })
            .catch(err => {
                console.error("삭제 요청 실패:", err);
                alert("서버 오류로 삭제에 실패했습니다.");
            });
        }
    }

    if (target.classList.contains('edit-btn')) {
        const product = products[index];
        document.getElementById('product-name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('components').value = product.components;
        document.getElementById('purchase-limit').value = product.purchase_limit;
        document.getElementById('validity').value = product.validity;

        if (product.image_path) {
            const preview = document.getElementById('image-preview');
            preview.src = "/" + product.image_path;
            preview.style.display = 'block';
        }

        editIndex = index;
    }
});

// ✅ 새로고침 시 DB에서 상품 목록 불러오기
function loadProductsFromDB() {
    fetch("../php/store-fetch.php")
        .then(res => res.json())
        .then(data => {
            products = data;
            renderProducts();
        })
        .catch(err => {
            console.error("상품 불러오기 실패:", err);
        });
}

document.addEventListener("DOMContentLoaded", loadProductsFromDB);
