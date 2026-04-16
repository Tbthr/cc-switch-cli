# 发布规范

## 版本发布流程

本项目使用 GitHub Actions 自动发布到 npm（`@thtmf/cc-switch-cli`）。

**发布步骤：**

1. 确认 `package.json` 中的 `version` 为目标版本
2. 创建 git tag：`git tag v<version>`
3. 推送到远程：`git push && git push --tags`

GitHub Actions 会自动检测 `v*` 标签并执行发布。

**注意：** 不要直接运行 `npm publish`，应通过 tag 触发 workflow。
