import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

function extractNotes(changelog: string, version: string): string {
  const script = `awk "/^## \\\\[${version}\\\\]/{flag=1; next} /^## \\\\[/{flag=0} flag"`;
  const dir = mkdtempSync(join(tmpdir(), 'bmcp-cl-'));
  const path = join(dir, 'CHANGELOG.md');
  writeFileSync(path, changelog, 'utf8');
  try {
    return execFileSync('sh', ['-c', `${script} ${path}`], { encoding: 'utf8' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('CHANGELOG extraction for GitHub Release notes', () => {
  const sample = `# Changelog

## [Unreleased]

### Added

- future stuff

## [0.8.0] - 2026-04-25

### Added

- Release pipeline
- SBOM

## [0.5.0] - 2026-04-23

### Added

- content context
`;

  it('extracts notes for 0.8.0 without leaking later sections', () => {
    const notes = extractNotes(sample, '0.8.0');
    expect(notes).toContain('Release pipeline');
    expect(notes).toContain('SBOM');
    expect(notes).not.toContain('future stuff');
    expect(notes).not.toContain('content context');
  });

  it('returns empty string for a version not present', () => {
    const notes = extractNotes(sample, '0.99.0');
    expect(notes.trim()).toBe('');
  });
});
