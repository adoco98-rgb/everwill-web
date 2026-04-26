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

- [x] 자필유언장 업로드 및 영상 유언장 업로드 섹션에 추가 인증 설명 추가 (ServicesSection + Step8Addons, 11개 언어)
- [x] FAQ 섹션에 영상 유언장 vs 자필 유언장 법적 근거 비교표 추가 (ReviewsSection, 11개 언어, 각국 법률 조항 포함)
- [x] 비교표 법률 조항 셀에 클릭 드롭다운 상세 설명 추가 (11개 언어 각국 조항 전문)
- [x] FAQ 비교표에 '유언의 성립 요건' 행 추가 (11개 언어)
- [x] FAQ 비교표에 '보관 방법' 행 추가 (11개 언어, 청록색 강조)
- [x] 비교표 드롭다운 패널에 각국 법령 원문 사이트 외부 링크 추가 (11개 언어 영상/자필 각 1개 링크, ExternalLink 아이콘 + 새 탭 열기)
- [x] 드롭다운 링크 옥에 각국 법령 최종 개정일 배지 표시 (11개 언어, 보라색/황금색 인라인 배지)

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

## 외부/내부 사업기획서 분리
- [x] /investor 외부 공개용 - 민감 정보 제거, 타임라인 섹션 완성 (zh/de/es/ar 번역 추가)
- [x] /799805 내부 기밀 사업기획서 신규 페이지 구축
- [x] /799805 비밀번호 보호 게이트 (접근 코드 799805)
- [x] /799805 세부 투자처/단가/파트너사 정보 섹션 (아코디언)
- [x] /799805 마케팅 전략 세부 (채널별 CAC/LTV, KPI 목표)
- [x] /799805 재무 상세 모델 (월별 현금흐름, BEP 분석)
- [x] /799805 리스크 분석 및 대응 전략
- [x] App.tsx에 /799805 라우트 등록

## 유언 작성 페이월 전환 설계
- [x] /will/create 10단계 마법사 페이지 구현 (1~8단계 무료, 9단계부터 결제 게이트)
- [x] 8단계 완료 후 워터마크 미리보기 표시
- [x] 9단계 결제 게이트 - 전자인증 ₩49,000 결제 유도 모달
- [x] 72시간 임시저장 기능 (localStorage 임시 저장)
- [ ] 미완성 유언장 알림 이메일 발송 (가입자 대상)
- [x] 홈페이지 가격 섹션에 페이월 구조 안내 반영

## 추천인 시스템
- [ ] DB 스키마: user 테이블에 referralCode, referredBy 필드 추가
- [ ] DB 스키마: pointHistory 테이블 생성 (userId, type, amount, description, createdAt)
- [ ] tRPC: 추천인 코드 검증 프로시저 (validateReferralCode)
- [ ] tRPC: 회원가입 시 추천인 포인트 5,000점 자동 적립 로직
- [ ] tRPC: 포인트 내역 조회 프로시저 (getPointHistory)
- [ ] tRPC: 총 포인트 잔액 조회 프로시저 (getPointBalance)
- [ ] 회원가입 UI: 추천인 회원번호 입력 필드 추가
- [ ] 마이페이지: 포인트 잔액 및 적립 내역 탭 구현
