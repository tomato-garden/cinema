document.addEventListener('DOMContentLoaded', function () {
    const movieId = new URLSearchParams(window.location.search).get('movie_id');
    const interestButton = document.querySelector('.interest-button');
    const interestCount = document.getElementById('interest-count');
    const submitBtn = document.getElementById('submitReview');
    const input = document.getElementById('reviewInput');
    const list = document.getElementById('reviewList');
    const reviewButton = document.querySelector('.review-button');
    const reserveBtn = document.querySelector('.reserve-button');
    let currentUser = { id: null };
    let interestState = false;

    if (!movieId) {
        alert("영화 정보가 없습니다.");
        return;
    }

    // 상세 정보 로딩
    fetch(`/php/get_movie_detail.php?movie_id=${movieId}`)
        .then(res => {
            if (!res.ok) throw new Error("서버 응답 오류");
            return res.json();
        })
        .then(movie => {
            if (!movie || movie.error) throw new Error("영화 정보 없음");

            document.querySelector('.movie-image img').src = movie.poster_path || '/img/default.jpg';
            document.querySelector('.overlay').textContent = movie.quote || '명대사가 등록되지 않았습니다.';
            document.querySelector('.movie-info h1').textContent = movie.title || '제목 없음';
            document.querySelectorAll('.movie-info .info p')[0].textContent = `감독: ${movie.director || '-'}`;
            document.querySelectorAll('.movie-info .info p')[1].textContent = `재생 시간: ${movie.duration || '-'}`;

            const detailP = document.createElement('p');
            detailP.textContent = movie.reviews || '상세정보가 등록되지 않았습니다.';
            document.getElementById('details').appendChild(detailP);

            interestCount.textContent = movie.likes || 0;
        })
        .catch(err => {
            console.error("상세정보 오류:", err);
            alert("영화 정보를 불러오지 못했습니다.");
        });

    // 로그인 상태 확인 및 리뷰 로딩
    fetch('/php/check_login.php')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                currentUser.id = data.userId;
                checkInterestStatus(movieId, currentUser.id);
            }
            loadReviews(movieId);
        })
        .catch(err => {
            console.error("로그인 체크 실패:", err);
            loadReviews(movieId);
        });

    // 예매 버튼
    if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {
            fetch('/php/check_login.php')
                .then(res => res.json())
                .then(data => {
                    if (data.loggedIn) {
                        window.location.href = `/html/booking.html?movie_id=${movieId}`;
                    } else {
                        alert("예매하려면 로그인이 필요합니다.");
                        window.location.href = '/html/login.html';
                    }
                })
                .catch(err => {
                    alert("로그인 확인 중 오류가 발생했습니다.");
                    console.error(err);
                });
        });        
    }

    // 리뷰 제출
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            fetch('/php/check_login.php')
                .then(res => res.json())
                .then(data => {
                    if (!data.loggedIn) {
                        alert("로그인이 필요합니다.");
                        window.location.href = '/html/login.html';
                        return;
                    }

                    const review = input.value.trim();
                    if (!review) return;

                    fetch('/php/submit_review.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ movieId, review })
                    })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                input.value = '';
                                list.innerHTML = '';
                                loadReviews(movieId);
                            } else {
                                alert("리뷰 등록 실패: " + (result.error || '서버 오류'));
                            }
                        })
                        .catch(err => alert("리뷰 등록 중 오류 발생: " + err.message));
                });
        });
    }

    // 리뷰 로딩
    function loadReviews(movieId) {
        fetch(`/php/get_reviews.php?movieId=${movieId}`)
            .then(res => res.json())
            .then(data => {
                list.innerHTML = '';
                const noReviewsElem = document.getElementById('noReviews');
                if (noReviewsElem) noReviewsElem.style.display = data.length === 0 ? 'block' : 'none';

                data.forEach(r => {
                    addReview({
                        id: r.id,
                        userId: r.user_id,
                        nickname: r.username,
                        review: r.content,
                        createdAt: r.created_at,
                        isMe: (r.user_id == currentUser.id)
                    });
                });
            })
            .catch(err => console.error("리뷰 불러오기 실패:", err));
    }

    // 리뷰 출력
    function addReview({ id, userId, nickname, review, createdAt, isMe }) {
        const item = document.createElement('div');
        item.className = 'review-item';
        item.dataset.reviewId = id;

        const avatar = document.createElement('div');
        avatar.className = isMe ? 'my-avatar' : 'other-avatar';
        avatar.textContent = isMe ? '나' : '너';

        const box = document.createElement('div');
        box.className = 'review-box';

        const meta = document.createElement('div');
        meta.className = 'review-meta';
        const time = new Date(createdAt).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
        meta.textContent = `${nickname} · ${time}`;

        const content = document.createElement('div');
        content.className = 'review-content';
        content.textContent = review;

        box.appendChild(meta);
        box.appendChild(content);

        if (isMe) {
            const controls = document.createElement('div');
            controls.className = 'review-controls';

            const editBtn = document.createElement('button');
            editBtn.textContent = '수정';
            editBtn.className = 'edit-button';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '삭제';
            deleteBtn.className = 'delete-button';

            controls.appendChild(editBtn);
            controls.appendChild(deleteBtn);
            box.appendChild(controls);

            editBtn.addEventListener('click', () => {
                const newText = prompt('리뷰 수정:', content.textContent);
                if (newText && newText.trim()) {
                    fetch('/php/update_review.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ reviewId: id, newReview: newText.trim() })
                    })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                content.textContent = newText.trim();
                                alert("수정 완료");
                            } else {
                                alert("수정 실패: " + (result.error || "서버 오류"));
                            }
                        })
                        .catch(err => alert("수정 오류: " + err.message));
                }
            });

            deleteBtn.addEventListener('click', () => {
                if (confirm("정말 삭제하시겠습니까?")) {
                    fetch('/php/delete_review.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ reviewId: id })
                    })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                item.remove();
                            } else {
                                alert("삭제 실패: " + (result.error || "서버 오류"));
                            }
                        });
                }
            });
        }

        item.appendChild(avatar);
        item.appendChild(box);
        list.appendChild(item);
    }

    // 관심 토글
    function checkInterestStatus(movieId, userId) {
        fetch(`/php/check_interest_status.php?movie_id=${movieId}&user_id=${userId}`)
            .then(res => res.json())
            .then(data => {
                interestState = !!data.isInterests;
                interestButton.classList.toggle('liked', interestState);
            })
            .catch(error => console.error("관심 상태 확인 실패:", error));
    }

    interestButton.addEventListener('click', () => {
        fetch('/php/check_login.php')
            .then(res => res.json())
            .then(data => {
                if (!data.loggedIn) {
                    alert("로그인이 필요합니다.");
                    window.location.href = '/html/login.html';
                    return;
                }

                const action = interestState ? 'down' : 'up';
                fetch('/php/update_like.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ movie_id: movieId, change: action })
                })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            interestCount.textContent = result.likes;
                            interestState = !interestState;
                            interestButton.classList.toggle('liked', interestState);
                        } else {
                            alert("관심 등록 실패: " + (result.error || "서버 오류"));
                        }
                    });
            });
    });

    // 리뷰 버튼 스크롤
    if (reviewButton) {
        reviewButton.addEventListener('click', () => {
            document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
