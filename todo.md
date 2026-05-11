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
- [x] 드롭다운 링크에 각국 공식 출체 기관명 표시 (11개 언어, 인디고 둥근 배지, 법제체/의회 등 공식 기관 명시)
- [x] Navbar 언어 선택기 코드 레이블 제거 — 국기 이미지만 표시
- [x] GlobalSection 제목 '7개 언어 지원' → '11개 언어 지원'으로 수정 (11개 언어 번역 파일 포함)
- [x] GlobalSection 언어 카드 국기 이모지 → flagcdn.com 실제 국기 이미지(PNG)로 교체

- [x] 준비 중 첫 화면(ComingSoon) 컴포넌트 제작 — 노인 그룹 이미지 + EverWill 로고 + 홈 버튼만 표시
- [x] 홈 버튼 클릭 시 비밀번호(2026) 입력 모달 표시, 정답 시 전체 사이트 진입 (sessionStorage 세션 유지)
- [x] App.tsx에서 기본 경로(/) → ComingSoon 페이지로 변경, /home → 비밀번호 인증 후 기존 홈

## 유서 쓰기 기능
- [x] DB: farewell_letters, farewell_recipients, farewell_attachments 테이블 스키마 추가
- [x] tRPC: 유서 CRUD 프로시저 (create/update/list/get/delete)
- [x] 유서 작성 페이지 (/letter/write) — 5단계 가이드 질문 위자드
- [x] 유서 수신자 지정 컴포넌트 (개별 지정 / 전체 공개)
- [x] 파일 및 사진 업로드 기능 (S3 저장)
- [x] 유서 대시보드 (/letter) — 작성한 유서 목록 + 상태 표시
- [x] 열람/프린트 결제 모달 (₩6,900 스트라이프)
- [x] 우편 발송 신청 모달 (₩19,900 스트라이프)
- [x] Navbar에 '나의 유서' 메뉴 추가
- [x] 유서 작성 가격 안내 (작성 ₩9,900 / 수정 ₩4,900)
- [x] 유서 작성 5단계 가이드 질문을 친근하고 구체적인 표현으로 개선 (힌트·예시 문구 포함, 이모지 추가)
- [x] EverWill 로고 배경 제거(누끼) 후 투명 PNG 생성 (AI 재생성 방법 사용)
- [x] Navbar·ComingSoon에 새 로고 교체

## 상속 서비스 가격 구조 명확화
- [x] HeirServiceSection.tsx LANG_TEXT에 includedItems, lawyerTitle, lawyerDesc, lawyerFee1/Val, lawyerFee2/Val, lawyerNote, lawyerCta 필드 추가 (11개 언어)
- [x] 기본 가입비 포함 내용 박스 UI 추가 (₩199,000 포함 항목 체크리스트)
- [x] 변호사 선임 서비스 섹션 UI 추가 (착수금 ₩990,000 + 성공 보수 1% + 선임하기 버튼)

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

## 추천/공유 시스템 (SNS 공유 포함)
- [ ] DB: referral_codes 테이블 (코드, 유저ID, 사용횟수, 리워드)
- [x] API: 추천 코드 생성/조회/검증 tRPC 프로시저 (기존 구현 활용)
- [x] 홈페이지: ReferralSection 컴포넌트 (추천 혜택 소개 + 공유 버튼)
- [x] SNS 공유: 링크복사·카카오톡·X(트위터)·Facebook·LinkedIn·WhatsApp·LINE
- [ ] 마이페이지: 내 추천 코드 + 공유 버튼 + 추천 현황
- [ ] 가입 시 추천 코드 입력 필드 및 리워드 적용

