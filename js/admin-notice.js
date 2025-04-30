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
  

// ✅ admin-notice.js - PHP 경로 수정 반영

async function saveNotice() {
    const title = document.getElementById("titleInput").value.trim();
    const content = document.getElementById("contentInput").value.trim();
    const author = document.getElementById("authorInput").value.trim();

    if (!title || !content || !author) {
        alert("모든 항목을 입력해주세요.");
        return;
    }

    try {
        await fetch("/php/notices.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content, author })
        });

        document.getElementById("titleInput").value = "";
        document.getElementById("contentInput").value = "";
        document.getElementById("authorInput").value = "";

        displayNotices();
    } catch (error) {
        alert("공지사항 등록에 실패했습니다.");
        console.error(error);
    }
}

async function deleteNotice(id) {
    try {
        await fetch(`/php/notices.php?id=${id}`, {
            method: "DELETE"
        });
        displayNotices();
    } catch (error) {
        console.error("삭제 실패:", error);
    }
}

async function editNotice(id) {
    try {
        const res = await fetch(`/php/notices.php?id=${id}`);
        const notice = await res.json();

        const newTitle = prompt("새 제목을 입력하세요:", notice.title);
        const newContent = prompt("새 내용을 입력하세요:", notice.content);
        const newAuthor = prompt("새 작성자명을 입력하세요:", notice.author);

        if (newTitle && newContent && newAuthor) {
            await fetch(`/php/notices.php?id=${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    content: newContent.trim(),
                    author: newAuthor.trim()
                })
            });
            displayNotices();
        }
    } catch (error) {
        console.error("수정 실패:", error);
    }
}

async function displayNotices() {
    const noticeList = document.getElementById("noticeList");

    try {
        const res = await fetch("/php/notices.php");
        const notices = await res.json();

        if (notices.length === 0) {
            noticeList.innerHTML = "<p style='text-align: center;'>등록된 공지사항이 없습니다.</p>";
            return;
        }

        noticeList.innerHTML = notices.map(notice => `
            <div class="notice-item">
                <strong>${notice.title}</strong>
                <div class="meta">작성자: ${notice.author} | 날짜: ${new Date(notice.created_at).toLocaleDateString("ko-KR")}</div>
                <p>${notice.content}</p>
                <div class="button-group">
                    <button class="edit-btn" onclick="editNotice(${notice.id})">수정</button>
                    <button class="delete-btn" onclick="deleteNotice(${notice.id})">삭제</button>
                </div>
            </div>
        `).join("");
    } catch (error) {
        console.error("불러오기 실패:", error);
    }
}

document.addEventListener("DOMContentLoaded", displayNotices);
// ✅ 추가로 SPA에서도 실행되도록 다음 코드 추가
if (document.readyState === "complete" || document.readyState === "interactive") {
    displayNotices();
}