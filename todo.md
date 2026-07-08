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

## 사회기부 섹션 추가
- [x] DB: charityDonations 테이블 추가 (userId, category, customOrgName, amount)
- [x] tRPC: charity.list / charity.upsert / charity.delete 프로시저 구현
- [x] HeirsPage 하단에 사회기부 섹션 UI 추가
  - 12개 분야 체크박스 (교육/아동청소년/노인복지/장애인/의료보건/환경기후/문화예술/과학기술/동물복지/재난구호/종교사회보사/기타)
  - 체크 시 해당 분야 카드 바로 아래 금액 입력칸 표시
  - 기타 선택 시 단체명 직접 입력 + 금액 입력
  - 총 기부금액 자동 합산 표시
  - "EverWill이 선정하여 전달" 안내 문구
- [x] pnpm db:push 실행 완료 (charityDonations 테이블 생성)

## 법적 위험 문구 안전 표현으로 교체
- [x] "법적 효력 있는 서류 자동 작성" → "상속 신고 서류 양식 자동 생성" (features 배지)
- [x] "법적 신고 서류 자동 작성" → "상속 신고 서류 초안 자동 작성" (포함 내용 박스)
- [x] "변호사 선임 서비스 (선택)" → "법률 전문가 연결 서비스" (섹션 제목)
- [x] "EverWill 전속 변호사가 모든 법적 대응을 책임집니다" → "EverWill 파트너 법률 전문가가 상속 절차를 지원합니다"
- [x] "변호사 선임하기" 버튼 → "전문가 상담 신청하기"
- [x] "변호사 선임 시 위임 계약서 자동 생성" → "전문가 연결 후 위임 동의서 자동 생성"
- [x] 11개 언어 모두 동일하게 적용 (총 50개 문구 교체) (총 50개 문구 교체)

## 상속 서비스 수수료 구조 3단계 변경
- [x] 수수료 계산기 3단계 로직 변경 (1억 이하 무료 / 2억 이하 ₩199,000 / 2억 초과분 × 0.1%)
- [x] LANG_TEXT tier0/tier1/tier2/tier3/assetBasisNote 텍스트 수정 (11개 언어)
- [x] 자산 평가 기준 안내 문구 추가 (현금/주식/채권 = 가액, 부동산 = 공시지가 기준)

## 상속 서비스 비교 표
- [x] HeirServiceSection.tsx에 기본 서비스 vs 변호사 선임 서비스 상세 비교 표 추가 (11개 언어)

## 상속 서비스 가격 구조 명확화
- [x] HeirServiceSection.tsx LANG_TEXT에 includedItems, lawyerTitle, lawyerDesc, lawyerFee1/Val, lawyerFee2/Val, lawyerNote, lawyerCta 필드 추가 (11개 언어)
- [x] 기본 가입비 포함 내용 박스 UI 추가 (₩199,000 포함 항목 체크리스트)
- [x] 변호사 선임 서비스 섹션 UI 추가 (착수금 ₩990,000 + 성공 보수 1% + 선임하기 버튼)

## 소셜 로그인 구현
- [x] Google OAuth 클라이언트 ID/Secret 발급 및 환경변수 등록
- [x] server/socialAuth.ts - Google/Kakao/Naver/LINE OAuth 라우트 구현
- [x] LoginPage.tsx - 소셜 로그인/가입 버튼 UI 추가 (Google/Kakao/Naver/LINE)
- [ ] Kakao 앱 키 발급 및 환경변수 등록 (KAKAO_CLIENT_ID)
- [ ] Naver 앱 키 발급 및 환경변수 등록 (NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)
- [ ] LINE 채널 키 발급 및 환경변수 등록 (LINE_CHANNEL_ID, LINE_CHANNEL_SECRET)

## 진행 중
- [ ] DB 스키마 설계 (users, payments 테이블)
- [x] 회원가입/로그인 백엔드 API (이메일+비밀번호, 소셜 로그인)
- [x] 회원가입 페이지 (/signup)
- [x] 로그인 페이지 (/login)
- [x] 사용자 대시보드 (/dashboard)
- [ ] 결제 내역 페이지 (/dashboard/payments)
- [x] Stripe Webhook 결제-계정 연결 로직 (소문자 키 버그 수정 완료)
- [x] Navbar 로그인 상태 반영

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
- [x] [P4] 관리자 전용 프로시저(inquiryRouter 등)에서 inline role 체크 → adminProcedure로 통일
- [x] [P4] 세션 쿠키 SameSite=lax로 변경 (현재 none → CSRF 위험)

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
- [x] 완성된 유언장 PDF 생성 및 다운로드 (html-pdf-node 기반 API + 대시보드 UI 연결)
- [x] 대시보드에서 내 유언장 목록 조회 및 수정 진입
- [x] 유언장 임시저장 → localStorage 아닌 DB 저장으로 전환

### [HIGH] 주소 자동완성
- [ ] 한국 주소: 카카오 우편번호 API (현재 구현됨) - 유지
- [ ] 해외 주소: Google Places Autocomplete 추가 (상속자 등록 시 필요)
- [ ] 국가 선택에 따라 자동으로 한국/해외 주소 검색 전환

### [HIGH] 알림 시스템
- [ ] 회원가입 완료 이메일 발송 (Resend)
- [x] 유언장 인증 완료 이메일 발송 (willRouter.ts에 이미 구현됨 확인)
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
- [x] 인증 완료 후 대시보드 홈에 인증 배지 표시
- [x] 관리자 페이지에 자산 인증 서류 검토 섹션 추가 (이미 구현됨 확인)

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
- [x] 대시보드/네비게이션에 로그아웃 버튼 추가

