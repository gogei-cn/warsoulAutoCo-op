const { chromium } = require("playwright");

(async () => {
  // 环境变量中获取用户名和密码
  const USERNAME = process.env.WARSOUL_USERNAME;
  const PASSWORD = process.env.WARSOUL_PASSWORD;
  // 0 代表普通, 1 代表进阶
  const MODE_VAL = process.env.WARSOUL_MODE || "0";
  const MODE = MODE_VAL === "1" ? "进阶" : "普通";

  if (!USERNAME || !PASSWORD) {
    console.error("请设置环境变量 WARSOUL_USERNAME 和 WARSOUL_PASSWORD");
    process.exit(1);
  }

  const MAX_RETRIES = 2; // 最大重试次数
  let success = false;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    try {
      if (attempt > 0) {
        console.log(`正在进行第 ${attempt} 次重试...`);
      }
      console.log("正在打开页面...");
      // 增加超时时间并使用 domcontentloaded
      await page.goto("https://aring.cc/awakening-of-war-soul-ol/", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // 额外等待一段时间，并等待网络空闲（但不强制要求达到 networkidle）
      await page.waitForTimeout(5000);
      // 尝试在网络不繁忙后再继续
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});

      // 检查是否在登录页面
      const loginBtn = page.getByRole("button", { name: "登录", exact: true });
      if (await loginBtn.isVisible()) {
        console.log("检测到登录界面，开始登录...");
        await page
          .locator("form")
          .filter({ hasText: "登录" })
          .getByPlaceholder("请输入用户名或邮箱")
          .fill(USERNAME);
        await page
          .locator("form")
          .filter({ hasText: "登录" })
          .getByPlaceholder("请输入密码")
          .fill(PASSWORD);
        await loginBtn.click();
        console.log("点击登录按钮，等待进入游戏...");
        await page.waitForTimeout(3000);
      }

      // 检查是否有“进入游戏”按钮（有些时候登录后需要再点一次）
      const enterGameBtn = page.getByRole("button", {
        name: "进入游戏",
        exact: true,
      });
      if (await enterGameBtn.isVisible()) {
        console.log("点击进入游戏...");
        await enterGameBtn.click();
        await page.waitForTimeout(5000);
      }

      console.log("尝试寻找并执行共斗...");

      // 1. 点击“共斗”频道按钮
      const coopTab = page
        .locator("button")
        .filter({ hasText: /^共斗$/ })
        .first();
      if (await coopTab.isVisible()) {
        console.log("切换到共斗频道...");
        await coopTab.click();
        await page.waitForTimeout(2000);

        // 1.1 选择“普通”或“进阶”标签页
        // 普通模式 data-v: 58c20fad, 进阶模式 data-v: 18d7a9fe
        const modeAttr = MODE === "进阶" ? "18d7a9fe" : "58c20fad";
        const modeTab = page
          .locator(`.el-tabs__item[data-v-${modeAttr}]`)
          .filter({ hasText: new RegExp(`^${MODE}$`) })
          .first();

        if (await modeTab.isVisible()) {
          console.log(`切换到 ${MODE} 模式 (使用属性匹配)...`);
          await modeTab.click();
          await page.waitForTimeout(2000);
        } else {
          // 如果特定属性没找到，尝试通过通用文本匹配
          const fallbackTab = page
            .locator(".el-tabs__item")
            .filter({ hasText: new RegExp(`^${MODE}$`) })
            .first();
          if (await fallbackTab.isVisible()) {
            await fallbackTab.click();
            await page.waitForTimeout(2000);
          }
        }
      }

      // 2. 点击“取消”、“自动”按钮
      // 根据不同模式匹配对应的 data-v 属性
      const autoAttr = MODE === "进阶" ? "18d7a9fe" : "58c20fad";
      const cancelBtn = page
        .locator(`button[data-v-${autoAttr}]`)
        .filter({ hasText: /^取消$/ })
        .first();
      if (await cancelBtn.isVisible()) {
        console.log(`点击“取消”按钮`);
        await cancelBtn.click();
        await page.waitForTimeout(2000);
        // 3. 点击二次确认框的“确定”按钮
        const confirmBtn = page
          .locator(".el-message-box__btns button")
          .filter({ hasText: "确定" })
          .first();
        if (await confirmBtn.isVisible()) {
          console.log("点击“确定”取消上次共斗...");
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      const autoBtn = page
        .locator(`button[data-v-${autoAttr}]`)
        .filter({ hasText: /^自动$/ })
        .first();
      if (await autoBtn.isVisible()) {
        console.log(`点击 ${MODE} 模式下的“自动”按钮...`);
        await autoBtn.click();
        await page.waitForTimeout(2000);

        // 3. 在弹出的气泡框中点击“8 小时”
        const eightHourBtn = page
          .locator(`button[data-v-${autoAttr}]`)
          .filter({ hasText: /^8 小时$/ })
          .first();

        if (await eightHourBtn.isVisible()) {
          console.log("点击“8 小时”...");
          await eightHourBtn.click();
          await page.waitForTimeout(2000);
        } else {
          console.log("未找到“8 小时”选项，尝试直接通过文字点击...");
          await page
            .locator("button")
            .filter({ hasText: /^8 小时$/ })
            .first()
            .click();
          await page.waitForTimeout(2000);
        }
        // 4. 点击二次确认框的“确定”按钮
        const confirmBtn = page
          .locator(".el-message-box__btns button")
          .filter({ hasText: "确定" })
          .first();
        if (await confirmBtn.isVisible()) {
          console.log("点击“确定”开始挂机...");
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // 截图留存当前状态，方便调试
      await page.screenshot({ path: "status.png" });

      console.log("脚本执行成功！");
      success = true;
      break; // 成功后退出重试循环
    } catch (error) {
      console.error(
        `执行出错 (尝试 ${attempt + 1}/${MAX_RETRIES + 1}):`,
        error,
      );
      await page.screenshot({ path: `error_attempt_${attempt}.png` });
    } finally {
      await browser.close();
    }

    if (attempt < MAX_RETRIES) {
      console.log(`等待 10 秒后进行下一次重试...`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  if (!success) {
    console.error("在所有尝试后脚本均执行失败。");
    process.exit(1);
  }
})();
