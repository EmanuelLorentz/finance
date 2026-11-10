// Runs the Maven Wrapper of apps/api with the given arguments on Windows, macOS and Linux.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'api');
const isWindows = process.platform === 'win32';

const result = spawnSync(isWindows ? 'mvnw.cmd' : './mvnw', process.argv.slice(2), {
  cwd: apiDir,
  stdio: 'inherit',
  // Windows only runs .cmd files through a shell.
  shell: isWindows,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
