📌 micro-sns  
React + Node.js + MySQL 기반의 간단한 SNS 풀스택 프로젝트입니다.
회원가입부터 게시글, 댓글, 좋아요, 팔로우, 검색까지 SNS의 핵심 기능을 모두 구현했습니다.

---

🚀 주요 기능 (Full List)  

🔐 사용자(User) 기능  
회원가입  
로그인 / 로그아웃  
사용자 프로필 보기 (이름, 이메일, 바이오 표시)  
비밀번호 변경 기능  
사용자 검색 기능 (이름 기반 LIKE 검색)  

👤 사용자 프로필 관련 기능  
해당 사용자가 작성한 게시글 보기
해당 사용자가 좋아요한 게시글 목록 보기

📝 게시글(Post) 기능  
게시글 작성 (텍스트 + 이미지 업로드)
게시글 수정
게시글 삭제
게시글 상세 페이지
전체 게시글 조회
이미지가 있을 경우 업로드된 이미지 렌더링

❤️ 좋아요(Like) 기능  
좋아요 / 좋아요 취소
실시간 좋아요 개수 업데이트
사용자가 좋아요한 게시글 목록 조회

💬 댓글(Comment) 기능  
댓글 작성
댓글 삭제
게시글별 댓글 목록 조회

👥 팔로우(Follow) 기능  
팔로우 / 언팔로우
팔로잉 / 팔로워 목록 조회
팔로우 기반 피드 (follow한 사용자들의 게시글만 보기)

🔎 검색 기능  
사용자 실시간 검색 (입력될 때마다 바로 검색)
검색 후 사용자 클릭 → 프로필 페이지 이동

🔥 정렬 탭 기능  
최신순: 가장 최근 게시글부터 정렬
좋아요순: 좋아요 개수 기준 정렬
트렌딩(Trending): 좋아요 많은 순으로 정렬 (일종의 인기 게시물)

---

🛠 기술 스택
Frontend
React (Vite)
TypeScript
Tailwind CSS
React Router DOM
Axios

Backend
Node.js + Express
MySQL
Multer (이미지 업로드)
RESTful API 설계

📦 환경 변수 설정 (.env)
Backend (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_DATABASE=micro_sns

Frontend (.env)
VITE_API_URL=http://localhost:3001

---

📂 데이터베이스 ERD
<img width="2173" height="1638" alt="image" src="https://github.com/user-attachments/assets/9b0d80d3-33ec-4488-9b5d-9de76ebd59c6" />

Database Schema Overview
| 테이블         | 설명                     |
| ----------- | ---------------------- |
| **User**    | 사용자 정보 저장              |
| **Post**    | 게시글 저장 (텍스트 + 이미지 URL) |
| **Comment** | 게시글에 달린 댓글             |
| **Likes**   | 게시글 좋아요                |
| **Follow**  | 사용자 간 팔로우 관계           |

User Table
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Post Table
CREATE TABLE Post (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

Comment Table
CREATE TABLE Comment (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);


Likes Table
CREATE TABLE Likes (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE
);

Follow Table
CREATE TABLE Follow (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES User(user_id) ON DELETE CASCADE
);

🛠 주요 SQL 쿼리

전체 사용자 조회
SELECT * FROM User;

전체 게시글 조회
SELECT * FROM Post ORDER BY created_at DESC;

게시글+작성자 정보 JOIN
SELECT 
  p.post_id, p.content, p.image_url, p.created_at,
  u.user_id AS author_id, u.name AS author
FROM Post p
JOIN User u ON p.user_id = u.user_id
ORDER BY p.created_at DESC;

특정 사용자의 게시글 목록
SELECT * 
FROM Post 
WHERE user_id = 5 
ORDER BY created_at DESC;

특정 게시글의 댓글 조회
SELECT 
  c.comment_id, c.content, c.created_at,
  u.name AS author
FROM Comment c
JOIN User u ON c.user_id = u.user_id
WHERE c.post_id = 3;

좋아요 개수 조회
SELECT COUNT(*) AS like_count 
FROM Likes 
WHERE post_id = 3;

트렌딩(좋아요 많은 순)
SELECT 
  p.post_id, p.content, u.name AS author,
  COUNT(l.user_id) AS like_count
FROM Post p
LEFT JOIN Likes l ON p.post_id = l.post_id
JOIN User u ON p.user_id = u.user_id
GROUP BY p.post_id
ORDER BY like_count DESC;

사용자 검색
SELECT user_id, name, email
FROM User
WHERE name LIKE '%가천%';

팔로우한 사용자들의 게시글 보기
SELECT 
  p.post_id, p.content, u.name AS author
FROM Post p
JOIN User u ON p.user_id = u.user_id
WHERE p.user_id IN (
  SELECT following_id FROM Follow WHERE follower_id = 7
)
ORDER BY p.created_at DESC;

---
기능별 백엔드 API 구조 (DB 기반)
| 기능      | 관련 테이블     | API 경로                             |
| ------- | ---------- | ---------------------------------- |
| 회원가입    | User       | `POST /api/users/register`         |
| 로그인     | User       | `POST /api/users/login`            |
| 비밀번호 변경 | User       | `POST /api/users/change-password`  |
| 게시글 작성  | Post       | `POST /api/posts`                  |
| 게시글 조회  | Post, User | `GET /api/posts`                   |
| 게시글 상세  | Post       | `GET /api/posts/:id`               |
| 게시글 삭제  | Post       | `DELETE /api/posts/:id`            |
| 좋아요 추가  | Likes      | `POST /api/likes`                  |
| 좋아요 취소  | Likes      | `DELETE /api/likes`                |
| 댓글 작성   | Comment    | `POST /api/comments`               |
| 댓글 조회   | Comment    | `GET /api/comments/by-post/:id`    |
| 팔로우 추가  | Follow     | `POST /api/follows`                |
| 사용자 검색  | User       | `GET /api/users/search?keyword=xx` |
