# CLAUDE.md

## 项目概述

本项目是一个 CLI 工具（`ccs`），用于管理 Claude Code 的 AI Provider 配置。
用户可以在多个 provider 之间快速切换，切换时会修改 `~/.claude/settings.json` 中的 `env` 字段。

## 技术栈

- **语言**: TypeScript (CommonJS)
- **构建**: `tsc` → `dist/`
- **运行时**: Node.js
- **关键依赖**: commander (CLI)、inquirer (交互式)、chalk (输出着色)
- **包名**: `@thtmf/cc-switch-cli`
- **入口命令**: `ccs`

## 项目结构

- `src/main.ts` — CLI 入口，定义所有命令（list / add / remove / switch / show / update）
- `src/config.ts` — 配置管理（读写 `~/.config/cc-switch-cli/config.json`）
- `src/provider.ts` — Provider CRUD 逻辑
- `src/switcher.ts` — 切换逻辑（原子写入 `~/.claude/settings.json`）
- `src/prompt.ts` — 交互式提示（inquirer）
- `src/settings-path.ts` — settings 路径（支持 `CLAUDE_SETTINGS_PATH` 环境变量覆盖）

## 开发命令

- `npm run build` — 编译 TypeScript
- `npm run start` — 使用 tsx 直接运行（开发用）

## 关键设计决策

- 使用原子写入（先写临时文件 → rename）+ 备份机制保护 settings.json
- Provider 配置存储在独立文件 `~/.config/cc-switch-cli/config.json`，不与 Claude 配置混合

---

## 编码准则

以下为通用 LLM 编码准则，减少常见错误。

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 版本发布流程

本项目使用 GitHub Actions 自动发布到 npm（`@thtmf/cc-switch-cli`）。

**发布步骤：**

1. 确认所有更改已提交且构建通过（`npm run build`）
2. 更新 `package.json` 中的 `version`（遵循 semver）
3. 提交版本变更：`git commit -am "chore: bump version to <version>"`
4. 创建 git tag（不必须，需用户明确要求，否则不能自行创建tag）：`git tag v<version>`
5. 推送到远程：`git push && git push --tags`

GitHub Actions 会自动检测 `v*` 标签并执行发布。

**注意：** 不要直接运行 `npm publish`，应通过 tag 触发 workflow。
