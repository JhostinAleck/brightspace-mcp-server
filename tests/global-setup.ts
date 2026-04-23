import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

export default function setup(): void {
  if (!existsSync('build/cli/main.js')) {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execFileSync(npm, ['run', 'build'], { stdio: 'inherit' });
  }
}
