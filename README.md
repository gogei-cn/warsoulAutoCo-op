# WarSoul Auto Co-op Script

## 介绍

本脚本使用 Playwright 自动在 [aring.cc/awakening-of-war-soul-ol/](https://aring.cc/awakening-of-war-soul-ol/) 上进行共斗操作，并通过 GitHub Actions 每 8 小时执行一次。

## 使用方法

1. Fork 本仓库。
2. 配置 GitHub Secrets（**极其重要：请勿将密码直接写在代码中**）。
   - 在仓库的 `Settings` -> `Secrets and variables` -> `Actions` 中添加：
   - `WARSOUL_USERNAME`: `用户名`
   - `WARSOUL_PASSWORD`: `密码`
   - `WARSOUL_MODE`: `普通` 或 `进阶`（如果不设置，默认为 `普通`）
3. 启动 GitHub Actions
   - 点击 `Actions`
   - 选择 `auto-coop` 工作流
   - 点击 `Run workflow`，并在弹出的窗口中点击 `Run workflow`。