## 1:1 문의 시스템
- [x] DB: inquiries 테이블 (유저ID, 이름, 이메일, 문의유형, 제목, 내용, 상태, 답변, 답변일시)
- [x] API: 문의 접수(create), 내 문의 목록(list), 관리자 답변(reply) tRPC 프로시저
- [x] 홈페이지: ContactSection 컴포넌트 (문의 폼 - 이름/이메일/유형/제목/내용)
- [x] 마이페이지: 내 문의 내역 탭 (/dashboard/inquiries - 접수일, 유형, 상태, 답변 확인, 만족도 표시)
- [x] 관리자: 문의 목록 + 답변 처리 UI (/799805 내부 페이지 문의 관리 섹션 - 필터/펼침/답변 입력/발송)
- [x] 알림: 문의 접수 시 관리자에게 알림 발송

## 문의 접수 확인 이메일
- [x] 문의 접수 시 사용자에게 접수 확인 이메일 자동 발송 (Resend API)

## 문의 답변 만족도 조사
- [x] DB: inquiries 테이블에 satisfaction(1~5), satisfactionAt 컨럼 추가
- [x] API: 만족도 평가 저장 엔드포인트 (토큰 기반, 비로그인 가능)
- [x] 답변 이메일: 이모지 1~5 클릭 링크 추가 (만족도 조사 스타일)
- [x] 평가 완료 페이지: /feedback?id=xxx&token=xxx&score=N 처리 페이지

## 우수 답변 선정 및 관리자 페이지 표시
- [x] 우수 답변 선정 기준: 만족도 4~5점 + 답변 완료된 문의
- [x] API: 관리자용 우수 답변 목록 조회 (만족도 점수 내림차순)
- [x] API: 관리자가 수동으로 우수 답변 핀(고정) 설정/해제
- [x] 관리자 페이지: 우수 답변 섹션 (점수별 통계 + 우수 답변 카드 목록)
- [x] 관리자 페이지: 만족도 통계 차트 (평균 점수, 분포)

## 회원가입 국가별 양식 구현
- [x] DB: users 테이블에 국가별 추가 필드 추가 (furigana, zipCode, address, stateProvince, nationality, religion, occupation, assetScale, agreeTerms, agreePrivacy, agreeMarketing, agreeGdpr)
- [x] 국가 선택에 따라 필드 동적 변경 (17개 국가 지원)
- [x] 한국: 우편번호, 주소, 직업, 자산규모
- [x] 일본: 후리가나(フリガナ), 우편번호, 주소, 직업
- [x] 중국/홍콩/대만: 주소, 직업, 국적(홍콩)
- [x] 미국: 주(State), 우편번호, 주소, 직업, 자산규모
- [x] 독일/스페인/프랑스/영국: 우편번호, 주소, GDPR 동의
- [x] 아랍(사우디/UAE): 국적, 종교(이슬람 여부 + 샤리아 상속법 안내), 주소, 직업, 자산규모(UAE)
- [x] 러시아/인도/브라질: 주(State), 우편번호, 주소, 직업
- [x] 공통: 추천인 코드 입력 필드
- [x] 공통: 이용약관(필수), 개인정보처리방침(필수), GDPR(유럽 필수), 마케팅(선택) 체크박스
- [x] API: emailAuthRouter.updateProfile에 국가별 추가 필드 저장 지원

## 회원가입 이탈 추적 시스템
- [x] DB: signup_events 테이블 (sessionId, step, event, emailMasked, country, device, lang, durationSec, createdAt)
- [x] DB: pnpm db:push 실행 완료
- [x] API: signupTracking.recordEvent (public, UA 기반 기기 자동 감지, 이메일 자동 마스킹)
- [x] API: signupTracking.adminStats (admin, 단계별 진입/이탈/전환율 + 국가별/기기별 분포)
- [x] API: signupTracking.adminDropoffList (admin, 이탈 사용자 목록 + 페이지네이션)
- [x] 프론트엔드: useSignupTracking 훅 (sessionStorage UUID, 단계 체류시간 측정, 이벤트 전송)
- [x] LoginPage: step1 진입, OTP 전송 시 step1이탈+step2진입, OTP인증 시 step2이탈+step3진입, 프로필 완료 시 complete 이벤트 수집
- [x] 관리자 대시보드: /799805 내부 페이지에 '가입 퍼널' 섹션 추가 (사이드내비 메뉴 포함)
- [x] 퍼널 차트: 단계별 진입자 수 + 이탈률 시각화 (가로 막대 + 이탈률 표시)
- [x] 단계별 통계 카드: 진입수, 완료수, 전체 전환율 요약 3개 카드
- [x] 이탈 사용자 목록: 이탈 단계, 이메일(마스킹), 국가, 기기, 체류시간, 이탈 시각 테이블
- [x] 기간 필터: 오늘/7일/30일/전체 (상단 + 이탈목록 동기 필터)

