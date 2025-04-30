document.getElementById("loginBtn").addEventListener("click", function (e) {
  e.preventDefault(); // ✅ 새로고침 방지

  const id = document.querySelector(".ID").value.trim();
  const pw = document.querySelector(".PW").value.trim();

  if (!id || !pw) {
    alert("아이디와 비밀번호를 모두 입력해 주세요.");
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/php/login.php", true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  // ✅ 로그인 세션 쿠키 공유 필수 설정
  xhr.withCredentials = true;

  xhr.onload = function () {
    if (xhr.status === 200) {
      const response = xhr.responseText.trim();
      if (response === "success") {
        alert("정상적으로 로그인 되었습니다.");

        // ✅ 사용자 이름만 저장 (user_id는 서버에서 판단해야 함)
        localStorage.setItem("user", JSON.stringify({ username: id }));

        document.querySelector("form").reset();
        window.location.href = "/html/main.html"; // 메인 페이지로 이동
      } else {
        alert(response); // "비밀번호가 틀립니다" 등 메시지 출력
      }
    } else {
      alert("서버 오류가 발생했습니다.");
    }
  };

  // ✅ 서버로 보낼 로그인 정보
  const params = "username=" + encodeURIComponent(id) +
                 "&password=" + encodeURIComponent(pw);

  xhr.send(params);
});
