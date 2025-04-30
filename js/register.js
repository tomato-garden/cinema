// 아이디 중복확인
function checkUsername() {
    const username = document.getElementById("username").value.trim();
    const resultText = document.getElementById("check-result");

    if (!username) {
        resultText.style.color = "red";
        resultText.textContent = "아이디를 입력해주세요.";
        return;
    }

    // AJAX 요청
    fetch('/php/check_username.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username })
    })
    .then(res => res.json())
    .then(data => {
        resultText.textContent = data.message;
        resultText.style.color = data.available ? "green" : "red";
    })
    .catch(err => {
        resultText.style.color = "red";
        resultText.textContent = "서버 오류로 중복 확인을 할 수 없습니다.";
        console.error("중복확인 오류:", err);
    });
}


// 비밀번호 확인
function checkPasswordMatch() {
    const password1 = document.getElementById("p1").value;
    const password2 = document.getElementById("p2").value;
    const resultText = document.getElementById("pw-check-result");

    if (password1 !== password2) {
        resultText.style.color = "red";
        resultText.textContent = "비밀번호가 일치하지 않습니다.";
        return false;
    }

    if (password1.length < 8) {
        resultText.style.color = "red";
        resultText.textContent = "비밀번호는 8글자 이상이어야 합니다.";
        return false;
    }

    resultText.style.color = "green";
    resultText.textContent = "비밀번호가 일치합니다.";
    return true;
}

// 전화번호 확인
function checkPhoneNumber() {
    const phone = document.getElementById("phone").value.replace(/-/g, "");
    const resultText = document.getElementById("phone-check-result");

    const phoneRegex = /^010\d{8}$/;

    if (!phoneRegex.test(phone)) {
        resultText.style.color = "red";
        resultText.textContent = "전화번호는 010으로 시작해야 합니다.";
        return false;
    } else {
        resultText.textContent = "";
        return true;
    }
}

// 전화번호 자동 하이픈 입력
function formatPhoneNumber(input) {
    let numbers = input.replace(/\D/g, ""); // 숫자만 남기기
    let formatted = "";

    if (numbers.length < 4) {
        formatted = numbers;
    } else if (numbers.length < 8) {
        formatted = numbers.slice(0, 3) + "-" + numbers.slice(3);
    } else {
        formatted = numbers.slice(0, 3) + "-" + numbers.slice(3, 7) + "-" + numbers.slice(7, 11);
    }

    return formatted;
}

// 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
    const checkBtn = document.querySelector(".id-check-container button");
    if (checkBtn) {
        checkBtn.addEventListener("click", checkUsername);
    }

    const signupForm = document.querySelector(".signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            const pwValid = checkPasswordMatch();
            const phoneValid = checkPhoneNumber();

            if (!pwValid || !phoneValid) {
                e.preventDefault();
            }
        });

        // 비밀번호 실시간 확인
        document.getElementById("p2").addEventListener("input", checkPasswordMatch);
    }

    // 전화번호 자동 하이픈
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            const formatted = formatPhoneNumber(e.target.value);
            e.target.value = formatted;
        });
    }
});