## 회원가입 이탈 추적 보완
- [x] LoginPage: step1~step3 + complete 이벤트 수집 (현재 UI가 3단계이므로 step4/5는 해당 없음), ''나중에 입력'' 버튼에도 complete 추적 추가
- [x] useSignupTracking: beforeunload 핸들러를 trackUnload(ref 기반)로 교체, 최신 step/email/country 자동 반영
- [x] 가입 퍼널 대시보드: 단계별 카드 UI 추가 (단계명, 진입수, 이탈수, 이탈률 per-step 그리드)

## 로그인 개선: 이메일 발송 수정 + 휴대폰 OTP 추가
- [x] 이메일 OTP 발송 오류 원인 진단 및 수정 (Resend API 키/도메인 확인)
- [x] DB: phone_otps 테이블 (Twilio Verify 사용으로 DB 불필요)
- [x] SMS 발송 인프라 (Twilio Verify API 연동)
- [x] API: phoneAuth.sendOtp (휴대폰 번호 입력 → SMS 발송)
- [x] API: phoneAuth.verifyOtp (코드 검증 → 세션 발급)
- [x] LoginPage UI: 이메일/휴대폰 탭 전환 UI
- [x] LoginPage UI: 국가코드 선택 드롭다운 + 휴대폰 번호 입력
- [x] LoginPage UI: 휴대폰 OTP 6자리 입력 화면

## Twilio Verify SMS OTP (신규)
- [x] env.ts에 TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID 추가
- [x] server/_core/sms.ts 헬퍼 생성 (Twilio Verify sendVerification/checkVerification)
- [x] Twilio API 연결 vitest 테스트
- [x] server/routers/phoneAuthRouter.ts 생성 (sendOtp/verifyOtp/updateProfile)
- [x] server/routers.ts에 phoneAuthRouter 등록
- [x] LoginPage.tsx 이메일/휴대폰 탭 전환 UI
- [x] 국가코드 드롭다운 + 휴대폰 번호 입력
- [x] 휴대폰 OTP 3단계 플로우 (번호입력→OTP입력→프로필입력)
- [x] 체크포인트 저장

## 시니어 친화적 UI 개선 + 보안 강화
- [x] LoginPage 글자 크기 확대 (최소 18px), 버튼 크기 확대 (h-14 이상)
- [x] 단계 안내 명확화 (1단계/2단계/3단계 진행 표시 + 각 단계 설명)
- [x] 한국어 완전화 (영어 오류 메시지 제거, 모든 안내문 한국어)
- [x] OTP 만료 카운트다운 타이머 (9:59 → 0:00)
- [x] 재발송 버튼 (60초 쿨다운)
- [x] OTP 5회 실패 시 잠금 (서버 + UI)
- [x] 체크포인트 저장

## ComingSoon 페이지 개선
- [x] 홈 버튼 → 바로가기 버튼으로 변경 (골드 배경, ArrowRight 아이콘)
- [x] 비밀번호 잠금 해제 (sessionStorage에 자동으로 "1" 저장)
- [x] 비밀번호 모달 완전 제거

