import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readVersion(): string {
  const packageJson: unknown = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
  if (
    typeof packageJson === 'object' &&
    packageJson !== null &&
    'version' in packageJson &&
    typeof packageJson.version === 'string'
  ) {
    return packageJson.version;
  }
  throw new Error('package.json has no version');
}

export const APP_VERSION = readVersion();
