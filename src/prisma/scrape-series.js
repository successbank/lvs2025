/**
 * 원소스(lvs.webmaker21.kr) 제품 시리즈 테이블 스크래핑 스크립트
 *
 * 사용법: docker exec lvs_app node prisma/scrape-series.js
 * 출력: prisma/series-data.json
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const http = require('http');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://lvs.webmaker21.kr';

// 21개 제품 URL 매핑 (uv-ir, shl-shl2, lv-4rbox, hpls-lsc-320, 광화이바 제외)
const PRODUCT_MAP = [
  // 일반조명 (ca_id 10xx)
  { slug: 'drt-drf-series',    id: 1,  ca_id: '1010', category: 'general' },
  { slug: 'dla2-dl-series',    id: 2,  ca_id: '1020', category: 'general' },
  { slug: 'db-db2-dbs-series', id: 14, ca_id: '1030', category: 'general' },
  { slug: 'ifrk-series',      id: 15, ca_id: '1040', category: 'general' },
  { slug: 'ila-series',       id: 16, ca_id: '1050', category: 'general' },
  { slug: 'idm-series',       id: 17, ca_id: '1060', category: 'general' },
  { slug: 'ifs-ifs2-series',  id: 18, ca_id: '1070', category: 'general' },
  { slug: 'ddm-series',       id: 19, ca_id: '1080', category: 'general' },
  { slug: 'icfv-series',      id: 20, ca_id: '1090', category: 'general' },
  { slug: 'svl-series',       id: 22, ca_id: '10b0', category: 'general' },
  // 파워서플라이 (ca_id 20xx)
  { slug: 'en-series', id: 24, ca_id: '2010', category: 'power' },
  { slug: 'es-series', id: 25, ca_id: '2020', category: 'power' },
  { slug: 'et-series', id: 26, ca_id: '2030', category: 'power' },
  { slug: 'pa-series', id: 27, ca_id: '2040', category: 'power' },
  { slug: 'dn-series', id: 28, ca_id: '2050', category: 'power' },
  { slug: 'ds-series', id: 29, ca_id: '2060', category: 'power' },
  // LED 라이트소스 (ca_id 30xx)
  { slug: 'hpls-lp30',     id: 30, ca_id: '3010', category: 'led' },
  { slug: 'hpls-cw50',     id: 31, ca_id: '3020', category: 'led' },
  { slug: 'hpls-s-fs50',   id: 32, ca_id: '3030', category: 'led' },
  { slug: 'hpls-cw150-v2', id: 48, ca_id: '3040', category: 'led' },
  { slug: 'hpls-rgb-v4',   id: 34, ca_id: '3050', category: 'led' },
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        } else {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

function parseTables(html, product) {
  const $ = cheerio.load(html);
  const series = [];

  // 시리즈명 위치 추출: "※ XXX Series List" 또는 "※ XXX List" 텍스트
  const seriesNames = [];
  const nameRegex = /※\s*([^\n<]+(?:Series List|List))/g;
  let nameMatch;
  while ((nameMatch = nameRegex.exec(html)) !== null) {
    let name = nameMatch[1].trim();
    // "XXX List" → "XXX Series List"로 정규화
    if (!name.includes('Series')) {
      name = name.replace(' List', ' Series List');
    }
    seriesNames.push({ name, pos: nameMatch.index });
  }

  // 테이블 위치 추출
  const tablePositions = [];
  const tableRegex = /<table[^>]*>/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(html)) !== null) {
    tablePositions.push(tableMatch.index);
  }

  // bbs_content 내의 테이블들을 찾음
  const tables = $('table').toArray();
  let usedNames = new Set();

  for (let i = 0; i < tables.length; i++) {
    const table = $(tables[i]);
    const headerRow = table.find('tr').first();
    const headerCells = headerRow.find('td');

    // 헤더에 "No."와 "Model Name"이 있는 테이블만 처리
    const firstHeader = headerCells.first().text().trim();
    if (firstHeader !== 'No.') continue;

    // 이 테이블의 HTML 위치 찾기
    const tablePos = tablePositions[i] || 0;

    // 이 테이블 바로 앞에 있는 시리즈명 찾기 (위치 기준)
    let seriesName = '';
    for (let j = seriesNames.length - 1; j >= 0; j--) {
      if (seriesNames[j].pos < tablePos && !usedNames.has(seriesNames[j].name)) {
        seriesName = seriesNames[j].name;
        usedNames.add(seriesName);
        break;
      }
    }

    // 시리즈명이 없으면 — 모델명 접두사에서 유도 또는 slug에서 유도
    if (!seriesName) {
      // 첫 번째 데이터 행의 모델명에서 시리즈 접두사 추출 (예: LV-DRF-42R → DRF)
      const firstDataRow = table.find('tr').eq(1);
      const firstModel = firstDataRow.find('td').eq(1).text().trim();
      const modelMatch = firstModel.match(/^LV[S]?-([A-Z0-9]+)/i);
      if (modelMatch) {
        seriesName = modelMatch[1].toUpperCase() + ' Series List';
      } else {
        const slugParts = product.slug.replace(/-series$/, '').toUpperCase().split('-');
        seriesName = slugParts.join(' ') + ' Series List';
      }
    }

    // 컬럼 헤더 추출
    const columns = [];
    headerCells.each((_, cell) => {
      let text = $(cell).html();
      // <br> → \n 변환 후 텍스트 추출
      text = text.replace(/<br\s*\/?>/gi, '\n');
      text = cheerio.load(text).text().trim();
      // 여러 줄이면 / 로 결합
      text = text.split('\n').map(s => s.trim()).filter(Boolean).join(' / ');
      columns.push(text);
    });

    // 데이터 행 추출
    const rows = [];
    const pdfFiles = [];
    const dataRows = table.find('tr').slice(1);

    dataRows.each((_, row) => {
      const cells = $(row).find('td');
      const rowData = [];
      let rowPdf = '';

      cells.each((colIdx, cell) => {
        const $cell = $(cell);

        // PDF 링크 확인
        const pdfLink = $cell.find('a[href*=".pdf"]');
        if (pdfLink.length > 0) {
          rowPdf = pdfLink.attr('href');
          rowData.push(rowPdf);
          return;
        }

        // DWG/다운로드 링크 확인
        const dwgLink = $cell.find('a[href*=".dwg"], a[href*="sub06"], a[href*="download"]');
        if (dwgLink.length > 0) {
          rowData.push(dwgLink.attr('href'));
          return;
        }

        // 일반 텍스트 — <br>을 \n으로 변환, 여러 공백 정리
        let text = $cell.html() || '';
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = cheerio.load(text).text();
        // 여러 공백/줄바꿈 정리
        text = text.split('\n').map(s => s.trim()).filter(Boolean).join('\n');
        text = text.trim();
        rowData.push(text);
      });

      // rowspan 셀이 있으면 DWG 열이 비어있을 수 있음 — 그대로 유지
      if (rowData.length > 0 && rowData[0]) {
        rows.push(rowData);
        if (rowPdf) pdfFiles.push(rowPdf);
      }
    });

    if (rows.length > 0) {
      series.push({
        name: seriesName,
        columns,
        rows,
        pdfFiles,
      });
    }
  }

  return series;
}

async function main() {
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const product of PRODUCT_MAP) {
    const url = `${BASE_URL}/ko/sub01/view.php?id=${product.id}&ca_id=${product.ca_id}`;

    try {
      console.log(`스크래핑: ${product.slug} (${url})`);
      const html = await fetchPage(url);
      const series = parseTables(html, product);

      if (series.length > 0) {
        results.push({
          slug: product.slug,
          category: product.category,
          data: { series },
        });
        console.log(`  ✅ ${series.length}개 시리즈, ${series.reduce((sum, s) => sum + s.rows.length, 0)}개 행`);
        successCount++;
      } else {
        console.log(`  ⚠️  테이블 없음`);
      }
    } catch (err) {
      console.error(`  ❌ 오류: ${err.message}`);
      errorCount++;
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  // 결과 저장
  const outputPath = path.join(__dirname, 'series-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n========================================`);
  console.log(`완료: ${successCount}개 성공, ${errorCount}개 오류`);
  console.log(`출력: ${outputPath}`);
  console.log(`총 제품: ${results.length}개`);
  console.log(`총 시리즈: ${results.reduce((sum, r) => sum + r.data.series.length, 0)}개`);
}

main().catch(console.error);