## 보안 강화 (Security Hardening)
- [x] [P1] InternalPage(/799805) 클라이언트 하드코딩 비밀번호 → 서버사이드 admin role 인증으로 교체
- [x] [P1] /799805 라우트에 useAuth() + user.role === 'admin' 체크 적용
- [x] [P2] GET /api/stripe/session/:id 엔드포인트에 로그인 인증 추가 (세션 소유자만 조회 가능)
- [x] [P2] applyReferral publicProcedure → protectedProcedure로 변경 (타인 이메일 조작 방지)
- [x] [P3] Rate Limiting 미들웨어 추가 (express-rate-limit): OTP 발송 5회/15분, 문의 접수 10회/시간, 회원가입 추적 200회/시간
- [ ] [P3] sendOtp(이메일/휴대폰) 동일 이메일/번호 재발송 1분 쿨다운 서버 적용
- [ ] [P4] 관리자 전용 프로시저(inquiryRouter 등)에서 inline role 체크 → adminProcedure로 통일
- [ ] [P4] 세션 쿠키 SameSite=lax로 변경 (현재 none → CSRF 위험)

## 텍스트/UX 개선
- [x] "나의 유서" → "나의 편지"로 전체 변경 (LetterDashboard, LetterWrite, Navbar 메뉴 등)

## 유언장 작성 UX 개선
- [ ] 유언장 작성 1단계: 회원가입 시 입력한 프로필 정보 자동 채움 (이름, 생년월일, 연락처, 주소 등)
- [ ] 유언장 작성: 주소 입력 필드에 Google Places 자동완성 적용 (전 세계 모든 국가)
- [ ] 상속자 등록 주소 필드에도 동일한 주소 자동완성 적용

## 8월 한국 오픈 필수 항목 (Korea Launch - August 2026)

### [CRITICAL] 결제 시스템
- [ ] 토스페이먼츠 연동 (현재 Stripe만 구현됨, 한국 오픈 필수)
- [ ] 결제 완료 후 유언장 인증 상태 자동 업데이트 (DB wills.status = 'certified')
- [ ] 결제 내역 대시보드 실제 데이터 연동 (현재 Stripe만)

### [CRITICAL] 본인인증 (eKYC)
- [ ] Step10 본인인증 실제 API 연동 (현재 setTimeout 더미 구현)
  - PASS 인증 (통신3사) 또는 NICE평가정보 API 연동
  - 카카오 / 네이버 인증 연동
- [ ] 블록체인 해시 실제 기록 (현재 랜덤 문자열 더미)

### [CRITICAL] 프로필 관리
- [x] ProfilePage 프로필 저장 기능 구현 완료 (이름, 전화번호, 주소, 생년월일, 직업 수정 및 DB 저장)
- [x] 회원가입 시 수집한 정보 → 유언장 작성 자동 채움 (AIWizard 연동 완료)

### [CRITICAL] 유언장 저장 및 관리
- [ ] 완성된 유언장 PDF 생성 및 다운로드 (현재 "준비 중" 더미)
- [ ] 대시보드에서 내 유언장 목록 조회 및 수정 진입
- [ ] 유언장 임시저장 → localStorage 아닌 DB 저장으로 전환

### [HIGH] 주소 자동완성
- [ ] 한국 주소: 카카오 우편번호 API (현재 구현됨) - 유지
- [ ] 해외 주소: Google Places Autocomplete 추가 (상속자 등록 시 필요)
- [ ] 국가 선택에 따라 자동으로 한국/해외 주소 검색 전환

### [HIGH] 알림 시스템
- [ ] 회원가입 완료 이메일 발송 (Resend)
- [ ] 유언장 인증 완료 이메일 발송
- [ ] 결제 완료 이메일 영수증 발송
- [ ] 카카오톡 알림 연동 (비즈메시지)

### [MEDIUM] 법적 요건
- [ ] 약관 및 개인정보처리방침 페이지 (/terms, /privacy)
- [ ] 유언장 작성 면책 조항 (AI는 정보 제공만, 법률 자문 아님)
- [ ] 전자서명법 준수 고지