## ProfilePage 개선
- [x] 휴대폰 번호 옆에 인증 완료 배지(초록 체크) 표시 (OTP/SMS로 인증된 번호)
- [x] 주소 필드를 직접 입력 → 카카오 주소 API 팝업으로 자동완성 변경 (상세주소 입력 필드 추가)

## 관리자 메뉴
- [x] 사이드바에 관리자 패널 메뉴 추가 (admin 계정에게만 표시, /799805 이동)

## 관리자 UX 개선
- [x] 관리자 계정에게는 대시보드의 "자산을 먼저 등록해주세요" 배너 및 자산 등록 관련 CTA 숨김

## 관리자 대시보드 종합 개편 (/799805)
- [x] 통계 탭: 총 회원수, 오늘 가입자, 총 매출, 이번달 매출, 유언장 수, 문의 수
- [x] 회원 관리 탭: 전체 회원 목록, 이름/이메일/전화번호 검색, 역할 변경(admin/user), 페이지네이션
- [x] 결제/매출 탭: 전체 결제 내역, 월별 매출 차트, 상태 필터
- [x] 자료 관리 탭: 유언장 목록 (작성자, 상태, 날짜)
- [x] 문의 관리 탭: 1:1 문의 목록, 답변 상태, 답변 기능
- [x] 관리자 계정에게는 대시보드의 자산등록 배너/CTA 숨김

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

## "나의 편지" 메뉴 → 사회기부 소개 페이지 교체
- [ ] 네비게이션 메뉴 "나의 편지" → "사회기부" (11개 언어 i18n)
- [ ] /charity 라우트 생성 (CharityPage.tsx)
- [ ] CharityPage 섹션 구성:
  - Hero: 사회기부 유언이란 + 감성 헤드라인
  - 12개 기부 분야 소개 카드 (아이콘 + 설명)
  - 기부 절차 안내 3단계 (유언 작성 → EverWill 선정 → 사후 직접 전달)
  - 기부단체 후원 신청 방법 안내
  - 사회기부 유언 시작하기 CTA 버튼
- [ ] App.tsx 라우트 등록
- [ ] 11개 언어 i18n 텍스트 추가

## 유언 작성 마법사 사회기부 소개 스텝 추가
- [ ] WritePage 분배 설계 단계 이후 사회기부 소개 섹션 삽입
  - 참고 정보 카드: "많은 분들이 유언에 사회기부를 포함합니다" 통계·사례
  - 12개 분야 체크박스 (교육/아동/노인/장애인/의료/환경/문화/과학/동물/재난/종교/기타)
  - 체크 시 해당 분야 금액 입력칸 표시
  - 최소 금액: 한국 ₩10,000 / 미국 $10 / 일본 ¥1,000 / 기타 동등 금액
  - 기타 선택 시 단체명 직접 입력 + 금액 입력
  - 총 기부 예정 금액 자동 합산 표시
  - 건너뛰기 버튼 (강제 아님, 자연스럽게 선택 유도)
  - 11개 언어 i18n 지원

## 유언 작성 마법사 사회기부 스텝 추가
- [x] willTypes.ts AI_STEPS에 Step7 사회기부 유언 추가 (총 11단계)
- [x] 11개 언어 i18n willCharity 섹션 추가 (ko, en, ja, zh, de, es, ar, fr, ru, hi, pt)
- [x] WillCharityStep.tsx 컴포넌트 생성 (12개 분야 체크박스 + 금액 입력 + 건너뛰기)
- [x] AIWizard.tsx 수정 - WillCharityStep import 및 step 7에 렌더링
- [x] 기존 Step7~10을 Step8~11로 번호 이동
- [x] 페이월 게이트 step 10→11 전환으로 업데이트
- [x] TypeScript 오류 0건 확인

## 홈 메인 화면 사회기부 누적 현황 섹션
- [x] charityRouter에 getGlobalStats 프로시저 추가 (국가별 기부금 합산, publicProcedure)
- [x] CharityStatsSection.tsx 컴포넌트 생성 (국가별 화폐 기준 누적 기부금 표시)
- [x] Home.tsx에 CharityStatsSection 삽입 (ReferralSection 이후)
- [x] 11개 언어 i18n charityStats 섹션 추가
- [x] 카운트업 애니메이션 적용
- [x] TypeScript 오류 0건 확인

## 로그인/회원가입 플로우 개편
- [x] 신규가입 Step1: 이메일 또는 휴대폰 입력
- [x] 신규가입 Step2: 기본정보(이름/생년월일/국가) + 비밀번호 설정 + 자산 등록(은행/채권/부동산/기타 가액)
- [x] 신규가입 Step3: 가입 완료 화면
- [x] 재방문 로그인: 이메일/휴대폰 + 비밀번호 입력 → OTP 자동발송 → OTP 입력 → 로그인 완료

## 로그인/회원가입 플로우 개편
- [x] 신규가입: Step1(이메일/휴대폰 선택) → Step2(정보+비번+자산등록) → Step3(완료)
- [x] 재방문 로그인: 이메일/휴대폰+비밀번호 → OTP 자동발송 → OTP 입력 → 완료
- [x] 비밀번호 강도 표시 (8자/영문/숫자/특수문자)
- [x] OTP 6자리 입력 컴포넌트 (붙여넣기 지원, 10분 타이머, 재발송)
- [x] 자산 등록: 은행예금/채권주식/부동산/기타 (가액 입력)
- [x] 왼쪽 브랜드 패널 (데스크탑)

