import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB per file
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'pdfs');

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'PDF 파일이 필요합니다.' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const results = [];

    for (const file of files) {
      if (typeof file === 'string') continue;

      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `"${file.name}"은(는) PDF 파일이 아닙니다.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `"${file.name}" 파일 크기가 20MB를 초과합니다.` },
          { status: 400 }
        );
      }

      const random = Math.random().toString(36).substring(2, 8);
      const filename = `pdf-${Date.now()}-${random}.pdf`;
      const buffer = Buffer.from(await file.arrayBuffer());

      await writeFile(path.join(UPLOAD_DIR, filename), buffer);

      results.push({
        url: `/uploads/pdfs/${filename}`,
        filename,
        originalName: file.name,
        size: file.size,
      });
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    console.error('PDF Upload Error:', error);
    return NextResponse.json({ error: 'PDF 업로드에 실패했습니다.' }, { status: 500 });
  }
}