### [MEDIUM] 운영 도구
- [ ] 관리자 페이지 (/799805) 실제 데이터 연동 강화
  - 유언장 현황, 결제 현황, 회원 현황 실시간 조회
- [ ] 문의 관리 시스템 (InquiriesPage) 이메일 알림 연동

## 버그 수정
- [x] ComingSoon 페이지에 로그인 버튼 추가 (미로그인 → /login, 로그인 중 → /dashboard)
- [x] Navbar 로그인/로그아웃 버튼 상태 정상 표시 확인

## 유언장 작성 자동 채움
- [ ] 유언장 작성 1단계: 회원가입 시 입력한 이름·주소 자동 채움
- [ ] auth.me 반환값에 name, address 필드 포함 여부 확인
- [ ] ProfilePage에서 이름·주소 저장 기능 구현 (미구현 시)

## 특허 보호 - 기술 표현 우회 교체
- [x] "4중 사망 감지 시스템" → "다층 안심 확인 서비스"로 전체 교체
- [x] "Badge QR 사망 트리거" → "Badge 긴급 알림 기능"으로 전체 교체
- [x] "Dead Man's Switch" → "정기 안심 확인 서비스"로 전체 교체
- [x] "자동 유언 집행 프로세스" → "사후 서비스 지원"으로 전체 교체
- [x] "블록체인 보관/기록" → "분산 암호화 보관 시스템"으로 전체 교체

## 약관 동의 절차
- [x] 서비스 이용약관 페이지 생성 (/terms) - 한국 전자상거래법 기준
- [x] 개인정보처리방침 페이지 생성 (/privacy) - 개인정보보호법 기준
- [x] 회원가입 단계에 약관 동의 체크박스 이미 구현됨 (이용약관·개인정보·마케팅·GDPR)
- [x] 동의 전 가입 버튼 비활성화 (agreeTerms && agreePrivacy 조건)
- [x] App.tsx에 /terms, /privacy 라우트 등록

## QR코드 멤버십 카드 시스템
- [x] DB users 테이블에 qrCode 필드 추가 및 마이그레이션
- [x] 회원가입 시 emailAuthRouter/phoneAuthRouter에서 qrCode 자동 생성
- [x] tRPC: qr.getMyQr (내 QR 코드 및 공개 URL 반환)
- [x] tRPC: qr.getPublicProfile (qrCode로 공개 정보 조회)
- [x] tRPC: qr.updateQrPublic (QR 공개 여부 토글)
- [x] 공개 프로필 페이지 생성 (/profile/:qrCode) - 이름 마스킹, EverWill 가입 확인 배지
- [x] 대시보드 멤버십 카드 페이지 (/dashboard/membership) - QR 표시, 다운로드, 인쇄
- [x] 사이드바 메뉴에 "멤버십 카드" 항목 추가
- [x] App.tsx에 /profile/:qrCode 라우트 등록

## 2단계 자산 인증 시스템
- [x] DB: asset_verifications 테이블 (userId, status, idPhotoKey, selfieKey, consentAt, signatureKey, reviewedAt, reviewNote)
- [x] DB: asset_documents 테이블 (verificationId, type, label, fileKey, fileUrl, uploadedAt)
- [x] DB 마이그레이션 실행 (pnpm db:push)
- [x] tRPC: assetVerify.getStatus (내 인증 상태 조회)
- [x] tRPC: assetVerify.uploadIdPhoto / uploadSelfie / uploadDocument (S3 업로드 + DB 저장)
- [x] tRPC: assetVerify.deleteDocument (서류 삭제)
- [x] tRPC: assetVerify.submitVerification (동의 + 서명 후 검토 요청)
- [x] 자산 인증 페이지 (/dashboard/asset-verify) - 4단계 마법사
  - 1단계: 신분증 + 얼굴 사진 업로드
  - 2단계: 자산 서류 업로드 (6가지 유형: 부동산등기부등본/통장잔액/자산내역서/보험증권/주식잔고/기타)
  - 3단계: 본인 확인 동의 체크박스 (5개 조항)
  - 4단계: 캔버스 전자 서명 + 제출 요약
