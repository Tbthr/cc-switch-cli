import { ConfigManager, configManager, ProviderConfig } from './config.js';

export class ProviderManager {
  private cm: ConfigManager;

  constructor(cm: ConfigManager = configManager) {
    this.cm = cm;
  }

  addProvider(name: string, cfg: ProviderConfig): void {
    if (!name || name.trim() === '') throw new Error('Provider name cannot be empty');
    const providers = this.cm.getAllProviders();
    if (providers[name]) throw new Error(`Provider "${name}" already exists`);
    providers[name] = cfg;
    this.cm.setAllProviders(providers);
  }

  removeProvider(name: string): void {
    const providers = this.cm.getAllProviders();
    if (!providers[name]) throw new Error(`Provider "${name}" does not exist`);
    if (this.cm.getCurrentProviderName() === name) throw new Error(`Cannot remove the current provider "${name}"`);
    delete providers[name];
    this.cm.setAllProviders(providers);
  }

  updateProvider(name: string, updates: Partial<ProviderConfig>): void {
    const providers = this.cm.getAllProviders();
    if (!providers[name]) throw new Error(`Provider "${name}" does not exist`);
    providers[name] = { ...providers[name], ...updates } as ProviderConfig;
    this.cm.setAllProviders(providers);
  }

  listProviders(): Record<string, ProviderConfig> {
    return this.cm.getAllProviders();
  }

  getProvider(name: string): ProviderConfig | null {
    const providers = this.cm.getAllProviders();
    return providers[name] ?? null;
  }
}