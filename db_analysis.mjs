import mysql from 'mysql2/promise';
import { readFileSync, writeFileSync } from 'fs';

// .env 수동 파싱
const envContent = readFileSync('/home/ubuntu/saram-will/.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}
const DB_URL = envVars['DATABASE_URL'];
if (!DB_URL) { console.error('DATABASE_URL not found'); process.exit(1); }

const conn = await mysql.createConnection(DB_URL);

// 1. 전체 사용자 목록
const [users] = await conn.execute(`
  SELECT id, name, email, loginMethod, memberGrade, country, profileCompleted,
         phone, birthDate, referralCode, referredBy, pointBalance,
         agreeMarketing, createdAt, lastSignedIn
  FROM users ORDER BY createdAt DESC
`);

// 2. 결제 현황
const [payments] = await conn.execute(`
  SELECT p.id, p.userId, p.amount, p.currency, p.status, p.productType, p.createdAt,
         u.name as userName, u.email as userEmail
  FROM payments p LEFT JOIN users u ON p.userId = u.id
  ORDER BY p.createdAt DESC
`);

// 3. 유언장 현황
const [wills] = await conn.execute(`
  SELECT w.id, w.userId, w.status, w.willType, w.title, w.createdAt,
         u.name as userName, u.email as userEmail
  FROM wills w LEFT JOIN users u ON w.userId = u.id
  ORDER BY w.createdAt DESC
`);

// 4. 상속인 수
const [heirs] = await conn.execute(`SELECT COUNT(*) as cnt FROM heirs`);

// 5. 자산 유형별
const [assets] = await conn.execute(`SELECT assetType, COUNT(*) as cnt FROM assets GROUP BY assetType`);

// 6. 문의 현황
const [inquiries] = await conn.execute(`SELECT status, COUNT(*) as cnt FROM inquiries GROUP BY status`);

// 7. 전문가 파트너
let experts = [];
try {
  const [r] = await conn.execute(`SELECT status, COUNT(*) as cnt FROM expertPartners GROUP BY status`);
  experts = r;
} catch(e) {}

// 8. 로그인 방법별
const [loginMethods] = await conn.execute(`SELECT loginMethod, COUNT(*) as cnt FROM users GROUP BY loginMethod`);

// 9. 회원 등급별
const [grades] = await conn.execute(`SELECT memberGrade, COUNT(*) as cnt FROM users GROUP BY memberGrade`);

// 10. 국가별
const [countries] = await conn.execute(`SELECT country, COUNT(*) as cnt FROM users GROUP BY country ORDER BY cnt DESC`);

// 11. 추천인 현황
const [referrals] = await conn.execute(`SELECT COUNT(*) as cnt FROM users WHERE referredBy IS NOT NULL AND referredBy != ''`);

// 12. 영상 유언
let videoWills = [{cnt:0}];
try {
  const [r] = await conn.execute(`SELECT COUNT(*) as cnt FROM videoWills`);
  videoWills = r;
} catch(e) {}

// 13. 유언 인증서
let certs = [];
try {
  const [r] = await conn.execute(`SELECT status, COUNT(*) as cnt FROM willCertificates GROUP BY status`);
  certs = r;
} catch(e) {}

// 14. 최근 7일 신규 가입
const [recent7] = await conn.execute(`SELECT COUNT(*) as cnt FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
const [recent30] = await conn.execute(`SELECT COUNT(*) as cnt FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);

await conn.end();

const result = {
  summary: {
    totalUsers: users.length,
    newLast7Days: recent7[0].cnt,
    newLast30Days: recent30[0].cnt,
    totalPayments: payments.length,
    totalRevenue: payments.reduce((s, p) => s + (Number(p.amount)||0), 0),
    totalWills: wills.length,
    totalHeirs: heirs[0].cnt,
    totalReferrals: referrals[0].cnt,
    totalVideoWills: videoWills[0].cnt,
    totalCerts: certs.reduce((s, c) => s + Number(c.cnt), 0),
  },
  users,
  payments,
  wills,
  assets,
  inquiries,
  experts,
  loginMethods,
  grades,
  countries,
  certs,
};

writeFileSync('/home/ubuntu/saram_db_result.json', JSON.stringify(result, null, 2));
console.log('완료!');
console.log(JSON.stringify(result.summary, null, 2));
console.log('\n=== 사용자 목록 ===');
for (const u of users) {
  console.log(`[${u.id}] ${u.name||'(이름없음)'} | ${u.email||'(이메일없음)'} | ${u.loginMethod} | ${u.memberGrade} | ${u.country} | 가입: ${u.createdAt}`);
}
console.log('\n=== 유언장 목록 ===');
for (const w of wills) {
  console.log(`[${w.id}] ${w.userName} | ${w.willType} | ${w.status} | ${w.createdAt}`);
}
console.log('\n=== 결제 목록 ===');
for (const p of payments) {
  console.log(`[${p.id}] ${p.userName} | ${p.amount} ${p.currency} | ${p.status} | ${p.productType} | ${p.createdAt}`);
}