## 유언장 법적 문서 형식 구현
- [x] WillDocumentPreview.tsx - 한국 민법 기준 법적 유언장 문서 실시간 렌더링 컴포넌트
- [x] AIWizard.tsx 레이아웃 개편 - 왼쪽 입력폼 + 오른쪽 실시간 문서 미리보기 (데스크탑)
- [x] 각 단계별 입력 시 문서에 자동 채움 (실시간 반영)
- [x] 문서 내 미입력 항목은 ___ 점선으로 표시
- [x] 법적 조항 순서 명확히 표시 (제1조, 제2조...)
- [x] willRouter.ts save/get/list 프로시저 추가 (DB 저장)
- [x] 단계별 자동저장 (로그인 회원 → DB, 비로그인 → localStorage)
- [x] 미리보기 단계(Step10)에서 완성된 법적 문서 전문 표시

## 전체 플로우 점검 및 일괄 수정 (2026-05-13)
- [x] Step1Testator - 거주 국가 선택 + GlobalAddressSearch + PhoneInput 적용
- [x] Step3Heirs - 상속인 PhoneInput(국가코드) + GlobalAddressSearch 적용
- [x] Step4RealEstate - 부동산 주소 GlobalAddressSearch + 예상가액 AmountInput 적용
- [x] Step5Financial - 금액 AmountInput(콤마/만원/억원) + 주식 보유수 분기 처리
- [x] Step6Other - 기타 자산 예상가액 AmountInput 적용
- [x] Step9Preview - 왼쪽 법적 검토+AI, 오른쪽 실시간 문서 미리보기 (데스크탑 좌우분할/모바일 탭)
- [x] WillDocumentPreview - 한국 민법 기준 법적 유언장 문서 형식 실시간 미리보기 컴포넌트
- [x] 공통 컴포넌트 - AmountInput, PhoneInput, GlobalAddressSearch 생성
- [x] 공통 유틸 - formatUtils.ts (formatKoreanUnit, formatNumberWithComma) 생성
- [x] 회원가입 주소 - GlobalAddressSearch 적용 (한국: 카카오, 해외: Google Places)
- [x] 이메일 가입 - 전화번호 OTP 인증 추가
- [x] 무료 시작하기 버튼 - /write 이동 수정
- [x] 사회기부 유언 - 분야 선택 + 단체 직접 지정 + EverWill 운영위원회 집행 문구
- [x] 사회기부 페이지 - EverWill 사회적후원 운영위원회 소개 섹션 추가
- [x] 채권/주식 자산 - 금액 대신 보유 주식 수(주) 입력으로 변경
- [x] 빌드 확인 - TS 에러 0개, Vite 빌드 성공

## 구매 후 자동화 파이프라인 (2026-05-14)
- [ ] 자산증명서 AI 스캔: 은행잔액증명서/부동산등기부등본/주식보유증명서 OCR 자동 인식 프로시저
- [ ] AI 자산 데이터 자동완성: 스캔 결과 → 구조화된 자산 데이터 자동 생성
- [ ] 법적 유언장 자동 생성: 자산 데이터 + 상속인 정보 → 한국 민법 기반 유언장 초안 자동 작성
- [ ] Step10Sign UI 전면 개편: 신분증스캔→자산증명서스캔→자동완성→유언장미리보기→공인인증서명 흐름
- [ ] 공인인증서/개인인증서 최종 서명 단계 UI (PASS/카카오/네이버 인증 연동 안내 포함)
- [ ] 유언장 최종본 PDF 미리보기 (서명 전 전체 내용 확인)

## 7월 오픈 MVP 완성 작업

- [x] willRouter에 saveWill / updateWill / getMyWills / getWillById / certifyWill API 추가
- [x] WritePage 완료 시 trpc.will.saveWill 호출하여 DB 저장 (Step10Sign 결제 완료 시 certified, 임시저장 시 draft)
- [x] 대시보드 사이드바에 "내 유언장" 메뉴 추가 (/dashboard/wills)
- [x] 대시보드 내 유언장 목록 페이지 생성 (상태/날짜/수정 버튼)
- [x] 유언장 PDF 생성 API (서버사이드, html-pdf-node + chromium)
- [ ] 결제 완료 후 wills.status = certified 자동 업데이트
- [ ] 결제 완료 이메일 발송 (영수증 + PDF 다운로드 링크)
- [x] 인증 완료 이메일 발송 (Resend 연동, 비동기 발송)
- [x] 회원가입 환영 이메일 함수 추가 (sendWelcomeEmail)
- [x] 디지털 카드 SVG 생성 API (server/digitalCard.ts - 실버/골드/플래티넘 3종, QR코드 포함)
- [x] pdfRouter에 generateDigitalCard 프로시저 추가
- [x] 대시보드 내 유언장 목록에 디지털 카드 다운로드 버튼 추가 (골드 컬러, 갤럭시/아이폰 잠금화면 안내)
- [x] 인증 완료 이메일에 디지털 카드 다운로드 링크 추가 (대시보드 링크 + 사용법 안내)
- [ ] 토스페이먼츠 연동 (API 키 수령 후 진행)

## QA 테스트케이스(2) 수정 작업

- [x] iPhone Safe Area 적용 (viewport-fit=cover + env(safe-area-inset))
- [x] 독일어 버튼 오버플로우 수정 (HeroSection CTA whitespace-nowrap)
- [x] AR 샤리아 1/3 경고 (Step3Heirs + DirectForm 언어별 분기)
- [x] JA 일본 민법 1042조 경고 추가
- [x] DE Pflichtteil 경고 추가
- [ ] eKYC 오류 UX 개선 (안경/마스크/역광/타임아웃/재시도 안내)
- [ ] eKYC 5회 실패 잠금 처리 (TC-K06)
- [ ] eKYC 인증 완료 후 결제 실패 시 재인증 불필요 처리 (TC-K22)
- [ ] Safari MediaRecorder 미지원 안내 (TC-B02)
- [ ] IE11 폴백 안내 페이지 (TC-B07)
- [ ] 크로스브라우저 콘솔 에러 0건 확인 (TC-B01)

