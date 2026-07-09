# 문제 분석: 유언장 수정 시 기존 데이터 사라짐

## 문제 1: 변호사 매칭 섹션
- 파일: client/src/pages/dashboard/WillsPage.tsx
- 상태: ✅ 삭제 완료

## 문제 2: 유언장 수정 시 기존 데이터 공란
- 원인: Step4Will.tsx의 handleComplete()에서 data에 {willContent, signature1, signature2}만 JSON으로 저장
- 기존에 Step10Sign에서 저장한 will 전체 데이터(testatorRRN, testatorName, testatorAddress 등)가 덮어씌워짐
- /write?willId=1로 수정 진입 시 existingWill.data를 파싱하면 testatorRRN 등이 없음

## 해결 방안
Step4Will.tsx에서:
1. willDetail.data 로드 시 JSON 파싱 시도 → willContent와 signature 분리
2. handleComplete() 시 기존 will data를 보존하고 willContent+signature만 merge하여 저장
3. handleSave() 시에도 기존 data를 보존

## 추가 문제: "연락싸" 오타
- 파일: client/src/components/write/steps/Step1Testator.tsx 라인 184
- "연락싸" → "연락처"로 수정 필요
