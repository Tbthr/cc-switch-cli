import inquirer from 'inquirer';
import { ProviderConfig } from './config.js';

const FIELD_DEFINITIONS: Array<{
  key: keyof ProviderConfig;
  label: string;
  required: boolean;
  description?: string;
}> = [
  { key: 'auth_token', label: 'auth_token', required: true, description: 'Authentication token' },
  { key: 'base_url', label: 'base_url', required: true, description: 'Base URL for the API' },
  { key: 'model', label: 'model', required: false, description: 'Model identifier' },
  { key: 'default_haiku_model', label: 'default_haiku_model', required: false, description: 'Default Haiku model' },
  { key: 'default_opus_model', label: 'default_opus_model', required: false, description: 'Default Opus model' },
  { key: 'default_sonnet_model', label: 'default_sonnet_model', required: false, description: 'Default Sonnet model' },
  { key: 'reasoning_model', label: 'reasoning_model', required: false, description: 'Reasoning model' },
];

export async function promptForProviderName(): Promise<string> {
  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: 'input',
      name: 'name',
      message: 'Enter provider name:',
      validate: (input: string) => input.trim() !== '' || 'Name cannot be empty',
    },
  ]);
  return name.trim();
}

export async function promptForAddProvider(existingNames: string[]): Promise<{ name: string; config: ProviderConfig }> {
  const config: ProviderConfig = { auth_token: '', base_url: '' };

  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: 'input',
      name: 'name',
      message: 'Enter provider name:',
      validate: (input: string) => {
        if (input.trim() === '') return 'Name cannot be empty';
        if (existingNames.includes(input.trim())) return `Provider "${input.trim()}" already exists`;
        return true;
      },
    },
  ]);
  const providerName = name.trim();

  for (const field of FIELD_DEFINITIONS) {
    const { value } = await inquirer.prompt<{ value: string }>([
      {
        type: 'input',
        name: 'value',
        message: `${field.label}${field.required ? ' (required)' : ''}:${config[field.key] ? ` [current: ${config[field.key]}]` : ''}`,
      },
    ]);

    if (value.trim() !== '') {
      (config as unknown as Record<string, string>)[field.key] = value.trim();
    } else if (field.required) {
      console.error(`Error: ${field.label} is required`);
      process.exit(1);
    }
  }

  return { name: providerName, config };
}

export async function promptForUpdateProvider(current: ProviderConfig): Promise<Partial<ProviderConfig>> {
  const updates: Partial<ProviderConfig> = {};

  console.log('\nCurrent configuration:');
  for (const field of FIELD_DEFINITIONS) {
    const currentVal = current[field.key] || '(none)';
    console.log(`  ${field.label}: ${currentVal}`);
  }
  console.log('\nEnter new value to update, or press Enter to skip:\n');

  for (const field of FIELD_DEFINITIONS) {
    const currentVal = current[field.key] || '';
    const { value } = await inquirer.prompt<{ value: string }>([
      {
        type: 'input',
        name: 'value',
        message: `Update ${field.label}${field.required ? ' (required)' : ''}:${currentVal ? ` [current: ${currentVal}]` : ' (currently unset)'}`,
      },
    ]);

    if (value.trim() !== '') {
      (updates as unknown as Record<string, string>)[field.key] = value.trim();
    }
  }

  return updates;
}

export async function promptForProviderSelection(providers: Record<string, ProviderConfig>): Promise<string | null> {
  const names = Object.keys(providers);
  if (names.length === 0) {
    console.log('No providers available.');
    return null;
  }

  const { selected } = await inquirer.prompt<{ selected: string }>([
    {
      type: 'list',
      name: 'selected',
      message: 'Select a provider:',
      choices: names,
    },
  ]);

  return selected;
}

export async function promptForRemoveProvider(providers: Record<string, ProviderConfig>): Promise<string | null> {
  const selected = await promptForProviderSelection(providers);
  if (!selected) return null;

  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove "${selected}"?`,
      default: false,
    },
  ]);

  return confirm ? selected : null;
}

export { FIELD_DEFINITIONS };
