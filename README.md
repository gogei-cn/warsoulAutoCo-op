# WarSoul Auto Co-op Script

## 介绍

本脚本使用 Playwright 自动在 [战魂觉醒OL](https://aring.cc/awakening-of-war-soul-ol/) 上进行共斗操作，并通过 GitHub Actions 每 6 小时执行一次。（注：GitHub Actions 定时任务可能会有几十分钟到几个小时的延迟，所以改成每 6 小时执行一次）

## 使用方法

1. Fork 本仓库。
2. 配置 GitHub Secrets（**极其重要：请勿将密码直接写在代码中**）。
   - 在仓库的 `Settings` -> `Secrets and variables` -> `Actions` 中，点击 `New repository secret`，添加以下 Secrets：
   - `WARSOUL_USERNAME`: `用户名`
   - `WARSOUL_PASSWORD`: `密码`
   - `WARSOUL_MODE`: `0` 或 `1`（`0` 代表 `普通`，`1` 代表 `进阶`。如果不设置，默认为 `0`）
3. 启动 GitHub Actions
   - 点击 `Actions`
   - 点击 `I understand my workflows, go ahead and enable them`
   - 选择 `WarSoul Auto Co-op` 工作流
   - 点击 `Enable workflow`
4. 手动触发（可选）
   - 点击 `Run workflow`，并在弹出的窗口中点击 `Run workflow`。

## 注意事项

- 请确保您的账号安全，**不要将密码直接写在代码中**，而是使用 GitHub Secrets。
- 该脚本仅供学习和娱乐使用，请勿用于商业目的。
- Github Actions 定时任务可能会有几十分钟的延迟，这是正常的。
- 游戏可能会更新，导致脚本失效，请定期检查并更新脚本以适应游戏的变化。
