# SARAM 프로젝트 TODO

## 완료된 항목
- [x] 랜딩 페이지 전체 섹션 (Hero, Trust, Services, Badge, Pricing, Global, Lawyers, Reviews, Footer)
- [x] Trust & Will 언급 전체 제거
- [x] 히어로 이미지 전체화면 + 중앙 CTA
- [x] 보관 수수료 정책 (1년 무료, 2년차~ ₩9,900, 영구보관 ₩199,000)
- [x] 영상유언/자필유언 선택 UI
- [x] 유언장 작성 페이지 (/write) - AI 모드 + 직접 작성 모드
- [x] 서명 단계 (PASS/카카오/네이버/공동인증서 4종)
- [x] Stripe 글로벌 결제 연동 (/payment)
- [x] 결제 성공/취소 페이지
- [x] 7개 언어 번역 시스템 (ko/en/ja/zh/de/es/ar) - i18n 완전 구현
- [x] 아랍어 RTL 지원 (dir=rtl 자동 설정, Cairo/Tajawal 폰트)
- [x] 언어 전환 드롭다운 (Navbar, 국기 아이콘)
- [x] 모든 홈페이지 섹션 번역 적용 (Hero~Footer)

- [x] Step4 부동산 자산 - % 또는 금액 직접 입력 배분 토글 UI
- [x] Step5 금융 자산 - % 또는 금액 직접 입력 배분 토글 UI
- [x] willTypes.ts - shareAmount, distributionMode 필드 추가
- [x] 이메일 OTP 인증 로그인/회원가입 (Resend 연동)
- [x] 신규 가입자 프로필 입력 (이름/전화번호/생년월일/국가)
- [x] 환영 모달 (5단계 슬라이드)
- [x] 대시보드 홈 (자산/상속자 현황 카드)

## 진행 중
- [ ] DB 스키마 설계 (users, payments 테이블)
- [ ] 회원가입/로그인 백엔드 API (이메일+비밀번호, 소셜 로그인)
- [ ] 회원가입 페이지 (/signup)
- [ ] 로그인 페이지 (/login)
- [ ] 사용자 대시보드 (/dashboard)
- [ ] 결제 내역 페이지 (/dashboard/payments)
- [ ] Stripe Webhook 결제-계정 연결 로직
- [ ] Navbar 로그인 상태 반영

## 예정
- [ ] /investor 투자유치 랜딩페이지 - 7개국어 지원, 네비게이션 미노출
- [ ] 투자유치 페이지 섹션: 히어로, 시장 기회, 차별화, 수익 모델, 로드맵, 팀, CTA
- [ ] App.tsx에 /investor 라우트 등록 (Navbar/Footer 제외)
- [ ] 알리고 SMS OTP 연동
- [ ] Badge 주문 페이지 (/badge)
- [ ] 유언장 저장/불러오기 (Supabase 연동)
- [ ] SEO 최적화
