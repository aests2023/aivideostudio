/**
 * Firebase Configuration for AI 영상공방
 * 
 * [파이어베이스 연동 방법]
 * 1. 구글 파이어베이스 콘솔(https://console.firebase.google.com)로 이동하여 프로젝트를 생성합니다.
 * 2. '빌드 > Authentication' 메뉴에서 '이메일/비밀번호' 로그인 방식을 활성화합니다.
 * 3. 프로젝트 개요화면에서 웹 앱(</> 아이콘)을 추가 등록합니다.
 * 4. 발급받은 SDK 설정 객체(firebaseConfig) 내용으로 아래 플레이스홀더 값을 채워 넣으세요.
 */

const firebaseConfig = {
  apiKey: "AIzaSyDx7q8TJ3cOy8ffy1Vk8DG6KTXVQBsQglg",
  authDomain: "aicreateworkshop.firebaseapp.com",
  projectId: "aicreateworkshop",
  storageBucket: "aicreateworkshop.firebasestorage.app",
  messagingSenderId: "967635037083",
  appId: "1:967635037083:web:ca5eeb5aa86144dc304f3e",
  measurementId: "G-SK10HJYW4W"
};

// 파이어베이스가 아직 초기화되지 않은 경우 초기화 진행
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

const ADMIN_EMAILS = [
  'jgg2010@naver.com'// 유일한 관리자 계정 지정
];

// 관리자 권한 여부 체크 유틸리티
const isAdmin = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