## 가격 정책 전면 개편 (2026-05-19)
- [x] pricing.ts 가격 상수 새 정책으로 업데이트 (전자인증₩49,000/3년₩79,000/5년₩99,000/영구₩199,000)
- [x] PricingSection 플랜 이름·설명·혜택 새 정책 반영 (실버/골드/플래티넘/VIP 카드 연동)
- [x] 자필 유언 스캔 인증 +₩15,000 / 영상 유언 +₩19,000 (5년·영구 플랜에 포함) 반영
- [x] 1년 후 연장 보관 ₩15,000/년 안내 문구 추가
- [x] BadgeSection 카드 가격 플랜과 통일 (실버₩49,000/골드₩79,000/플래티넘₩99,000)
- [x] ko.ts pricing.note 새 정책으로 업데이트

## 플로우 점검 결과 (2026-05-22)

### 버그 수정
- [x] [BUG] verifyOtp isNewUser 항상 false: insert 후 select 시 이미 row 존재 → isNewUser 판단 로직 수정 (insert 전에 select로 존재 여부 확인)
- [x] [BUG] handlePayment에서 hash를 Math.random()으로 생성 (가짜 해시) → certifyWill API 호출로 교체 (서버에서 SHA-256 + DB 저장)
- [x] [BUG] AIWizard 임시저장 오류 메시지 오타: "로컈 보관" → "로컬 보관"
- [x] [BUG] Step10Sign 결제 완료 후 saveWill(status:"certified") 호출하지만 certifyWill API는 호출 안 함 → certifiedAt, certNumber, blockchainHash DB 미저장

### 개선 항목
- [x] [개선] 회원가입 완료 후 자동 로그인 미구현 → register 성공 시 loginStep1 자동 호출 또는 세션 직접 발급 (register 성공 후 loginStep1 자동 호출로 구현)
- [x] [개선] WillsPage에 유언장 상세 페이지(/dashboard/wills/:id) 없음 → 목록 클릭 시 상세 조회 라우트 추가
- [x] [개선] certifyWill API에 paymentId 연동 없음 (결제 시스템 미완성이므로 현재는 허용, 결제 연동 시 반드시 검증 추가)
- [x] [개선] 회원가입 시 phone 필드가 optional이지만 로그인 2단계 OTP는 phone 필수 → 가입 시 phone 없으면 이메일 OTP fallback 안내 명확화

## 소셜 간편 로그인 (2026-05-22)
- [ ] Google OAuth 서버 라우트 (/api/auth/google, /api/auth/google/callback)
- [ ] Kakao OAuth 서버 라우트 (/api/auth/kakao, /api/auth/kakao/callback)
- [ ] Naver OAuth 서버 라우트 (/api/auth/naver, /api/auth/naver/callback)
- [ ] 소셜 로그인 후 세션 발급 및 DB users 테이블 upsert
- [ ] LoginPage.tsx에 Google/Kakao/Naver 버튼 추가
- [ ] 소셜 로그인 성공 시 대시보드 자동 이동
- [ ] 소셜 로그인 사용자 추가 정보 입력 화면 (이름/생년월일 없을 경우)

## 소셜 간편 로그인 구현 (한국·미국·일본) - 2026-05-22
- [ ] Google OAuth 서버 라우트 (/api/auth/google → /api/auth/google/callback)
- [ ] Kakao OAuth 서버 라우트 (/api/auth/kakao → /api/auth/kakao/callback)
- [ ] Naver OAuth 서버 라우트 (/api/auth/naver → /api/auth/naver/callback)
- [ ] LINE OAuth 서버 라우트 (/api/auth/line → /api/auth/line/callback)
- [ ] 소셜 로그인 콜백: 이름/이메일/프로필 자동 저장 (DB upsert)
- [ ] 소셜 로그인 성공 시 세션 쿠키 발급 → 대시보드 이동
- [ ] LoginPage.tsx 소셜 로그인 버튼 UI (Google/Kakao/Naver/LINE)
- [ ] 환경변수: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- [ ] 환경변수: KAKAO_CLIENT_ID
- [ ] 환경변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
- [ ] 환경변수: LINE_CHANNEL_ID, LINE_CHANNEL_SECRET

## 2026-05 세션 작업 항목

### 이메일 알림 시스템
- [x] 회원가입 완료 환영 이메일 발송 (register 프로시저에 추가)
- [x] 결제 완료 영수증 이메일 발송 (Stripe webhook에 추가)
- [x] 유언장 인증 완료 이메일 발송 (willRouter.ts에 이미 구현됨 확인)

### 법적 요건 보완
- [x] 유언장 작성 면책 조항 UI (AI는 정보 제공만, 법률 자문 아님)
- [x] 전자서명법 준수 고지 배너 (Step10Sign final_sign 단계에 추가)

### 대시보드 개선
- [x] 인증 완료 후 대시보드 홈에 인증 배지 표시
- [x] 관리자 페이지 자산 인증 서류 검토 섹션 (이미 구현됨 확인)

### 결제 시스템 (후순위)
- [ ] 토스페이먼츠 연동 (한국 오픈 필수, 나중에 연결)
- [ ] 결제 완료 후 유언장 인증 상태 자동 업데이트 (DB wills.status = 'certified')

## 전문가 페르소나 체크리스트 작업 (2026-05)

### 법적 요건 보완 (이준혁 변호사 페르소나)
- [x] 전자 유언장 법적 효력 한계 약관 명시 (현행법상 전자 유언 불인정 고지) - 이용약관 제8조 강화
- [x] 유류분 계산 "참고용" 명시 + 툴팁 (특별수익·기여분 반영 안내) - Step3Heirs 배지 추가
- [x] 유언 검인 신청 절차 안내 (가정법원) - WillsPage에 4단계 절차 안내 섹션 추가
- [x] 미국 주(State)별 유언 요건 차이 고지 UI - GlobalSection 미국 카드에 추가
- [x] 일본 2025년 공정증서 디지털화 개정 내용 반영 - GlobalSection/ComparisonSection 업데이트