- [x] 대시보드 사이드바에 "자산 인증" 메뉴 추가
- [x] App.tsx에 /dashboard/asset-verify 라우트 등록
- [ ] 인증 완료 후 대시보드 홈에 인증 배지 표시
- [ ] 관리자 페이지에 자산 인증 서류 검토 섹션 추가

## Navbar 내 정보 드롭다운
- [ ] 로그인 후 Navbar에 아이디(이름) 표시 + 클릭 시 드롭다운 메뉴
- [ ] 드롭다운 메뉴 항목: 내 정보 보기, 내 대시보드, 로그아웃
- [x] ProfilePage 완성: 이름·전화번호·주소·생년월일·직업 수정 및 DB 저장 기능 (trpc.auth.email.updateProfile 사용)
- [x] tRPC: auth.email.updateProfile 프로시저 활용 (이름, 전화번호, 주소, 생년월일, 직업 업데이트)

## 이메일+비밀번호+SMS 2차 인증 로그인 시스템 개편

- [x] DB: users 테이블에 passwordHash 필드 추가 (bcrypt)
- [x] DB: pnpm db:push 실행
- [x] API: emailAuth.register - 이메일+비밀번호+전화번호로 신규 가입 (bcrypt 해시 저장)
- [x] API: emailAuth.loginStep1 - 이메일+비밀번호 검증 → 등록된 전화번호로 SMS OTP 발송
- [x] API: emailAuth.loginStep2 - SMS OTP 검증 → 세션 발급
- [x] API: emailAuth.setPassword - 기존 OTP 가입자가 비밀번호 설정 가능
- [x] LoginPage.tsx: 이메일+비밀번호 입력 화면 (로그인 1단계)
- [x] LoginPage.tsx: SMS OTP 입력 화면 (2단계, 등록 전화번호로 자동 발송)
- [x] LoginPage.tsx: 회원가입 탭 - 이메일+비밀번호+전화번호 입력
- [x] 기존 OTP 전용 가입자: 인증코드 방식으로 로그인 링크 제공 (이메일 탭 내 전환 버튼)

## 로그아웃 버튼
- [ ] 대시보드/네비게이션에 로그아웃 버튼 추가

## ProfilePage 개선
- [x] 휴대폰 번호 옆에 인증 완료 배지(초록 체크) 표시 (OTP/SMS로 인증된 번호)
- [x] 주소 필드를 직접 입력 → 카카오 주소 API 팝업으로 자동완성 변경 (상세주소 입력 필드 추가)

## 관리자 메뉴
- [x] 사이드바에 관리자 패널 메뉴 추가 (admin 계정에게만 표시, /799805 이동)

## 관리자 UX 개선
- [ ] 관리자 계정에게는 대시보드의 "자산을 먼저 등록해주세요" 배너 및 자산 등록 관련 CTA 숨김

## 관리자 대시보드 종합 개편 (/799805)
- [x] 통계 탭: 총 회원수, 오늘 가입자, 총 매출, 이번달 매출, 유언장 수, 문의 수
- [x] 회원 관리 탭: 전체 회원 목록, 이름/이메일/전화번호 검색, 역할 변경(admin/user), 페이지네이션
- [x] 결제/매출 탭: 전체 결제 내역, 월별 매출 차트, 상태 필터
- [x] 자료 관리 탭: 유언장 목록 (작성자, 상태, 날짜)
- [x] 문의 관리 탭: 1:1 문의 목록, 답변 상태, 답변 기능
- [ ] 관리자 계정에게는 대시보드의 자산등록 배너/CTA 숨김

