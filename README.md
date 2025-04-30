# 영화관 관리 시스템 with FFFF팀(장O호, 임O민, 배O민, 지O은)

![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 프로젝트 개요
이 프로젝트는 영화 예매, 상영 시간표 확인, 매점 상품 구매 등의 기능을 포함한 웹 기반 영화관 관리 시스템입니다. 사용자 친화적인 UI와 관리자 기능을 통해 효율적인 영화관 운영을 돕습니다.

## 주요 기능
- 회원 가입 및 로그인, 로그아웃
- 영화 목록 검색 및 상세 정보 조회
- 영화 예매 (상영 시간표 기반)
- 매점 상품 조회 및 장바구니 구매
- 공지사항
- 관심 영화 등록 및 좋아요 기능
- 관리자 기능 (영화 등록, 상영관 및 시간표 관리, 매점 상품 관리, 매출 통계)

## 기술 스택
- Frontend: HTML, CSS
- Backend: PHP
- Database: MySQL

## 프로젝트 구조
```
movie-theater/
│
├── css/                          # 모든 CSS 스타일 파일
│   ├── admin-*.css               # 관리자 페이지 스타일
│   ├── booking*.css              # 예매 단계별 페이지 스타일
│   ├── movie-*.css               # 영화 상세, 목록 관련
│   ├── mypage*.css               # 마이페이지 관련
│   └── 공통 스타일 (main.css 등)
│
├── html/                         # 프론트엔드 HTML 페이지
│   ├── admin-*                   # 관리자 페이지 (html 형태)
│   ├── booking*, login, menu 등 # 사용자 페이지
│   └── mypage, notices, register, search, etc.
│
├── img/                          # 이미지 리소스 폴더
│   ├── movie-poster/             # 영화 포스터 이미지
│   ├── store/                    # 매점 관련 이미지
│   └── 기타 광고/로고 이미지(ad, banner 등)
│
├── js/                           # 클라이언트측 JavaScript
│   ├── admin-*.js                # 관리자 기능 스크립트
│   ├── booking*.js               # 예매 과정 스크립트
│   ├── movie-*.js, mypage*.js    # 사용자 영역 스크립트
│   └── 공통 스크립트 (main.js 등)
│
├── php/                          # 서버측 PHP 백엔드 파일
│   ├── admin-*.php               # 관리자 기능 처리
│   ├── get_*.php                 # 비동기 요청 처리(GET API)
│   ├── save_*.php / insert_*.php# 데이터 저장/입력
│   ├── check_*.php               # 로그인/인증/중복확인
│   └── config.php, db.php        # 공통 설정 및 DB 연결
│
└── README.md                     # 프로젝트 설명 문서

```

## ⚙️ 설치 및 실행 방법
1. 웹 서버(Apache 등)와 PHP 설치
2. MySQL 설치 및 `movie_theater` 데이터베이스 생성
3. 프로젝트 파일을 웹 서버 루트 디렉토리에 복사
4. `php/db.php`에서 DB 접속 정보 수정
5. 브라우저에서 `http://localhost/movie-theater/index.html` 접속

## 👤 사용자 역할
- **일반 사용자**: 영화 목록 확인, 예매, 매점 구매, 관심 등록
- **관리자**: 영화, 상영관, 상품 관리 및 매출 통계 확인

## 🐞 이슈 제보
버그를 발견했거나 기능 개선 제안이 있으시다면  
[이슈 페이지](workship1211@gmail.com)에 제보해주세요.

## 📄 라이센스
이 프로젝트는 MIT 라이센스를 따릅니다.  
자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📬 연락처
질문이나 제안이 있으시다면 아래 이메일로 연락해주세요.  
📧 workship1211@gmail.com