### UX/기술 개선 (김태준 개발자 페르소나)
- [x] 404 에러 페이지 처리 확인 및 개선 - EverWill 브랜드 디자인으로 재작
- [x] 각 페이지별 meta title/description 설정 (SEO) - index.html에 OG/Twitter/Schema.org/hreflang 이미 완비
- [x] 개인정보 암호화 안내 문구 (자물솠 아이콘 + 한 줄 설명) - 대시보드 사이드바 하단에 추가
- [x] 고객센터/1:1 문의 접근성 개선 (항상 보이는 위치) - 대시보드 사이드바 하단에 추가

### 디자인 개선 (박서연 디자이너 페르소나)
- [x] 모바일 소셜 로그인 버튼 터치 영역 44px 이상 확인 - 이미 min-h-[44px] 적용됨
- [x] 모바일 폰트 크기 최소 16px 이상 확인 (시니어 대상) - index.css body font-size:16px + 입력필드 16px 고정

## 전문가 페르소나 검토 기반 개선 (2026-05 Jeff 요청)

### 즉시 수정
- [ ] 납골당 철자 오류 수정 (낙골당 → 납골당)
- [ ] 자필·영상 유언 가격 표시 제거 (기능 소개만, 가격은 결제 단계에서만)
- [ ] 유언 내용 단계 기부내역 입력칸 제거

### 자산 입력 개선
- [ ] 자산 입력 폼 인라인 파일 업로드 버튼 추가 (부동산 등기부등본 등 모든 형식)
- [ ] 상속자 분배 퍼센트/금액 입력 UI (저장된 상속자 불러오기 + 동적 추가)
- [ ] 은행계좌번호 전체 입력 + 인증서류 업로드 지원

### 의료·기증 관련 서명 기능
- [ ] 연명치료 거부 서명 기능 (사전연명의료의향서 + NEMC 등록 안내)
- [ ] 시신기부 서명서 기능 (KONOS 등록 안내 포함)

## 상속인 권한 분리 시스템 (2026-05-24)

- [ ] DB: will_heirs 테이블에 heir_rank(1/2/3...), access_level(own_only/full), is_executor 컬럼 추가
- [ ] DB: heir_invitations 테이블 생성 (token, willId, heirId, expiresAt, acceptedAt, isActive)
- [ ] API: 상속인 초대 발송 프로시저 (사망 감지 후 자동 발송, 이메일+SMS)
- [ ] API: 상속인 초대 수락 + 본인인증 프로시저 (토큰 검증)
- [ ] API: 상속인 권한별 유언 내용 조회 (own_only = 자기 몫만 / full = 전체)
- [ ] API: 집행자 전체 열람 + 집행 진행 상태 업데이트 프로시저
- [ ] UI: 상속인 초대 수락 페이지 (/heir/accept/:token)
- [ ] UI: 상속인 대시보드 (자기 몫 열람 전용)
- [ ] UI: 집행자 대시보드 (전체 열람 + 집행 진행)
- [ ] UI: 유언자 대시보드 - 상속인 등록 시 순위 지정 + 가격 표시 (제1상속인 ₩99,000 / 제2~N ₩49,000 / 집행자 ₩149,000)
- [ ] 가격 정책: 제1상속인 ₩99,000 / 제2~N상속인 ₩49,000 / 집행자 ₩149,000 결제 연동

## 가격 페이지 개편 + 공식 인증 통합 문서 PDF 발급 (2026-05-27)
- [x] PaymentPage.tsx 메인 3개 상품만 노출 (전자인증/전자인증프리미엄/영구보관)
- [x] 영상유언·자필유언 부가서비스 접힘 처리 (전자인증 구매 고객 전용)
- [x] Stripe 상품에 DOCUMENT_DOWNLOAD ($1 USD) 추가
- [x] officialDocument.ts - 공식 인증 통합 문서 PDF 생성 모듈 (한글/영문 2종, 공인기관 스타일)
- [x] pdfRouter.ts - generateOfficialDocument tRPC 프로시저 추가
- [x] DashboardHome.tsx - OfficialDocumentCard 컴포넌트 추가 (인증+자산 완료 고객에게만 표시)
- [x] 한글본/영문본 선택 모달 UI
- [x] $1 결제 후 PDF 자동 생성 및 다운로드

## 유언장 수정 정책 구현 (2026-05-27)
- [x] DB: wills 테이블에 freeRevisionCount(무료 수정 횟수), usedFreeRevisions(사용한 무료 횟수) 필드 추가
- [x] DB: will_revision_payments 테이블 추가 (willId, userId, stripePaymentId, amount, createdAt)
- [x] 서버: 플랜별 무료 수정 횟수 상수 정의 (기본 1회, 프리미엄 2회, 영구보관 무제한)
- [x] 서버: 유언장 수정 시 무료 횟수 체크 → 초과 시 Stripe $5 결제 요구 tRPC 프로시저
- [x] 서버: 수정 결제 완료 webhook 처리 (usedFreeRevisions 차감 또는 유료 결제 기록)
- [x] Stripe: WILL_REVISION 상품 추가 (₩5,000 / $5)
- [x] PricingSection.tsx: 플랜별 수정 정책 안내 추가 (기본 1회, 프리미엄 2회, 영구보관 무제한)
- [x] PaymentPage.tsx: 수정 정책 안내 문구 추가
- [x] 유언장 수정 게이트 페이지 (/dashboard/wills/:id/revise): 남은 무료 수정 횟수 표시 + 초과 시 결제 게이트 UI

