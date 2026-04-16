#!/usr/bin/env node

import { Command } from 'commander';
import { configManager, ProviderConfig } from './config.js';
import { ProviderManager } from './provider.js';
import { switchToProvider } from './switcher.js';
import { promptForAddProvider, promptForUpdateProvider, promptForRemoveProvider, promptForProviderSelection } from './prompt.js';

const program = new Command();
const manager = new ProviderManager(configManager);

program
  .name('ccs')
  .description('CLI tool to manage Claude Code AI provider configurations')
  .version('1.0.0');

function isInteractiveAdd(options: Record<string, unknown>): boolean {
  return !options.authToken && !options.baseUrl;
}

function isInteractiveUpdate(options: Record<string, unknown>): boolean {
  return !options.authToken && !options.baseUrl && !options.model &&
    !options.defaultHaikuModel && !options.defaultOpusModel &&
    !options.defaultSonnetModel && !options.reasoningModel;
}

// list - 列出所有 provider
program
  .command('list')
  .description('List all configured providers')
  .action(() => {
    const providers = manager.listProviders();
    console.log('Configured providers:');
    if (Object.keys(providers).length === 0) {
      console.log('  (none)');
    } else {
      const current = configManager.getCurrentProviderName();
      for (const [name, cfg] of Object.entries(providers)) {
        const marker = name === current ? ' *' : '';
        console.log(`  ${name}${marker}`);
        console.log(`    auth_token: ${cfg.auth_token ? '***' : '(none)'}`);
        console.log(`    base_url: ${cfg.base_url || '(none)'}`);
        console.log(`    model: ${cfg.model || '(none)'}`);
      }
    }
  });

// add <name> - 添加新 provider
program
  .command('add [name]')
  .description('Add a new provider (interactive if no options provided)')
  .option('--auth-token <token>', 'Authentication token')
  .option('--base-url <url>', 'Base URL for the API')
  .option('--model <model>', 'Model identifier')
  .option('--default-haiku-model <model>', 'Haiku model')
  .option('--default-opus-model <model>', 'Opus model')
  .option('--default-sonnet-model <model>', 'Sonnet model')
  .option('--reasoning-model <model>', 'Reasoning model')
  .action(async (nameArg, options) => {
    try {
      if (isInteractiveAdd(options)) {
        // Interactive mode
        const existingNames = Object.keys(manager.listProviders());
        const result = await promptForAddProvider(existingNames);
        manager.addProvider(result.name, result.config);
        console.log(`Provider "${result.name}" added successfully`);
      } else {
        // Non-interactive mode
        if (!nameArg) {
          console.error('Error: provider name is required');
          process.exit(1);
        }
        if (!options.authToken || !options.baseUrl) {
          console.error('Error: --auth-token and --base-url are required in non-interactive mode');
          process.exit(1);
        }
        const cfg: ProviderConfig = {
          auth_token: options.authToken,
          base_url: options.baseUrl,
          model: options.model,
          default_haiku_model: options.defaultHaikuModel,
          default_opus_model: options.defaultOpusModel,
          default_sonnet_model: options.defaultSonnetModel,
          reasoning_model: options.reasoningModel,
        };
        manager.addProvider(nameArg, cfg);
        console.log(`Provider "${nameArg}" added successfully`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// remove <name> - 删除 provider
program
  .command('remove [name]')
  .description('Remove a provider (interactive if no name provided)')
  .action(async (nameArg) => {
    try {
      let name: string;
      if (!nameArg) {
        // Interactive mode
        const providers = manager.listProviders();
        const selected = await promptForRemoveProvider(providers);
        if (!selected) {
          console.log('Removal cancelled.');
          return;
        }
        name = selected;
      } else {
        name = nameArg;
      }
      manager.removeProvider(name);
      console.log(`Provider "${name}" removed successfully`);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// switch <name> - 切换到指定 provider
program
  .command('switch <name>')
  .description('Switch to a specific provider')
  .action(async (name) => {
    try {
      const provider = manager.getProvider(name);
      if (!provider) {
        console.error(`Provider "${name}" not found`);
        process.exit(1);
      }
      await switchToProvider(name, provider);
      configManager.setCurrentProvider(name);
      console.log(`Switched to provider "${name}"`);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// show - 显示当前 provider 配置
program
  .command('show')
  .description('Show current provider configuration')
  .action(() => {
    const currentName = configManager.getCurrentProviderName();
    const current = manager.getProvider(currentName);
    if (!current) {
      console.log('No current provider configured');
      return;
    }
    console.log(`Current provider: ${currentName}`);
    console.log(`  auth_token: ${current.auth_token ? '***' : '(none)'}`);
    console.log(`  base_url: ${current.base_url}`);
    console.log(`  model: ${current.model}`);
    if (current.default_haiku_model) console.log(`  default_haiku_model: ${current.default_haiku_model}`);
    if (current.default_opus_model) console.log(`  default_opus_model: ${current.default_opus_model}`);
    if (current.default_sonnet_model) console.log(`  default_sonnet_model: ${current.default_sonnet_model}`);
    if (current.reasoning_model) console.log(`  reasoning_model: ${current.reasoning_model}`);
  });

// update <name> - 更新 provider 配置
program
  .command('update [name]')
  .description('Update a provider configuration (interactive if no options provided)')
  .option('--auth-token <token>', 'Authentication token')
  .option('--base-url <url>', 'Base URL for the API')
  .option('--model <model>', 'Model identifier')
  .option('--default-haiku-model <model>', 'Haiku model')
  .option('--default-opus-model <model>', 'Opus model')
  .option('--default-sonnet-model <model>', 'Sonnet model')
  .option('--reasoning-model <reasoning-model>', 'Reasoning model')
  .action(async (nameArg, options) => {
    try {
      let name: string;
      if (isInteractiveUpdate(options)) {
        // Interactive mode
        if (!nameArg) {
          // No name provided, prompt to select one
          const providers = manager.listProviders();
          const selected = await promptForProviderSelection(providers);
          if (!selected) {
            console.log('Update cancelled.');
            return;
          }
          name = selected;
        } else {
          name = nameArg;
        }
        const current = manager.getProvider(name);
        if (!current) {
          console.error(`Provider "${name}" not found`);
          process.exit(1);
        }
        const updates = await promptForUpdateProvider(current);
        if (Object.keys(updates).length === 0) {
          console.log('No changes made.');
          return;
        }
        manager.updateProvider(name, updates);
        console.log(`Provider "${name}" updated successfully`);
      } else {
        // Non-interactive mode
        if (!nameArg) {
          console.error('Error: provider name is required');
          process.exit(1);
        }
        name = nameArg;
        const updates: Partial<ProviderConfig> = {};
        if (options.authToken) updates.auth_token = options.authToken;
        if (options.baseUrl) updates.base_url = options.baseUrl;
        if (options.model) updates.model = options.model;
        if (options.defaultHaikuModel) updates.default_haiku_model = options.defaultHaikuModel;
        if (options.defaultOpusModel) updates.default_opus_model = options.defaultOpusModel;
        if (options.defaultSonnetModel) updates.default_sonnet_model = options.defaultSonnetModel;
        if (options.reasoningModel) updates.reasoning_model = options.reasoningModel;
        manager.updateProvider(name, updates);
        console.log(`Provider "${name}" updated successfully`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program.parse();