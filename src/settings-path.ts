import * as path from 'path';
import * as os from 'os';

const DEFAULT_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

export function getSettingsPath(): string {
  return process.env.CLAUDE_SETTINGS_PATH || DEFAULT_SETTINGS_PATH;
}

export function getSettingsBackupPath(): string {
  return getSettingsPath() + '.backup';
}