## 토스페이먼츠 연동 (2026-05-27)
- [ ] 서버: 토스페이먼츠 결제 승인 API 엔드포인트 (/api/toss/confirm)
- [ ] 서버: 결제 완료 후 wills.status=certified 업데이트 연동
- [ ] 프론트: PaymentPage.tsx에 한국 결제 버튼 추가 (토스페이먼츠 결제창 호출)
- [ ] 프론트: 결제 성공/실패 리다이렉트 페이지 (/toss/success, /toss/fail)
- [ ] 테스트: 토스페이먼츠 API 키 유효성 검증 vitest

## 한국 오픈 필수 항목 (2026-05-27)
- [ ] 이용약관 페이지 (/terms) - 한국 전자상거래법 기준, 주)사람 정보 반영
- [ ] 개인정보처리방침 페이지 (/privacy) - 개인정보보호법 기준, 수집항목/목적/보유기간
- [ ] Footer에 약관/개인정보처리방침 링크 추가
- [ ] SEO: index.html 한국어 메타태그 (title, description, keywords, og:*)
- [ ] SEO: sitemap.xml 생성
- [ ] SEO: robots.txt 설정
- [x] 모바일 반응형 점검 (홈, 결제, 유언장 작성, 대시보드) - 국기 바 가로 스크롤 + GlobalSection 언어 버튼 가로 스크롤 + Footer 모바일 레이아웃 개선

## EverWill AI 챗봇 (2026-05-27)
- [x] 서버: chatRouter.ts - EverWill 전문가 페르소나 시스템 프롬프트 작성
- [x] 서버: 스트리밍 응답 tRPC 프로시저 (chat.sendMessage)
- [x] 프론트: ChatbotWidget.tsx - 우측 하단 플로팅 버튼 + 대화창 UI
- [x] 프론트: 모든 페이지(App.tsx)에 ChatbotWidget 전역 추가
- [x] 챗봇 기능: 사이트 사용법 안내, 자산 등록 방법, 결제/인증 안내, 유언 작성 가이드

## 얼굴 인증 (KYC) 기능
- [x] DB: users 테이블에 faceVerified, idImageKey, selfieImageKey, faceVerifiedAt 필드 추가
- [x] pnpm db:push 실행
- [x] server/routers/verificationRouter.ts 생성 (submitFaceVerification mutation)
- [x] routers.ts에 verificationRouter 등록
- [x] client/src/components/FaceVerification.tsx 생성 (신분증+셀피 업로드 UI)
- [x] App.tsx: /dashboard/badge, /dashboard/certification 라우트 추가
- [x] CertificationPage.tsx 생성 (인증 현황 페이지)
- [x] 체크포인트 저장

## 소셜 링크 관리 기능
- [x] DB: site_settings 테이블에 소셜 링크 필드 추가 (youtube, instagram, kakao, line)
- [x] pnpm db:push 실행
- [x] server/routers/siteSettingsRouter.ts 생성 (getSocialLinks, updateSocialLinks)
- [x] routers.ts에 siteSettingsRouter 등록
- [x] 네비게이션 바에 소셜 아이콘 표시 (빈 동그라미 → 실제 아이콘)
- [x] 관리자 페이지에 소셜 링크 설정 패널 추가
- [x] 체크포인트 저장

## 나의 자서전 만들기 기능

- [ ] DB 스키마: autobiographies 테이블 (id, userId, title, status, createdAt, updatedAt)
- [ ] DB 스키마: autobiography_sessions 테이블 (id, autobiographyId, chapter, messages JSON, summary, createdAt)
- [ ] tRPC: autobiography.create / list / get / delete 프로시저
- [ ] tRPC: autobiography.chat - AI와 대화 (챕터별 질문-답변)
- [ ] tRPC: autobiography.generateChapter - 대화 내용 → 챕터 글 자동 생성
- [ ] tRPC: autobiography.generatePdf - 전체 자서전 PDF 책 생성 (표지 포함)
- [ ] /life-story/autobiography 페이지 생성
- [ ] 자서전 챕터 구성 (6개): 어린 시절 / 학창 시절 / 직업·커리어 / 가족·사랑 / 인생의 교훈 / 미래 세대에게
- [ ] AI 대화 UI: 챕터별 질문-답변 채팅 인터페이스 (AIChatBox 활용)
- [ ] 챕터 완성 후 AI가 자동으로 글 정리 (에세이 형태)
- [ ] 자서전 미리보기 (책 레이아웃, 페이지 넘김 효과)
- [ ] PDF 다운로드 (책 표지 + 목차 + 챕터별 내용)
- [ ] 가족 공유 기능 (고유 링크 생성)
- [ ] 대시보드 사이드바에 "나의 자서전" 메뉴 추가
- [ ] App.tsx 라우트 등록 (/life-story/autobiography)
- [ ] pnpm db:push 실행

## 음성 인식 + 사진 AI 그림 + 자서전 기능
- [x] VoiceInput 공통 컴포넌트 (노인 친화적 대형 마이크 버튼 + Whisper API 음성→텍스트)
- [x] PhotoArtUploader 공통 컴포넌트 (사진 업로드 → AI 수채화/일러스트/유화 변환)
- [x] voiceRouter (Base64 오디오 → S3 저장 → Whisper API → 텍스트 반환)
- [x] artworkRouter (사진 → AI 그림 변환, 5가지 스타일)
- [x] DB: autobiographies, autobiographyChapters 테이블 추가
- [x] autobiographyRouter (AI 대화 + 챕터 글 생성 + PDF 생성)
- [x] AutobiographyPage (/life-story/autobiography) — 6챕터 AI 대화 + 음성 입력 + 사진 그림
- [x] LifeStoryPage에 "나의 자서전" 탭 추가 (→ /life-story/autobiography 링크)
- [x] LetterWrite.tsx에 음성 입력 모드 통합 (각 단계별 음성/텍스트 전환)
- [x] LetterWrite.tsx에 사진 그림 추가 기능 통합 (AI 수채화 변환)
- [x] App.tsx 라우트 등록 (/life-story/autobiography)