## 상속자 등록 시스템
- [x] DB: heirs 테이블 생성 (userId, priority, name, phone, address, relationship, shareType(percent/amount), shareValue, smsConsent, createdAt)
- [x] DB: heirs 테이블에 priority, shareType, shareAmount, smsConsent 필드 추가 (pnpm db:push 완료)
- [x] API: heirs.getMyHeirs - 내 상속자 목록 조회
- [x] API: heirs.addHeir - 상속자 추가 (이름, 전화, 주소, 관계, 분배방식, 분배값)
- [x] API: heirs.updateHeir - 상속자 정보 수정
- [x] API: heirs.deleteHeir - 상속자 삭제
- [x] API: heirs.updateSmsConsent - 쉀1상속자 SMS 알림 동의 여부 변경
- [x] API: heirs.sendWillNotification - 유언 완료 시 쉀1상속자에게 SMS 발송
- [x] UI: /dashboard/heirs 상속자 등록 페이지 생성
- [x] UI: 상속자 카드 목록 (쉀1상속자, 쉀2상속자... 순서 표시)
- [x] UI: 상속자 추가 폼 (이름, 전화번호, 주소, 관계, 분배비율/금액 선택)
- [x] UI: 분배방식 토글 (퍼센트 % / 금액 ₩)
- [x] UI: 쉀1상속자 SMS 동의 체크박스 (EverWill 가입 사실 문자 알림)
- [x] UI: 사이드바에 "상속자 등록" 메뉴 추가
- [x] SMS: Twilio 일반 알림 함수 추가 (sendSmsMessage)
- [ ] SMS: 쉀1상속자에게 EverWill 가입 사실 알림 문자 발송 (동의 시, Twilio 실제 키 연동 후 활성화)
- [ ] SMS: 유언 완료 후 쉀1상속자에게 유언 사실 알림 문자 발송 (유언 인증 시스템 연동 후 활성화)

## 언론소개 섹션 리디자인
- [x] TrustSection.tsx 언론소개 섹션을 국가→신문사→뉴스제목 5개 목록 형태로 변경
- [x] 각 항목: 순번 + 국기 + 국가명 + 신문사명 + 뉴스제목 (현재 선택 언어로 자동 번역)
- [x] 5개 언론사: 조선일보(한국), 朝日新聞(일본), Bloomberg(미국), Le Monde(프랑스), Al Jazeera(중동) — 11개 언어 번역 포함

## 글로벌 뉴스 카드 게시판 (언론소개 섹션 교체)
- [x] TrustSection.tsx 언론소개 섹션을 글로벌 뉴스 카드 게시판으로 교체
- [x] 뉴스 카드: 국기 + 신문사명 + 뉴스 제목 + 날짜 + 짧은 요약
- [x] 카드 6개 그리드 또는 가로 스크롤 형태

## 글로벌 뉴스 관리 시스템 (관리자 등록 → 홈페이지 표시)
- [x] DB: news_posts 테이블 생성 (id, title, url, outlet, country, flag, publishedAt, isActive, createdBy)
- [x] API: news.getPublic - 공개 뉴스 목록 조회 (홈페이지용)
- [x] API: news.getAll - 전체 뉴스 목록 (관리자용)
- [x] API: news.create - 뉴스 등록 (관리자 전용)
- [x] API: news.update - 뉴스 수정 (관리자 전용)
- [x] API: news.delete - 뉴스 삭제 (관리자 전용)
- [x] API: news.toggleActive - 공개/비공개 전환 (관리자 전용)
- [x] AdminPage.tsx: 뉴스 관리 탭 추가 (URL+제목+신문사+국가+날짜 입력 폼, 목록, 수정/삭제)
- [x] TrustSection.tsx: 하드코딩된 뉴스 데이터 → DB에서 실시간 조회로 교체

