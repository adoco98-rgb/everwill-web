import { readFileSync } from 'fs';
const code = readFileSync('server/utils/certificatePdfGenerator.ts', 'utf8');
const lines = code.split('\n');
// new Promise((resolve, reject) => { 블록 내에서 await 찾기
let inSyncCallback = false;
let braceDepth = 0;
let promiseLine = -1;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // new Promise( 시작 (async 없는 경우)
  if (line.includes('new Promise(') && !line.includes('async (') && !line.includes('async(')) {
    inSyncCallback = true;
    braceDepth = 0;
    promiseLine = i + 1;
  }
  if (inSyncCallback) {
    braceDepth += (line.match(/{/g) || []).length;
    braceDepth -= (line.match(/}/g) || []).length;
    if (line.includes('await ') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      console.log(`Line ${i+1} (Promise started at ${promiseLine}): ${line.trim().substring(0, 100)}`);
    }
    if (braceDepth <= 0 && promiseLine > 0) {
      inSyncCallback = false;
      promiseLine = -1;
    }
  }
}
