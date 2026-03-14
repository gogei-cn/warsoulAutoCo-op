# WarSoul Auto Co-op Script

## 介绍

本项目是一个基于 Playwright 的自动化脚本，用于在 [战魂觉醒OL](https://aring.cc/awakening-of-war-soul-ol/) 上执行自动共斗挂机任务。

### 核心功能
- **定时执行**：利用 GitHub Action 每 6 小时自动运行一次（对应北京时间 02:00, 08:00, 14:00, 20:00）。
- **多种模式**：支持“普通”和“进阶”两种共斗模式切换。
- **异常重试**：内置 2 次重试机制，应对网络波动或页面加载缓慢问题。
- **运行报告**：失败时自动保存截图（Workflow Artifacts），方便排查问题。

## 使用方法

1. **Fork 本仓库**：点击页面右上角的 `Fork` 按钮。
2. **配置 GitHub Secrets**（**极其重要：请勿将密码直接写在代码中**）：
   - 进入你 Fork 后的仓库 `Settings` -> `Secrets and variables` -> `Actions`。
   - 点击 `New repository secret`，依次添加：
     - `WARSOUL_USERNAME`: 你的游戏用户名或邮箱。
     - `WARSOUL_PASSWORD`: 你的游戏密码。
     - `WARSOUL_MODE`: 挂机模式。输入 `0` 代表 `普通`，输入 `1` 代表 `进阶`（默认为 `0`）。
3. **启用 GitHub Actions**：
   - 点击仓库上方的 `Actions` 选项卡。
   - 点击 `I understand my workflows, go ahead and enable them`。
   - 在左侧选择 `War Soul Auto Co-op` 工作流，点击 `Enable workflow`。
4. **手动测试（推荐）**：
   - 点击 `Run workflow` 按钮手动触发一次运行，检查日志确认是否成功。

## 运行环境
- **运行器**：Windows Latest (GitHub Actions)
- **依赖**：Node.js v20, Playwright

## 故障排查
如果脚本运行失败：
1. 查看 Action 运行日志中的错误信息。
2. 在 Action 运行记录底部的 `Artifacts` 栏下载 `status.png` 或 `error_attempt_X.png` 截图，查看屏幕画面。
3. 检查 Secrets 配置是否正确，尤其是用户名和密码。

## 注意事项
- **安全提醒**：绝对不要在 `index.js` 中硬编码你的密码。
- **延迟说明**：GitHub Actions 的定时触发可能会比设定时间延迟 10-60 分钟。
- **免责声明**：本项目仅供学习交流使用，使用本脚本产生的任何后果由使用者本人承担。

## 开源协议
本项目采用 [MIT License](LICENSE) 协议发布。

