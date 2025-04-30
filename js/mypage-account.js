// 비밀번호 일치 여부 확인
function checkPasswordMatch() {
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const message = document.getElementById("password-match-message");
    const successMessage = document.getElementById("password-match-success");
  
    if (newPassword !== confirmPassword) {
      message.style.display = "block";
      successMessage.style.display = "none";
    } else {
      message.style.display = "none";
      successMessage.style.display = "block";
    }
  }
  
  // 변경 입력창 토글
  function toggleChange(type) {
    const box = document.getElementById(type === "id" ? "id-change-container" : "pw-change-container");
    if (box) box.style.display = box.style.display === "block" ? "none" : "block";
  }
  
  // 비밀번호 보기 토글
  function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const isPassword = input.type === "password";
  
    input.type = isPassword ? "text" : "password";
    icon.classList.toggle("fa-eye", isPassword);
    icon.classList.toggle("fa-eye-slash", !isPassword);
  }
  
  // 변경 확인 (아이디 또는 비밀번호)
  function confirmChange(type) {
    let data = {};
  
    if (type === "id") {
      const newId = document.getElementById("new-id").value.trim();
      if (!newId) return alert("아이디를 입력해주세요.");
      if (!/^[a-zA-Z0-9_]{4,20}$/.test(newId)) return alert("아이디는 영문자, 숫자, 밑줄(_)만 사용하며 4~20자여야 합니다.");
      data = { type: "id", newId };
    } else if (type === "password") {
      const newPassword = document.getElementById("new-password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();
      if (!newPassword || !confirmPassword) return alert("비밀번호를 모두 입력해주세요.");
      if (newPassword !== confirmPassword) return alert("비밀번호가 일치하지 않습니다.");
      if (!/^.{8,30}$/.test(newPassword)) return alert("비밀번호는 8자 이상 30자 이하로 설정해주세요.");
      data = { type: "password", newPassword };
    }
  
    fetch("/php/update-account.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data),
      credentials: "include"
    })
      .then(res => res.json())
      .then(response => {
        if (response.message) {
          alert(response.message);
          if (type === "id") {
            document.getElementById("user-id").textContent = data.newId;
            document.getElementById("new-id").value = "";
            document.getElementById("id-change-container").style.display = "none";
          } else if (type === "password") {
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-password").value = "";
            document.getElementById("pw-change-container").style.display = "none";
            document.getElementById("password-match-message").style.display = "none";
            document.getElementById("password-match-success").style.display = "none";
          }
        } else if (response.error) {
          alert(response.error);
        }
      })
      .catch(() => alert("서버 통신 중 오류가 발생했습니다."));
  }
  
  // 사용자 정보 불러오기
  function loadUserInfo() {
    fetch('/php/get-user-info.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const userIdSpan = document.getElementById("user-id");
        userIdSpan.textContent = data.username || "아이디 불러오기 실패";
      })
      .catch(err => {
        console.error("❌ 사용자 정보 로딩 오류:", err);
        document.getElementById("user-id").textContent = "아이디 불러오기 실패";
      });
  }
  
  // 페이지 로드 시 실행
  document.addEventListener("DOMContentLoaded", loadUserInfo);
  