## 국가별 통합 관리 (관리자)
- [x] adminRouter.ts: adminCountryRouter 추가 (getCountrySummary, getUsersByCountry, getRevenueByCountry, getInquiriesByCountry, replyInquiry)
- [x] routers.ts: adminCountry 라우터 등록
- [x] AdminPage.tsx: Tab 타입에 "countries" 추가
- [x] AdminPage.tsx: COUNTRY_LIST 14개국 정의
- [x] AdminPage.tsx: CountriesTab 컴포넌트 (14개국 카드 그리드 + 전체 요약 통계)
- [x] AdminPage.tsx: CountryDetailView 컴포넌트 (회원/매출/문의 서브탭)
- [x] 관리자 탭 네비게이션에 "국가별 관리" 탭 추가 (Globe 아이콘)

## eKYC 인증 플로우 및 프로필 사진 업로드
- [ ] DB: users 테이블에 profilePhoto, idCardPhoto, selfiePhoto, kycStatus, kycVerifiedAt, ciValue 필드 추가
- [ ] DB: pnpm db:push 실행
- [ ] API: 프로필 사진 업로드 tRPC 프로시저 (S3 저장)
- [ ] API: 신분증 사진 업로드 tRPC 프로시저 (S3 저장, 관리자만 조회 가능)
- [ ] API: 셀카 사진 업로드 tRPC 프로시저 (S3 저장)
- [ ] API: KYC 상태 업데이트 프로시저 (pending → verified/rejected)
- [ ] 마이페이지: 프로필 사진 업로드/변경 UI (원형 아바타 클릭 → 파일 선택)
- [ ] 유언장 인증 단계 (Step9): 신분증 업로드 + 셀카 촬영 + 휴대폰 인증 UI
- [ ] 신분증 업로드 가이드 UI (빛 반사 없는 곳, 모서리 맞추기 안내)
- [ ] 셀카 촬영 가이드 UI (원형 프레임, 정면 응시 안내)
- [ ] KYC 완료 후 결제 버튼 활성화 로직
- [ ] 관리자 페이지: KYC 신청 목록 + 승인/거절 처리 UI
- [ ] 관리자 페이지: 신분증/셀카 사진 확인 (보안 접근)

## 챗봇 비회원/회원 분리 전담 AI 시스템

- [ ] DB: chatMessages 테이블 추가 (userId, sessionId, role, content, createdAt)
- [ ] DB: chatSessions 테이블 추가 (id, userId, createdAt, updatedAt)
- [ ] 백엔드: 비회원용 publicChat 프로시저 (3턴 제한, 서비스 안내 전용 시스템 프롬프트, 다국어 자동)
- [ ] 백엔드: 회원용 memberChat 프로시저 (무제한, 유언·상속·자서전·편지 통합 전문 AI 시스템 프롬프트)
- [ ] 백엔드: 회원 채팅 히스토리 저장/조회 프로시저 (saveMessage, getHistory)
- [ ] 프론트: ChatbotWidget 비회원/회원 분기 처리 (useAuth 기반)
- [ ] 프론트: 비회원 3턴 초과 시 가입 유도 UI (로그인/회원가입 버튼)
- [ ] 프론트: 회원 챗봇 - 현재 선택 언어 자동 연동
- [ ] 프론트: 회원 챗봇 - 이전 대화 히스토리 불러오기
- [ ] 프론트: 회원 챗봇 헤더 "나의 전담 AI" 표시 + 전문 영역 뱃지

## 2026-06-06 완료 항목
- [x] MedicalDirectivePage - medicalDirectives 테이블 추가 + DB 저장 연동 (saveMedicalDirective 프로시저)
- [x] WillCertificatePage - willCertificates 테이블 추가 + trpc 연동 (발급 내역 조회 + 인증 완료 유언장 선택 드롭다운)
- [x] InquiriesPage - 대시보드 내 인라인 문의 폼 추가 (모달 방식, trpc.inquiry.create 연동)
- [x] HeirsPage - 거주 국가 선택 드롭다운 추가 (11개 국가)
- [x] HeirsPage - SNS 연락처 필드 추가 (KakaoTalk / LINE / WhatsApp / WeChat)
- [x] heirs 테이블 - kakaoId, lineId, whatsappId, wechatId 컬럼 추가 + DB 마이그레이션
- [x] heirsRouter - addHeir/updateHeir에 SNS 필드 저장 지원
- [x] AssetsPage - AI 자산 서류 스캔 OCR 기능 추가 (이미지 업로드 → AI 인식 → 폼 자동 채움)
- [x] WillCertificatePage - 라우트 등록 (/dashboard/will-certificate)
- [x] PhoneVerifyPage - 생성 및 라우트 등록 (/dashboard/phone-verify)
- [x] InheritanceTaxPage - 상속세 계산기 생성 및 라우트 등록 (/dashboard/inheritance-tax)

## 파트너 페이지 통합 (2026-06-08)
- [x] 파트너 페이지 7개 파일 client/src/pages/ 복사 완료
- [x] App.tsx에 파트너 라우트 7개 추가 완료 (/partner, /partner/join, /partner/professional, /partner/helper, /partner/policy, /partner/verify, /partner/dashboard)
- [x] Navbar에 "파트너 등록" 버튼 추가 완료 (골드 테두리 스타일)
- [x] 11개 언어 파일에 partnerJoin 번역 키 추가 완료
- [x] LawyersSection에 "전문가 파트너 등록하기" CTA 버튼 추가 완료 (골드 버튼, /partner/professional 이동)
- [x] TypeScript 에러 0개 확인

