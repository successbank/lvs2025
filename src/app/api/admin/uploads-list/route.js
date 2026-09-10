import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import iconv from 'iconv-lite';

// 디스크 파일명 mojibake 처리:
// 일부 파일이 EUC-KR/CP949 raw bytes → latin1로 잘못 해석 → UTF-8로 인코딩되어 저장됨
// (예: "취부도" → ÃëºÎµµ → c3 83 c3 ab c2 ba ... )
// 한글이 정상이면 그대로, mojibake 의심이면 디코드 시도하여 표시명 산출.
function decodeDisplayName(rawName) {
  // 정상 한글 포함이면 그대로
  if (/[가-힯]/.test(rawName)) return rawName;
  // ASCII만 있으면 그대로
  if (/^[\x00-\x7F]+$/.test(rawName)) return rawName;

  // mojibake 의심: UTF-8 string의 codepoint를 latin1 byte로 보고 cp949 디코드
  try {
    const latin1Bytes = Buffer.from(rawName, 'latin1');
    const decoded = iconv.decode(latin1Bytes, 'cp949');
    // 디코드 결과에 한글이 등장하면 성공
    if (/[가-힯]/.test(decoded)) return decoded;
  } catch {}
  return rawName;
}

// GET /api/admin/uploads-list?subDir=downloads&q=IFSM
// 업로드 디렉토리의 실제 디스크 파일 목록 (broken 첨부 정정용 후보)
// 선택적 q로 부분 일치 필터 — q는 디코드된 표시명 또는 raw name 모두 매칭
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subDir = (searchParams.get('subDir') || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!subDir) {
      return NextResponse.json({ error: 'subDir 파라미터가 필요합니다.' }, { status: 400 });
    }

    const baseDir = path.join('/app', 'uploads', subDir);
    let entries;
    try {
      entries = await readdir(baseDir, { withFileTypes: true });
    } catch {
      return NextResponse.json({ files: [] });
    }

    // 앱 업로드는 <subDir>/<yyyymm>/ 하위에 저장되므로(saveAttachmentsToDisk)
    // 1단계 flat 레거시 파일 + 2단계 yyyymm 하위 파일을 모두 후보로 노출한다.
    const files = [];

    const collect = async (dirEntries, relPrefix) => {
      for (const entry of dirEntries) {
        if (!entry.isFile()) continue;
        const rawName = entry.name;
        const displayName = decodeDisplayName(rawName);
        if (q) {
          const haystack = (rawName + ' ' + displayName).toLowerCase();
          if (!haystack.includes(q)) continue;
        }
        try {
          const st = await stat(path.join(baseDir, relPrefix, rawName));
          files.push({
            name: relPrefix ? `${relPrefix}/${displayName}` : displayName, // 사용자 표시용 (한글 디코드됨)
            raw_name: rawName !== displayName ? rawName : undefined,
            // DB 매칭용 (raw) — 하위 디렉토리를 포함한 실제 경로
            file_path: `/uploads/${subDir}${relPrefix ? '/' + relPrefix : ''}/${rawName}`,
            file_size: st.size,
            mtime: st.mtimeMs,
          });
        } catch {
          // 파일 stat 실패는 스킵
        }
      }
    };

    await collect(entries, '');

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const subEntries = await readdir(path.join(baseDir, entry.name), { withFileTypes: true });
        await collect(subEntries, entry.name);
      } catch {
        // 하위 디렉토리 조회 실패는 스킵
      }
    }

    // 최근 파일이 위로 오도록 (정정 후보는 대개 최근 업로드본)
    files.sort((a, b) => b.mtime - a.mtime || a.name.localeCompare(b.name, 'ko'));

    return NextResponse.json({ files: files.slice(0, 200) });
  } catch (error) {
    console.error('uploads-list GET error:', error);
    return NextResponse.json({ error: '디렉토리 조회에 실패했습니다.' }, { status: 500 });
  }
}
