#!/usr/bin/env node
/**
 * post_attachments.file_size 값을 실제 파일 크기로 재계산한다.
 *
 * 배경: 마이그레이션 시 file_size가 실제 파일을 읽지 않고 하드코딩된
 * 2의 거듭제곱 값(4194304, 3670016 등)으로 삽입되었다. 이로 인해
 * 다운로드 API가 Content-Length 헤더에 실제 본문과 다른 값을 세팅하여
 * HTTP/2 스트림이 INTERNAL_ERROR로 끊겼다.
 *
 * 실행 (컨테이너 내부):
 *   node database/fix-attachment-file-sizes.js
 *   node database/fix-attachment-file-sizes.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DRY_RUN = process.argv.includes('--dry-run');
const APP_ROOT = '/app';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { rows } = await pool.query(
      'SELECT id, file_path, file_size FROM post_attachments ORDER BY id'
    );

    console.log(`총 ${rows.length}개 첨부파일 레코드 조회됨${DRY_RUN ? ' (dry-run)' : ''}`);
    console.log('='.repeat(80));

    let updated = 0;
    let unchanged = 0;
    let missing = 0;
    const missingList = [];

    for (const row of rows) {
      const absPath = path.join(APP_ROOT, row.file_path);

      if (!fs.existsSync(absPath)) {
        missing++;
        missingList.push({ id: row.id, file_path: row.file_path });
        console.log(`[MISSING] ${row.id}  ${row.file_path}`);
        continue;
      }

      const stat = fs.statSync(absPath);
      const realSize = stat.size;
      const dbSize = Number(row.file_size);

      if (realSize === dbSize) {
        unchanged++;
        continue;
      }

      console.log(
        `[FIX] ${row.id}  DB=${dbSize} → 실제=${realSize}  (${row.file_path})`
      );

      if (!DRY_RUN) {
        await pool.query(
          'UPDATE post_attachments SET file_size = $1 WHERE id = $2',
          [realSize, row.id]
        );
      }
      updated++;
    }

    console.log('='.repeat(80));
    console.log(`요약: ${DRY_RUN ? '업데이트 예정' : '업데이트됨'}=${updated}, 변경없음=${unchanged}, 파일누락=${missing}`);

    if (missingList.length > 0) {
      console.log('\n누락된 파일 목록:');
      for (const item of missingList) {
        console.log(`  - ${item.id}: ${item.file_path}`);
      }
    }
  } catch (err) {
    console.error('오류:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
