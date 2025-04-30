const MAX_PREVIEW_LENGTH = 60;
const ITEMS_PER_PAGE = 5;
const noticeList = document.getElementById("noticeList");
const pagination = document.getElementById("pagination");

let notices = [];
let currentPage = 1;

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (match) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[match]));
}

async function fetchNotices() {
    try {
        const res = await fetch("/php/notices.php");
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
        notices = await res.json();
        renderNotices(currentPage);
    } catch (error) {
        console.error("공지사항 불러오기 실패:", error);
        alert("공지사항을 불러오는 데 실패했습니다.");
    }
}

function renderNotices(page) {
    noticeList.innerHTML = "";
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginated = notices.slice(start, end);

    paginated.forEach((notice, index) => {
        const globalIndex = start + index;
        const div = document.createElement("div");
        div.className = "notice";

        const contentId = `content-${globalIndex}`;

        const title = escapeHTML(notice.title);
        const author = escapeHTML(notice.author);
        const lines = notice.content.split('\n');
        const trimmedLines = lines.map(line => escapeHTML(line.trimStart()));
        const fullContentHTML = trimmedLines.join('<br>');
        const previewText = trimmedLines.join(' ').trim();

        const preview = previewText.length > MAX_PREVIEW_LENGTH
            ? previewText.slice(0, MAX_PREVIEW_LENGTH) + "..."
            : previewText;

        const hasLongContent = previewText.length > MAX_PREVIEW_LENGTH;

        div.innerHTML = `
            <div class="notice-title">${title}</div>
            <div class="notice-meta"> 작성일 ${new Date(notice.created_at).toLocaleDateString("ko-KR")} / 작성자: ${author}</div>
            <div class="notice-content-preview">${preview}</div>
            ${hasLongContent
                ? `<button class="read-more-text" onclick="toggleContent('${contentId}', this)">자세히 보기</button>`
                : ""}
            <div id="${contentId}" class="notice-content-full" style="display: none;">
                <div>${fullContentHTML}</div>
                ${hasLongContent
                    ? `<div class="collapse-btn-wrapper">
                           <button class="read-more-text collapse-btn" onclick="toggleContent('${contentId}', this)">접기</button>
                       </div>`
                    : ""}
            </div>
        `;

        noticeList.appendChild(div);
    });

    renderPagination();
}

function toggleContent(id, btn) {
    const content = document.getElementById(id);
    const noticeBox = btn.closest(".notice");
    const preview = noticeBox.querySelector(".notice-content-preview");
    const readMoreBtn = noticeBox.querySelector(".read-more-text:not(.collapse-btn)");
    const isVisible = content.style.display === "block";

    if (isVisible) {
        content.style.display = "none";
        if (preview) preview.style.display = "block";
        if (readMoreBtn) readMoreBtn.style.display = "block";
    } else {
        content.style.display = "block";
        if (preview) preview.style.display = "none";
        if (btn.classList.contains("read-more-text") && !btn.classList.contains("collapse-btn")) {
            btn.style.display = "none";
        }
    }
}

function renderPagination() {
    pagination.innerHTML = "";
    const pageCount = Math.ceil(notices.length / ITEMS_PER_PAGE);

    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn" + (i === currentPage ? " active" : "");
        btn.innerText = i;
        btn.onclick = () => {
            currentPage = i;
            renderNotices(currentPage);
        };
        pagination.appendChild(btn);
    }
}

fetchNotices();
