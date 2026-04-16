# Claude Code Provider Switch

管理 Claude Code AI Provider 配置的 CLI 工具。

## 安装

```bash
npm install -g @thtmf/cc-switch-cli
```

## 命令

### list
列出所有已配置的 provider。

```bash
ccs list
```

### add
添加新的 provider。

**交互模式**（无选项时自动进入）：
```bash
ccs add
ccs add <name>
```
交互流程：提示输入 provider 名称 → 依次询问各配置字段。

**命令行模式**：
```bash
ccs add <name> --auth-token <token> --base-url <url> [options]
```

**必需参数（命令行模式）：**

| 参数 | 说明 |
|------|------|
| `--auth-token <token>` | API 密钥 |
| `--base-url <url>` | API 基础 URL |

**可选参数：**

| 参数 | 说明 |
|------|------|
| `--model <model>` | 默认模型 |
| `--default-haiku-model <model>` | Haiku 模型 |
| `--default-opus-model <model>` | Opus 模型 |
| `--default-sonnet-model <model>` | Sonnet 模型 |
| `--reasoning-model <model>` | 推理模型 |

**示例：**
```bash
ccs add my-provider --auth-token "your-token" --base-url "https://api.example.com/anthropic" --model "example-model-v1"
```

### remove
删除 provider（不能删除当前正在使用的）。

**交互模式**（无 name 时自动进入）：
```bash
ccs remove
```
交互流程：列表选择 provider → 确认删除。

**命令行模式**：
```bash
ccs remove <name>
```
直接删除指定的 provider。

### switch
切换到指定 provider。

```bash
ccs switch <name>
```

### show
显示当前 provider 的配置。

```bash
ccs show
```

### update
更新 provider 配置。

**交互模式**（无选项时自动进入）：
```bash
ccs update
ccs update <name>
```
交互流程：显示当前配置 → 依次询问各字段（直接回车保持当前值）。

**命令行模式**：
```bash
ccs update <name> [options]
```

**可选参数（命令行模式）：**

| 参数 | 说明 |
|------|------|
| `--auth-token <token>` | 认证 token |
| `--base-url <url>` | API 基础 URL |
| `--model <model>` | 模型标识符 |
| `--default-haiku-model <model>` | Haiku 模型 |
| `--default-opus-model <model>` | Opus 模型 |
| `--default-sonnet-model <model>` | Sonnet 模型 |
| `--reasoning-model <model>` | 推理模型 |

**示例：**
```bash
ccs update my-provider --auth-token "new-token" --model "updated-model-v2"
```

## 配置文件

- Provider 配置：`~/.config/cc-switch-cli/config.json`
- Claude Code 设置：`~/.claude/settings.json`

## Provider 字段

切换时会更新以下 ANTHROPIC_* 字段：

| 字段 | 说明 |
|------|------|
| `ANTHROPIC_AUTH_TOKEN` | API 密钥 |
| `ANTHROPIC_BASE_URL` | API 基础 URL |
| `ANTHROPIC_MODEL` | 默认模型（可选） |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku 模型（可选） |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus 模型（可选） |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet 模型（可选） |
| `ANTHROPIC_REASONING_MODEL` | 推理模型（可选） |

其他配置（如 `CLAUDE_CODE_*`）在切换时会保留。