## 셀러 추천인 시스템 (2026-06-11)
- [x] referralRouter에 getMyReferrals (내가 추천한 회원 목록 + 결제 내역) 프로시저 추가
- [x] referralRouter에 getCommissionSummary (셀러별 수수료 합계) 프로시저 추가
- [ ] adminRouter에 getAllReferralStats (관리자용 전체 셀러 정산 내역) 프로시저 추가
- [x] emailAuthRouter.register에 referralCode 입력 필드 추가 (가입 시 자동 applyReferral)
- [x] phoneAuthRouter.register에 referralCode 입력 필드 추가
- [x] LoginPage 회원가입 폼 info 단계에 추천인 코드 입력 필드 추가 (실시간 검증)
- [x] PartnerDashboardPage에 실제 tRPC 데이터 연결 (내 추천 코드, 추천 회원 목록, 수수료 내역)
- [ ] AdminPage에 셀러 정산 탭 추가 (셀러별 추천 회원 수, 결제 금액, 수수료 합계)

## 개인 AI 메모리 시스템 (2026-06-12)
- [x] DB: aiMemories, aiConversations 테이블 스키마 추가 (schema.ts)
- [x] DB: pnpm db:push 실행 완료 (테이블 생성)
- [x] aiMemoryRouter.ts 구현 (chat/getMemories/addMemory/deleteMemory/getConversations/getConversation/deleteConversation/getMemoryStats)
- [x] routers.ts에 aiMemoryRouter 등록
- [x] MyAIPage.tsx 구현 (개인 AI 채팅 UI - 채팅/대화기록/AI메모리 탭)
- [x] SaramDashboardLayout 사이드바에 나만의 AI (/my-ai) 메뉴 추가
- [x] App.tsx에 /my-ai 라우트 등록

## 전문가 파트너 시스템 (변호사·세무사)
- [ ] DB: expertPartners 테이블 생성 (이름, 전문분야, 국가, 지역, 소개, 사진, 연락처, 상태, 연회비 결제 여부)
- [ ] DB: 국가별 가상 전문가 시드 데이터 (한국/미국/일본/중국/독일/스페인/아랍/프랑스/인도/브라질 각 10명)
- [ ] 백엔드: expertRouter tRPC 라우터 구현 (목록조회/등록/수정/관리자승인)
- [ ] 파트너 가입 페이지 (/partner/expert) - 변호사·세무사 전용 등록 폼
- [ ] 홈페이지 ExpertsSection 컴포넌트 (상속 카드 섹션 아래 배치)
- [ ] 대시보드 전문가 찾기 페이지 (/dashboard/find-expert) - 국가/지역/전문분야 필터
- [ ] 관리자 전문가 파트너 승인·관리 페이지 (/799805/experts)
- [ ] 라우트 등록 (App.tsx, SaramDashboardLayout 사이드바)

## 가격 구조 전면 업데이트 (2026.07)
- [x] 가격 구조 변경: ₩49,000 → ₩99,000 올인원 (모든 기능 포함)
- [x] 랜딩 페이지 가격 섹션 하나의 박스로 통합 재작성 (PricingSection)
- [x] ko.ts 번역 파일 가격 텍스트 전체 업데이트
- [x] 사이트 전체 ₩49,000 텍스트 → ₩99,000으로 일괄 변경 (16개 파일)
- [x] 추가 옵션: 인증서 발급 ₩5,000, 증인 선정 +₩30,000, 수정 6회~ ₩15,000/회
- [x] lib/pricing.ts 가격 상수 업데이트
- [x] CountryPage, InvestPage, InvestorPage, FaqPage, NFCCardPage 등 모든 서브페이지 반영
## 기부 섹션 노인복지 전용 변경
- [x] 기존 12개 분야 체크박스 제거 → 노인복지 5개 분야로 변경
- [x] 노인복지 이미지 2장 업로드 (히어로 + 안내 배너)
- [x] "에버윌은 노인복지를 위한 많은 노력과 지원으로 함께 하겠습니다" 문구 반영
- [x] DB 스키마에 elderly_poverty/elderly_biz/elderly_care/elderly_health/elderly_culture enum 추가
- [x] charityRouter.ts 카테고리 목록 업데이트
- [x] DB 마이그레이션 적용 완료

## 유류분 배제 문서 + 영상 증언 메뉴 추가
- [ ] 대시보드 메뉴에 "유류분 배제 문서" 메뉴 추가
- [ ] 유류분 배제 문서 페이지 생성 (기본 양식 + 자동 채움 + 빈칸 입력)
- [ ] 대시보드 메뉴에 "유류분 영상 증언" 메뉴 추가
- [ ] 유류분 영상 증언 페이지 생성
- [ ] 모든 서류 업로드 시 임시저장 기능 추가

## 유언 작성 흐름 개선 (2024-07-08)
- [x] 유언 작성 위저드 6단계 → 5단계로 변경 (개인인증 제거)
- [x] 1단계: 기본정보 확인 (소셜 로그인 정보 자동 채움) 신규 생성
- [x] Step1BasicInfo 컴포넌트 생성 (이름/연락처/주소/생년월일 자동 입력)
- [x] 전자유언인증을 유언 작성 흐름에서 분리 → 결제 후 별도 절차
- [x] 사이드바 메뉴 재구성: 유언 작성 단계 / 전자유언인증 / 멤버십 분리
- [x] 유언 작성 완료 시 전자유언인증 안내 배너 표시
