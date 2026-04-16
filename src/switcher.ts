import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ProviderConfig } from './config.js';
import { getSettingsPath, getSettingsBackupPath } from './settings-path.js';

// Provider 专有字段名单，切 provider 时只操作这些
const PROVIDER_KEYS = [
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_MODEL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_REASONING_MODEL',
];

async function atomicWrite(content: string): Promise<void> {
  const tempPath = path.join(os.tmpdir(), `settings-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  try {
    fs.writeFileSync(tempPath, content, 'utf-8');
    JSON.parse(content);
    const parsed = JSON.parse(content);
    if (!parsed.env?.ANTHROPIC_AUTH_TOKEN || !parsed.env?.ANTHROPIC_BASE_URL) {
      throw new Error('Missing ANTHROPIC_AUTH_TOKEN or ANTHROPIC_BASE_URL in env');
    }
    fs.renameSync(tempPath, getSettingsPath());
  } finally {
    try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
  }
}

export async function switchToProvider(_providerName: string, config: ProviderConfig): Promise<void> {
  if (!config.auth_token) throw new Error('Missing required field: auth_token');
  if (!config.base_url) throw new Error('Missing required field: base_url');

  let settings: Record<string, unknown> = {};
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf-8');
    settings = JSON.parse(raw);
  } catch (error: unknown) {
    if ((error as { code?: string })?.code !== 'ENOENT') throw error;
  }

  // 清除 provider 专有字段，保留其他公共配置（如 CLAUDE_CODE_*）
  if (settings.env) {
    const env = settings.env as Record<string, unknown>;
    PROVIDER_KEYS.forEach(key => delete env[key]);
  } else {
    settings.env = {};
  }

  const env = settings.env as Record<string, string>;

  // 只写入 provider 有值的字段
  env.ANTHROPIC_AUTH_TOKEN = config.auth_token;
  env.ANTHROPIC_BASE_URL = config.base_url;
  if (config.model) env.ANTHROPIC_MODEL = config.model;
  if (config.default_haiku_model) env.ANTHROPIC_DEFAULT_HAIKU_MODEL = config.default_haiku_model;
  if (config.default_opus_model) env.ANTHROPIC_DEFAULT_OPUS_MODEL = config.default_opus_model;
  if (config.default_sonnet_model) env.ANTHROPIC_DEFAULT_SONNET_MODEL = config.default_sonnet_model;
  if (config.reasoning_model) env.ANTHROPIC_REASONING_MODEL = config.reasoning_model;

  try {
    if (fs.existsSync(getSettingsPath())) {
      fs.copyFileSync(getSettingsPath(), getSettingsBackupPath());
    }
    await atomicWrite(JSON.stringify(settings, null, 2));
  } catch (error) {
    try {
      if (fs.existsSync(getSettingsBackupPath())) {
        fs.copyFileSync(getSettingsBackupPath(), getSettingsPath());
      }
    } catch { /* ignore */ }
    throw error;
  }
}