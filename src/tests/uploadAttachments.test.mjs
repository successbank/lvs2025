import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

// The Next.js source uses ESM in a CommonJS package; the helper only imports Node builtins.
const source = await readFile(new URL('../lib/uploadAttachments.js', import.meta.url), 'utf8');
const { validateAttachments, saveAttachmentsToDisk, ATTACHMENT_LIMITS } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);

test('accepts DWG names and browser CAD MIME variants', () => {
  for (const name of ['drawing.dwg', '한글 도면.DWG']) {
    for (const type of [
      '', 'application/octet-stream', 'image/vnd.dwg', 'image/x-dwg',
      'application/acad', 'application/x-acad', 'application/dwg', 'application/x-dwg',
      'application/autocad', 'application/x-autocad', 'drawing/dwg',
    ]) {
      const file = new File(['AC1032\0test drawing'], name, { type });
      assert.equal(validateAttachments([file]).ok, true, `${name}: ${type || '(empty MIME)'}`);
    }
  }
});

test('keeps upload limits and rejects unsupported files', () => {
  assert.equal(validateAttachments([new File([], 'empty.dwg')]).ok, false);
  assert.equal(validateAttachments([new File(['code'], 'drawing.dwg.exe')]).ok, false);
  assert.equal(validateAttachments([new File(['code'], 'drawing.dwg', { type: 'text/html' })]).ok, false);
  assert.equal(validateAttachments([{
    name: 'large.dwg', size: ATTACHMENT_LIMITS.MAX_FILE_SIZE + 1, arrayBuffer() {},
  }]).ok, false);
  const drawing = new File(['AC1032'], 'drawing.dwg');
  assert.equal(validateAttachments(Array(ATTACHMENT_LIMITS.MAX_FILES + 1).fill(drawing)).ok, false);
  for (const [name, type] of [['manual.pdf', 'application/pdf'], ['drawings.zip', 'application/zip']]) {
    assert.equal(validateAttachments([new File(['data'], name, { type })]).ok, true);
  }
});

test('stores DWG bytes and original filename and cleans up its files', async () => {
  const originalCwd = process.cwd();
  const directory = await mkdtemp(path.join(os.tmpdir(), 'lvs-dwg-test-'));
  try {
    process.chdir(directory);
    const bytes = Buffer.from([65, 67, 49, 48, 51, 50, 0, 255, 128, 13, 10]);
    const file = new File([bytes], '한글 도면.DWG');
    const { saved, cleanup } = await saveAttachmentsToDisk([file], 'downloads');
    assert.equal(saved.length, 1);
    assert.equal(saved[0].original_filename, file.name);
    assert.equal(saved[0].file_size, bytes.length);
    assert.equal(saved[0].mime_type, 'application/octet-stream');
    assert.match(saved[0].file_path, /^\/uploads\/downloads\/\d{6}\/[^/]+\.dwg$/);
    const storedPath = path.join(directory, 'public', saved[0].file_path);
    assert.deepEqual(await readFile(storedPath), bytes);
    await cleanup();
    await assert.rejects(readFile(storedPath), { code: 'ENOENT' });
  } finally {
    process.chdir(originalCwd);
    await rm(directory, { recursive: true, force: true });
  }
});
