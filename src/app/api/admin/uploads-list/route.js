import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { readdir, stat } from 'fs/promises';
import path from 'path';

// GET /api/admin/uploads-list?subDir=downloads&q=IFSM
// 업로드 디렉토리의 실제 디스크 파일 목록 (broken 첨부 정정용 후보)
// 선택적 q로 부분 일치 필터
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

    const files = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (q && !entry.name.toLowerCase().includes(q)) continue;
      try {
        const st = await stat(path.join(baseDir, entry.name));
        files.push({
          name: entry.name,
          file_path: `/uploads/${subDir}/${entry.name}`,
          file_size: st.size,
          mtime: st.mtimeMs,
        });
      } catch {
        // 파일 stat 실패는 스킵
      }
    }
    files.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ files: files.slice(0, 200) });
  } catch (error) {
    console.error('uploads-list GET error:', error);
    return NextResponse.json({ error: '디렉토리 조회에 실패했습니다.' }, { status: 500 });
  }
}