## 휴대폰 로그인 보안 개선 (비밀번호 + SMS OTP 2단계)
- [x] DB: users 테이블에 passwordHash 필드 활용 (기존 필드 재사용)
- [x] API: phoneAuth.register - 신규 가입 시 이름+비밀번호 함께 저장
- [x] API: phoneAuth.loginStep1 - 휴대폰번호+비밀번호 검증 → SMS OTP 발송
- [x] API: phoneAuth.loginStep2 - SMS OTP 검증 → 세션 발급
- [x] LoginPage.tsx: 휴대폰 탭 UI 개편
  - 1단계: 국가코드 + 휴대폰번호 + 비밀번호 입력 → "로그인" 버튼
  - 2단계: SMS OTP 6자리 입력 (기존 OTP 화면 재활용)
  - 회원가입 서브탭: 이름 + 휴대폰번호 + 비밀번호 + 비밀번호 확인
  - OTP 전용 로그인 서브모드도 유지 (휴대폰+OTP 방식)

## 회원가입 주소 필드 추가
- [x] LoginPage.tsx 이메일 탭 회원가입 폼에 주소 필드 추가 (카카오 주소 검색 팝업 연동)
- [x] LoginPage.tsx 휴대폰 탭 회원가입 폼에 주소 필드 추가 (카카오 주소 검색 팝업 연동)
- [x] emailAuthRouter.register / phoneAuthRouter.register에 address 필드 저장 지원

## 신분증 스캔 AI OCR 자동인식
- [x] API: idScan.scanId - 신분증 이미지 업로드 → AI OCR로 이름/번호/생년월일 자동 추출
- [x] 지원 서류: 주민등록증, 운전면허증, 여권 (국가별 자동 감지)
- [x] 결제/인증 단계(Step10) UI: 신분증 스캔 섹션 추가
  - 카메라 촬영 버튼 (모바일)
  - 파일 업로드 버튼 (PC)
  - 스캔 결과 미리보기 + 자동 쉡움 (이름/번호/생년월일)
  - 수동 수정 가능

## 결제/인증 단계 전체 흐름 완성 (Step 10)
- [x] API: auth.sendReauthOtp - 로그인된 사용자 휴대폰으로 OTP 재발송 (재인증용)
- [x] API: auth.verifyReauthOtp - 재인증 OTP 검증
- [x] Step10Sign.tsx: 전체 흐름 재설계
  - signStep 1: 신분증 스캔 (AI OCR 자동인식)
  - signStep 2: 자산 정보 입력 (부동산/금융/기타, 국가별 맞춤)
  - signStep 3: 관련 서류 파일 업로드 (S3)
  - signStep 4: SMS OTP 재인증 (등록 휴대폰으로 재발송, 6자리 입력)
  - signStep 5: 전자서명
  - signStep 6: 결제

## 유언집행자 지정 기능 (Step 7)
- [x] WillData 타입에 executorType, executorCustomName, executorCustomPhone, executorCustomRelation 필드 추가
- [x] Step7Special.tsx에 유언집행자 지정 섹션 추가
  - 제1상속인 자동 vs 직접 지정 선택 UI
  - 미지정 시: "제1상속인이 자동으로 집행자가 됩니다" 안내 표시
  - 직접 지정 시: 이름/관계/연락처 입력 폼
- [x] 유언장 PDF/미리보기에 유언집행자 정보 반영 (Step9Preview)

## Step9 미리보기 유언집행자 정보 반영
- [x] Step9Preview.tsx에 유언집행자 섹션 추가 (제1상속인 자동 vs 직접 지정 표시)

## 상속 서비스 페이지 가격 구조 명확화
- [ ] 기본 가입비 ₩199,000 포함 내용 명시 (상속절차 + 세금신고 가이드 + 서류 자동 작성 + PDF 다운로드)
- [ ] 2억 초과분 0.1% 추가 수수료 계산기 유지
- [ ] 변호사 선임 섹션 추가 (착수금 ₩990,000 + 성공 보수 1%)
- [ ] 변호사 선임 계약서 전자서명 플로우 안내
