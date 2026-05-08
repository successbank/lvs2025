import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const ATTACHMENT_LIMITS = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: [
    'pdf',
    'doc', 'docx',
    'xls', 'xlsx',
    'ppt', 'pptx',
    'hwp',
    'jpg', 'jpeg', 'png', 'gif', 'webp',
    'zip',
  ],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/x-hwp',
    'application/haansofthwp',
    'application/vnd.hancom.hwp',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
  ],
};

const PUBLIC_PATH_PREFIX = '/uploads';

function getExtension(name) {
  const parts = (name || '').split('.');
  if (parts.length < 2) return '';
  return parts.pop().toLowerCase();
}

function sanitizeBaseName(originalName) {
  const baseRaw = (originalName || 'file')
    .replace(/\\/g, '/')
    .split('/')
    .pop();
  const dotIdx = baseRaw.lastIndexOf('.');
  const stem = dotIdx > 0 ? baseRaw.slice(0, dotIdx) : baseRaw;
  const ext = dotIdx > 0 ? baseRaw.slice(dotIdx + 1) : '';

  const safeStem = stem
    .replace(/[\x00-\x1f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\.+/g, '.')
    .trim()
    .slice(0, 80) || 'file';

  const safeExt = ext.replace(/[^A-Za-z0-9]/g, '').toLowerCase().slice(0, 10);
  return safeExt ? `${safeStem}.${safeExt}` : safeStem;
}

export function validateAttachments(files) {
  if (!Array.isArray(files)) {
    return { ok: false, error: '첨부파일 형식이 올바르지 않습니다.' };
  }
  if (files.length === 0) {
    return { ok: true };
  }
  if (files.length > ATTACHMENT_LIMITS.MAX_FILES) {
    return {
      ok: false,
      error: `첨부파일은 최대 ${ATTACHMENT_LIMITS.MAX_FILES}개까지 업로드할 수 있습니다.`,
    };
  }

  for (const file of files) {
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return { ok: false, error: '첨부파일이 올바르지 않습니다.' };
    }
    if (file.size === 0) {
      return { ok: false, error: `빈 파일은 업로드할 수 없습니다: ${file.name}` };
    }
    if (file.size > ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
      return {
        ok: false,
        error: `파일당 최대 10MB까지 업로드 가능합니다: ${file.name}`,
      };
    }
    const ext = getExtension(file.name);
    if (!ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        ok: false,
        error: `허용되지 않는 확장자입니다 (${file.name}). 허용: ${ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }
    if (file.type && !ATTACHMENT_LIMITS.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        ok: false,
        error: `허용되지 않는 파일 형식입니다 (${file.name}, ${file.type}).`,
      };
    }
  }
  return { ok: true };
}

export async function saveAttachmentsToDisk(files, subDir) {
  if (!Array.isArray(files) || files.length === 0) {
    return { saved: [], cleanup: async () => {} };
  }

  const yyyymm = (() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const relativeDir = path.posix.join(PUBLIC_PATH_PREFIX, subDir, yyyymm);
  const absoluteDir = path.join(process.cwd(), 'public', 'uploads', subDir, yyyymm);

  await mkdir(absoluteDir, { recursive: true });

  const saved = [];
  const writtenAbsolutePaths = [];

  try {
    for (const file of files) {
      const safeName = sanitizeBaseName(file.name);
      const uuid = crypto.randomUUID();
      const storedFilename = `${uuid}_${safeName}`;
      const absolutePath = path.join(absoluteDir, storedFilename);
      const filePath = path.posix.join(relativeDir, storedFilename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(absolutePath, buffer);
      writtenAbsolutePaths.push(absolutePath);

      saved.push({
        filename: storedFilename,
        original_filename: file.name,
        file_path: filePath,
        file_size: buffer.length,
        mime_type: file.type || 'application/octet-stream',
      });
    }
  } catch (err) {
    await Promise.all(
      writtenAbsolutePaths.map((p) => unlink(p).catch(() => {}))
    );
    throw err;
  }

  const cleanup = async () => {
    await Promise.all(
      writtenAbsolutePaths.map((p) => unlink(p).catch(() => {}))
    );
  };

  return { saved, cleanup };
}

export function generateAttachmentId() {
  return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
