import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getSettingsPath } from './settings-path.js';

export interface ProviderConfig {
  auth_token: string;
  base_url: string;
  model?: string;
  default_haiku_model?: string;
  default_opus_model?: string;
  default_sonnet_model?: string;
  reasoning_model?: string;
}

export interface Config {
  providers: Record<string, ProviderConfig>;
  current: string;
  public_config: Record<string, unknown>;
}

const MODEL_ENV_PREFIXES = ['ANTHROPIC_', 'CLAUDE_CODE_'];

function isModelRelatedEnv(key: string): boolean {
  return MODEL_ENV_PREFIXES.some(prefix => key.startsWith(prefix));
}

const CONFIG_DIR = path.join(os.homedir(), '.config', 'cc-switch-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  loadConfig(): Config {
    const publicConfig = this.loadPublicConfig();

    let providerConfig: Record<string, ProviderConfig> = {};
    let current = '';

    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        providerConfig = parsed.providers ?? {};
        current = parsed.current ?? '';
      } catch (error) {
        console.error(`Failed to parse config file: ${CONFIG_FILE}`, error);
      }
    }

    const config: Config = { providers: providerConfig, current, public_config: publicConfig };
    return config;
  }

  loadPublicConfig(): Record<string, unknown> {
    if (!fs.existsSync(getSettingsPath())) return {};

    try {
      const raw = fs.readFileSync(getSettingsPath(), 'utf-8');
      const settings = JSON.parse(raw);
      if (!settings.env || typeof settings.env !== 'object') return {};

      const publicConfig: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(settings.env)) {
        if (!isModelRelatedEnv(key)) {
          publicConfig[key] = value;
        }
      }
      return publicConfig;
    } catch (error) {
      console.error(`Failed to load settings from ${getSettingsPath()}`, error);
      return {};
    }
  }

  saveConfig(config: Config): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const toSave = { providers: config.providers, current: config.current };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
  }

  getCurrentProviderName(): string {
    const config = this.loadConfig();
    return config.current;
  }

  setCurrentProvider(name: string): void {
    const config = this.loadConfig();
    if (!(name in config.providers)) throw new Error(`Provider "${name}" not found`);
    config.current = name;
    this.saveConfig(config);
  }

  getAllProviders(): Record<string, ProviderConfig> {
    const config = this.loadConfig();
    return config.providers;
  }

  setAllProviders(providers: Record<string, ProviderConfig>): void {
    const config = this.loadConfig();
    config.providers = providers;
    this.saveConfig(config);
  }
}

export const configManager = new ConfigManager();