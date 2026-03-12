#!/usr/bin/env node
/**
 * LVS 기존 사이트 자료실 → 새 사이트 마이그레이션 스크립트
 *
 * 기존 사이트(lvs.webmaker21.kr)에서 실제 파일을 다운로드하여
 * 새 사이트의 더미 파일을 교체하고 DB 레코드를 갱신합니다.
 *
 * 사용법 (Docker 컨테이너 내부):
 *   node database/migrate-old-downloads.js <ID> <PW>
 *
 * 호스트에서:
 *   docker exec lvs_app node database/migrate-old-downloads.js <ID> <PW>
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// ─── 설정 ────────────────────────────────────────
const OLD_SITE = 'lvs.webmaker21.kr';
const LOGIN_PATH = '/ko/member/login_check.php';
const LOGIN_PAGE = '/ko/member/login.php';
const DOWNLOAD_PAGE = '/ko/sub06/02.php';
const DOWNLOAD_BASE = '/ksboard/skin/down/basic/download.php';
const UPLOAD_DIR = '/app/uploads/downloads';
const TOTAL_PAGES = 7;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT_INTERNAL || '5432'),
  database: process.env.DB_NAME || 'lvs_db',
  user: process.env.DB_USER || 'lvs_user',
  password: process.env.DB_PASSWORD || 'lvs_password',
};

// ─── HTTP 유틸리티 ────────────────────────────────

function httpGet(hostname, path, cookies = '', followRedirects = true) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (compatible; LVS-Migration/1.0)',
      },
    };
    const req = http.request(options, (res) => {
      if (followRedirects && (res.statusCode === 301 || res.statusCode === 302)) {
        const redirectUrl = new URL(res.headers.location, `http://${hostname}`);
        return httpGet(redirectUrl.hostname, redirectUrl.pathname + redirectUrl.search, cookies)
          .then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.end();
  });
}

function httpPost(hostname, path, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const postData = typeof data === 'string' ? data : new URLSearchParams(data).toString();
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': cookies,
        'Referer': `http://${hostname}/ko/member/login.php`,
        'User-Agent': 'Mozilla/5.0 (compatible; LVS-Migration/1.0)',
      },
    };
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf-8'),
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(postData);
    req.end();
  });
}

function httpDownload(hostname, path, cookies, savePath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (compatible; LVS-Migration/1.0)',
      },
    };
    const req = http.request(options, (res) => {
      // 리다이렉트 처리
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = new URL(res.headers.location, `http://${hostname}`);
        return httpDownload(redirectUrl.hostname, redirectUrl.pathname + redirectUrl.search, cookies, savePath)
          .then(resolve).catch(reject);
      }

      // Content-Disposition에서 파일명 추출
      const disposition = res.headers['content-disposition'] || '';
      let filename = '';

      // RFC 5987 형식: filename*=UTF-8''encoded_name
      const utf8Match = disposition.match(/filename\*=(?:UTF-8|utf-8)''(.+)/i);
      if (utf8Match) {
        filename = decodeURIComponent(utf8Match[1]);
      }
      // 일반 형식: filename="name" 또는 filename=name
      if (!filename) {
        const basicMatch = disposition.match(/filename[^;=\n]*=\s*["']?([^"';\n]+)/i);
        if (basicMatch) {
          filename = basicMatch[1].trim();
          // EUC-KR로 인코딩된 경우 처리 시도
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            // 이미 디코딩됨
          }
        }
      }

      const contentType = res.headers['content-type'] || '';
      const contentLength = parseInt(res.headers['content-length'] || '0');

      // HTML 응답이면 다운로드 실패 (에러 페이지)
      if (contentType.includes('text/html') && contentLength < 2000) {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          if (body.includes('alert') || body.includes('로그인')) {
            resolve({ success: false, error: 'Auth required or file not found' });
          } else {
            resolve({ success: false, error: 'Received HTML instead of file' });
          }
        });
        return;
      }

      const writeStream = fs.createWriteStream(savePath);
      let downloadedSize = 0;

      res.on('data', (chunk) => {
        downloadedSize += chunk.length;
        writeStream.write(chunk);
      });

      res.on('end', () => {
        writeStream.end();
        resolve({
          success: downloadedSize > 500,
          filename,
          contentType,
          fileSize: downloadedSize,
          savePath,
        });
      });

      res.on('error', (err) => {
        writeStream.end();
        reject(err);
      });
    });
    req.on('error', reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('Download timeout')); });
    req.end();
  });
}

// 쿠키 문자열에서 값 파싱
function parseCookies(headers) {
  const cookies = {};
  const setCookies = headers['set-cookie'] || [];
  (Array.isArray(setCookies) ? setCookies : [setCookies]).forEach(c => {
    const parts = c.split(';')[0].split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return cookies;
}

function cookieString(cookies) {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

// ─── Step 1: 로그인 ─────────────────────────────

async function login(id, pwd) {
  console.log('📌 Step 1: 기존 사이트 로그인...');

  // 먼저 로그인 페이지에서 세션 쿠키 획득
  const loginPageRes = await httpGet(OLD_SITE, LOGIN_PAGE);
  const sessionCookies = parseCookies(loginPageRes.headers);
  console.log(`  세션 쿠키 획득: PHPSESSID=${sessionCookies.PHPSESSID ? '✓' : '✗'}`);

  // 로그인 POST — 수동 URL 인코딩 (URLSearchParams가 특수문자 처리 불완전)
  const postBody = `id=${encodeURIComponent(id)}&pwd=${encodeURIComponent(pwd)}`;
  const loginRes = await httpPost(OLD_SITE, LOGIN_PATH, postBody, cookieString(sessionCookies));

  // 로그인 후 추가 쿠키 병합
  const newCookies = parseCookies(loginRes.headers);
  const allCookies = { ...sessionCookies, ...newCookies };

  // 성공 확인: location.href가 있으면 성공
  if (loginRes.body.includes("location.href")) {
    console.log('  ✅ 로그인 성공!');
    return cookieString(allCookies);
  }

  if (loginRes.body.includes('확인해 주세요')) {
    throw new Error('로그인 실패: 아이디나 비밀번호를 확인해 주세요.');
  }

  throw new Error('로그인 실패: 알 수 없는 응답');
}

// ─── Step 2: 페이지 스크래핑 ────────────────────

function parseDownloadPage(html) {
  const items = [];

  // 제목 추출 (faq_q div 내용)
  const titleRegex = /class="faq_q"[^>]*>\s*([\s\S]*?)\s*<\/div>/g;
  const titles = [];
  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    let title = match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    // 끝의 특수 공백 문자 제거
    title = title.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]+$/g, '').trim();
    titles.push(title);
  }

  // 다운로드 URL 추출 (bid=1&id=X&file=N)
  const urlRegex = /download\.php\?bid=1&(?:amp;)?id=(\d+)&(?:amp;)?file=(\d+)/g;
  const urls = [];
  const seen = new Set();
  while ((match = urlRegex.exec(html)) !== null) {
    const key = `${match[1]}:${match[2]}`;
    if (!seen.has(key)) {
      seen.add(key);
      urls.push({ id: parseInt(match[1]), fileNum: parseInt(match[2]) });
    }
  }

  // 파일명 추출 (해당 관련 파일 링크 텍스트)
  const fileRegex = /해당 관련 파일\s*:\s*<a[^>]*>\s*([^<]+)/g;
  const filenames = [];
  while ((match = fileRegex.exec(html)) !== null) {
    filenames.push(match[1].trim());
  }

  // 제목별로 URL과 파일명 그룹화
  let urlIdx = 0;
  let fnIdx = 0;

  for (let i = 0; i < titles.length; i++) {
    const item = {
      title: titles[i],
      files: [],
    };

    // 이 항목의 다운로드 URL 찾기 (같은 id를 가진 URL들)
    if (urlIdx < urls.length) {
      const currentId = urls[urlIdx].id;
      while (urlIdx < urls.length && urls[urlIdx].id === currentId) {
        const fn = fnIdx < filenames.length ? filenames[fnIdx] : '';
        item.files.push({
          oldId: urls[urlIdx].id,
          fileNum: urls[urlIdx].fileNum,
          filename: fn,
          downloadPath: `${DOWNLOAD_BASE}?bid=1&id=${urls[urlIdx].id}&file=${urls[urlIdx].fileNum}`,
        });
        urlIdx++;
        fnIdx++;
      }
    }

    items.push(item);
  }

  return items;
}

async function scrapeAllPages(cookies) {
  console.log('\n📌 Step 2: 기존 사이트 자료실 페이지 스크래핑...');
  const allItems = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const url = `${DOWNLOAD_PAGE}?page=${page}`;
    const res = await httpGet(OLD_SITE, url, cookies);
    const html = res.body.toString('utf-8');
    const items = parseDownloadPage(html);

    console.log(`  페이지 ${page}: ${items.length}개 항목 발견`);
    items.forEach((item, idx) => {
      const num = allItems.length + idx + 1;
      const fileInfo = item.files.map(f => `file=${f.fileNum}`).join(', ');
      console.log(`    ${String(num).padStart(2, '0')}. [id=${item.files[0]?.oldId || '?'}] ${item.title.substring(0, 60)} (${fileInfo})`);
    });

    allItems.push(...items);
  }

  console.log(`\n  총 ${allItems.length}개 항목 발견`);
  return allItems;
}

// ─── Step 3: 파일 다운로드 ──────────────────────

async function downloadAllFiles(items, cookies) {
  console.log('\n📌 Step 3: 파일 다운로드...');

  // uploads 디렉토리 확인
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const postNum = String(i + 1).padStart(3, '0');
    const postId = `post-download-${postNum}`;

    console.log(`\n  [${postNum}/063] ${item.title.substring(0, 50)}`);

    const fileResults = [];

    for (let f = 0; f < item.files.length; f++) {
      const file = item.files[f];
      const attachSuffix = item.files.length > 1 ? `-${f + 1}` : '';
      const attachId = `attachment-download-${postNum}${attachSuffix}`;

      // 임시 파일로 다운로드
      const tempPath = path.join(UPLOAD_DIR, `_temp_${postNum}_${f + 1}`);

      try {
        console.log(`    파일 ${f + 1}: ${file.downloadPath}`);
        const dlResult = await httpDownload(OLD_SITE, file.downloadPath, cookies, tempPath);

        if (!dlResult.success) {
          console.log(`    ❌ 다운로드 실패: ${dlResult.error || '알 수 없는 오류'}`);
          failCount++;
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          fileResults.push({ ...file, attachId, success: false });
          continue;
        }

        // 실제 파일명 결정
        let finalFilename = dlResult.filename || file.filename || `download_${postNum}_${f + 1}`;
        // 파일명에서 위험한 문자 제거
        finalFilename = finalFilename.replace(/[\/\\:*?"<>|]/g, '_');

        const finalPath = path.join(UPLOAD_DIR, finalFilename);

        // 기존 파일 삭제 후 이동
        if (fs.existsSync(finalPath) && finalPath !== tempPath) {
          fs.unlinkSync(finalPath);
        }
        fs.renameSync(tempPath, finalPath);

        const fileSize = fs.statSync(finalPath).size;
        const mimeType = finalFilename.endsWith('.pdf') ? 'application/pdf' :
                         finalFilename.endsWith('.zip') ? 'application/zip' :
                         'application/octet-stream';

        console.log(`    ✅ ${finalFilename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
        successCount++;

        fileResults.push({
          ...file,
          attachId,
          success: true,
          finalFilename,
          finalPath,
          fileSize,
          mimeType,
          filePath: `/uploads/downloads/${finalFilename}`,
        });
      } catch (err) {
        console.log(`    ❌ 오류: ${err.message}`);
        failCount++;
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        fileResults.push({ ...file, attachId, success: false, error: err.message });
      }

      // 요청 간 딜레이 (서버 부하 방지)
      await new Promise(r => setTimeout(r, 500));
    }

    results.push({
      postId,
      title: item.title,
      files: fileResults,
    });
  }

  console.log(`\n  다운로드 완료: ✅ ${successCount}개 성공, ❌ ${failCount}개 실패`);
  return results;
}

// ─── Step 4: DB 갱신 ────────────────────────────

async function updateDatabase(results) {
  console.log('\n📌 Step 4: 데이터베이스 갱신...');

  const pool = new Pool(DB_CONFIG);
  let titleUpdated = 0;
  let attachUpdated = 0;
  let errors = 0;

  try {
    for (const item of results) {
      // 제목 업데이트 (기존 사이트의 전체 모델명 포함 제목으로)
      try {
        const titleResult = await pool.query(
          'UPDATE posts SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.title, item.postId]
        );
        if (titleResult.rowCount > 0) titleUpdated++;
      } catch (err) {
        console.log(`    ❌ 제목 갱신 실패 [${item.postId}]: ${err.message}`);
        errors++;
      }

      // 첨부파일 업데이트
      for (const file of item.files) {
        if (!file.success) continue;

        try {
          const attachResult = await pool.query(
            `UPDATE post_attachments
             SET filename = $1,
                 original_filename = $2,
                 file_path = $3,
                 file_size = $4,
                 mime_type = $5
             WHERE id = $6`,
            [
              file.finalFilename,
              file.finalFilename,
              file.filePath,
              file.fileSize,
              file.mimeType,
              file.attachId,
            ]
          );
          if (attachResult.rowCount > 0) {
            attachUpdated++;
          } else {
            console.log(`    ⚠️ 첨부파일 레코드 없음: ${file.attachId}`);
          }
        } catch (err) {
          console.log(`    ❌ 첨부파일 갱신 실패 [${file.attachId}]: ${err.message}`);
          errors++;
        }
      }
    }

    console.log(`\n  DB 갱신 완료: 제목 ${titleUpdated}개, 첨부파일 ${attachUpdated}개 업데이트, ${errors}개 오류`);
  } finally {
    await pool.end();
  }

  return { titleUpdated, attachUpdated, errors };
}

// ─── Step 5: 더미 파일 정리 ─────────────────────

function cleanupDummyFiles() {
  console.log('\n📌 Step 5: 더미 파일 정리...');

  if (!fs.existsSync(UPLOAD_DIR)) return;

  const files = fs.readdirSync(UPLOAD_DIR);
  let dummyCount = 0;

  for (const file of files) {
    const filePath = path.join(UPLOAD_DIR, file);
    const stat = fs.statSync(filePath);

    // 500바이트 이하인 파일은 더미로 판단 (다운로드 실패한 항목)
    if (stat.size < 500 && !file.startsWith('_temp_')) {
      console.log(`  🗑️  더미 유지: ${file} (${stat.size} bytes)`);
      dummyCount++;
    }
  }

  if (dummyCount > 0) {
    console.log(`  ⚠️ ${dummyCount}개 더미 파일이 남아있습니다 (다운로드 실패 항목)`);
  } else {
    console.log('  ✅ 모든 파일이 정상입니다');
  }
}

// ─── Step 6: 검증 ───────────────────────────────

async function verify() {
  console.log('\n📌 Step 6: 검증...');

  const pool = new Pool(DB_CONFIG);

  try {
    // 파일 시스템 검증
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => !f.startsWith('_temp_'));
    const realFiles = files.filter(f => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, f));
      return stat.size > 1024; // 1KB 이상
    });
    console.log(`  파일: ${realFiles.length}/${files.length}개가 1KB 이상 (실제 파일)`);

    // DB 검증
    const dbResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN file_size > 1024 THEN 1 END) as real_files,
        COUNT(CASE WHEN file_size <= 500 THEN 1 END) as dummy_files
      FROM post_attachments
      WHERE post_id LIKE 'post-download-%'
    `);
    const row = dbResult.rows[0];
    console.log(`  DB: 총 ${row.total}개 레코드, ${row.real_files}개 실제 크기, ${row.dummy_files}개 더미`);

    // 파일-DB 불일치 확인
    const mismatchResult = await pool.query(`
      SELECT pa.id, pa.filename, pa.file_size
      FROM post_attachments pa
      WHERE pa.post_id LIKE 'post-download-%'
      AND pa.file_size > 1024
      ORDER BY pa.id
      LIMIT 5
    `);
    console.log('\n  샘플 레코드 (상위 5개):');
    for (const row of mismatchResult.rows) {
      const filePath = path.join(UPLOAD_DIR, row.filename);
      const exists = fs.existsSync(filePath);
      const realSize = exists ? fs.statSync(filePath).size : 0;
      const match = realSize === parseInt(row.file_size);
      console.log(`    ${row.id}: ${row.filename} | DB: ${row.file_size} | 실제: ${realSize} | ${match ? '✅' : '❌'}`);
    }
  } finally {
    await pool.end();
  }
}

// ─── 메인 ───────────────────────────────────────

async function main() {
  // 환경변수 또는 명령줄 인자에서 로그인 정보 획득
  const userId = process.env.OLD_SITE_ID || process.argv[2];
  const userPwd = process.env.OLD_SITE_PW || process.argv[3];

  if (!userId || !userPwd) {
    console.log('사용법:');
    console.log('  환경변수: OLD_SITE_ID=xxx OLD_SITE_PW=yyy node migrate-old-downloads.js');
    console.log('  또는 인자: node migrate-old-downloads.js <ID> <PW>');
    process.exit(1);
  }

  // 백슬래시 이스케이프 제거 (shell에서 추가될 수 있음)
  const cleanPwd = userPwd.replace(/\\/g, '');

  console.log('═══════════════════════════════════════════');
  console.log('  LVS 자료실 마이그레이션 스크립트');
  console.log('═══════════════════════════════════════════');
  console.log(`  대상: ${OLD_SITE}`);
  console.log(`  저장: ${UPLOAD_DIR}`);
  console.log(`  계정: ${userId}`);
  console.log('');

  const startTime = Date.now();

  try {
    // Step 1: 로그인
    const cookies = await login(userId, cleanPwd);

    // Step 2: 페이지 스크래핑
    const items = await scrapeAllPages(cookies);

    if (items.length === 0) {
      throw new Error('스크래핑된 항목이 없습니다. 로그인 상태를 확인하세요.');
    }

    if (items.length !== 63) {
      console.log(`  ⚠️ 예상 63개 항목이지만 ${items.length}개 발견. 계속 진행합니다.`);
    }

    // Step 3: 파일 다운로드
    const results = await downloadAllFiles(items, cookies);

    // Step 4: DB 갱신
    const dbStats = await updateDatabase(results);

    // Step 5: 더미 파일 정리
    cleanupDummyFiles();

    // Step 6: 검증
    await verify();

    // 최종 리포트
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const totalFiles = results.reduce((sum, r) => sum + r.files.length, 0);
    const successFiles = results.reduce((sum, r) => sum + r.files.filter(f => f.success).length, 0);

    console.log('\n═══════════════════════════════════════════');
    console.log('  마이그레이션 완료 리포트');
    console.log('═══════════════════════════════════════════');
    console.log(`  소요 시간: ${elapsed}초`);
    console.log(`  게시물 수: ${results.length}개`);
    console.log(`  파일 다운로드: ${successFiles}/${totalFiles}개 성공`);
    console.log(`  DB 제목 갱신: ${dbStats.titleUpdated}개`);
    console.log(`  DB 첨부파일 갱신: ${dbStats.attachUpdated}개`);
    console.log(`  오류: ${dbStats.errors}개`);
    console.log('═══════════════════════════════════════════');

    // 실패한 항목 목록
    const failedItems = results.filter(r => r.files.some(f => !f.success));
    if (failedItems.length > 0) {
      console.log('\n  ❌ 다운로드 실패 항목:');
      for (const item of failedItems) {
        const failedFiles = item.files.filter(f => !f.success);
        for (const f of failedFiles) {
          console.log(`    ${item.postId}: ${f.filename || f.downloadPath} - ${f.error || '실패'}`);
        }
      }
    }

  } catch (err) {
    console.error(`\n❌ 치명적 오류: ${err.message}`);
    process.exit(1);
  }
}

main();
