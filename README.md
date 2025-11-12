# 방탈출 후기 웹사이트

React + Firebase를 사용한 개인 방탈출 후기 관리 웹사이트입니다.

## 주요 기능

- 방탈출 후기 목록 보기 (점수순 정렬)
- 지역별, 카페별, 장르별 필터링
- 개별 후기 상세 보기 (레이더 차트 포함)
- 새 후기 작성 및 수정
- 구글 로그인 인증 (작성/수정 시)
- 자동완성 드롭다운 (카페, 지역, 장르)

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
cd btc_review
npm install
```

### 2. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 새 프로젝트 생성
3. Authentication 설정:
   - Authentication > Sign-in method로 이동
   - Google 로그인 활성화
4. Firestore Database 생성:
   - Firestore Database로 이동
   - 데이터베이스 만들기 (테스트 모드로 시작)
5. 웹 앱 추가:
   - 프로젝트 설정 > 일반 > 내 앱
   - 웹 앱 추가 (</> 아이콘)
   - Firebase SDK 구성 정보 복사

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 만들고, Firebase 구성 정보를 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일을 열고 Firebase 콘솔에서 받은 정보로 업데이트:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_actual_auth_domain
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_actual_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

### 4. Firebase 설정 파일 업데이트

`src/firebase/config.js` 파일을 열고 환경 변수를 사용하도록 수정:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### 5. Firestore 보안 규칙 설정

Firebase Console > Firestore Database > 규칙에서 다음과 같이 설정:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 모든 사용자가 읽기 가능
    match /reviews/{document=**} {
      allow read: true;
      // 인증된 특정 사용자만 쓰기 가능 (본인의 Google UID로 변경)
      allow write: if request.auth != null && request.auth.uid == "YOUR_GOOGLE_UID";
    }
  }
}
```

**본인의 UID 찾는 방법:**

1. 로그인 후 브라우저 콘솔에서 `auth.currentUser.uid` 확인
2. 또는 Firebase Console > Authentication > Users에서 확인

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 배포

### Vercel에 배포하기 (추천)

1. [Vercel](https://vercel.com/) 가입 및 GitHub 연동
2. 프로젝트를 GitHub에 푸시
3. Vercel에서 "New Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정 (Settings > Environment Variables에서 `.env` 내용 추가)
6. Deploy 클릭

### Firebase Hosting에 배포하기

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 프로젝트 초기화
firebase init hosting

# 빌드
npm run build

# 배포
firebase deploy
```

## 프로젝트 구조

```
btc_review/
├── src/
│   ├── components/
│   │   ├── ReviewList.jsx      # 메인 리스트 페이지
│   │   ├── ReviewDetail.jsx    # 상세 페이지
│   │   ├── ReviewForm.jsx      # 작성/수정 폼
│   │   ├── RadarChart.jsx      # 레이더 차트
│   │   └── FilterBar.jsx       # 필터 바
│   ├── firebase/
│   │   └── config.js           # Firebase 설정
│   ├── hooks/
│   │   └── useAuth.js          # 인증 훅
│   ├── App.jsx                 # 메인 앱 컴포넌트
│   └── main.jsx                # 진입점
├── .env                        # 환경 변수 (git에 올리지 마세요!)
└── package.json
```

## 데이터 구조

Firestore `reviews` 컬렉션의 문서 구조:

```javascript
{
  themeName: string,          // 테마 이름
  cafe: string,              // 카페 이름
  region: string,            // 지역
  genres: string[],          // 장르 배열
  visitDate: string,         // 방문 날짜 (YYYY-MM-DD)
  participants: number,      // 참가 인원
  success: boolean,          // 탈출 성공 여부
  hintsUsed: number,         // 사용한 힌트 수
  timeRemaining: number,     // 남은 시간(분)
  scores: {
    fun: number,            // 재미 점수 (0-10)
    completion: number,     // 완성도 점수 (0-10)
    immersion: number,      // 몰입감 점수 (0-10)
    price: number,          // 가격 점수 (0-10)
    design: number          // 디자인 점수 (0-10)
  },
  review: string,           // 후기 내용
  totalScore: number,       // 평균 점수
  createdAt: string,        // 생성 날짜
  updatedAt: string         // 수정 날짜
}
```

## 기술 스택

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Backend**: Firebase
  - Authentication (Google OAuth)
  - Firestore Database
- **Deployment**: Vercel / Firebase Hosting

## 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- Firebase 보안 규칙에서 본인의 UID만 쓰기 권한을 주세요
- 무료 플랜 사용 시 Firestore 읽기/쓰기 제한에 주의하세요

## 라이선스

MIT
