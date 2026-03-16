const { chromium } = require("playwright");

async function runForAccount(username, password, modeVal) {
  const MODE = modeVal === "1" ? "进阶" : "普通";
  const MAX_RETRIES = 2;
  let success = false;

  console.log(`\n=== 开始处理账号: ${username} (${MODE}模式) ===`);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    try {
      if (attempt > 0) console.log(`账号 ${username} 正在进行第 ${attempt} 次重试...`);
      console.log("正在打开页面...");
      
      await page.goto("https://aring.cc/awakening-of-war-soul-ol/", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // -- 登录 --
      const loginBtn = page.getByRole("button", { name: "登录", exact: true });
      const isLoginVisible = await loginBtn.waitFor({ state: "visible", timeout: 8000 }).then(() => true).catch(() => false);
      
      if (isLoginVisible) {
        console.log("检测到登录界面，开始登录...");
        await page.locator("form").filter({ hasText: "登录" }).getByPlaceholder("请输入用户名或邮箱").fill(username);
        await page.locator("form").filter({ hasText: "登录" }).getByPlaceholder("请输入密码").fill(password);
        await loginBtn.click();
        console.log("点击登录按钮，等待登录完成...");
      }

      // -- 检查登录状态 & 进入游戏 --
      const enterGameBtn = page.getByRole("button", { name: "进入游戏", exact: true });
      
      const loginResult = await Promise.race([
        enterGameBtn.waitFor({ state: "visible", timeout: 8000 }).then(() => "success"),
        page.waitForSelector(".el-message--success .el-message__content", { state: "visible", timeout: 8000 }).then(() => "success"),
        page.waitForSelector(".el-message--error .el-message__content", { state: "visible", timeout: 8000 })
            .then(async (el) => {
              const text = await el.textContent();
              return "error: " + text;
            }).catch(() => "timeout")
      ]).catch(() => "timeout");

      if (loginResult.startsWith("error:")) {
        const errorMsg = loginResult.replace("error: ", "");
        throw new Error(`登录失败: ${errorMsg}`);
      }

      const isEnterGameVisible = await enterGameBtn.waitFor({ state: "visible", timeout: 8000 }).then(() => true).catch(() => false);
      if (!isEnterGameVisible) {
         throw new Error("登录失败或未能进入游戏: 未能找到进入游戏按钮");
      }

      console.log("点击进入游戏...");
      await enterGameBtn.click();

      // -- 挂共斗 --
      console.log("尝试寻找并执行共斗...");
      const coopTab = page.locator("button").filter({ hasText: /^共斗$/ }).first();
      const isCoopVisible = await coopTab.waitFor({ state: "visible", timeout: 8000 }).then(() => true).catch(() => false);

      if (isCoopVisible) {
        console.log("切换到共斗页面...");
        await coopTab.click();

        const tabSelector = modeVal === "1" ? "#tab-advance" : "#tab-normal";
        const tabBtn = page.locator(tabSelector);
        await tabBtn.waitFor({ state: "visible", timeout: 5000 });
        console.log(`正在点击切换到 ${MODE} 模式...`);
        await tabBtn.click();

        const paneSelector = modeVal === "1" ? "#pane-advance" : "#pane-normal";
        const pane = page.locator(paneSelector);

        const cancelBtn = pane.locator("button").filter({ hasText: /^取消$/ }).first();
        const isCancelVisible = await cancelBtn.waitFor({ state: "visible", timeout: 2000 }).then(() => true).catch(() => false);
        
        if (isCancelVisible) {
          console.log(`检测到正在挂机，点击“取消”按钮...`);
          await cancelBtn.click();
          const confirmBtn = page.locator(".el-message-box__btns button").filter({ hasText: "确定" }).first();
          await confirmBtn.waitFor({ state: "visible", timeout: 5000 });
          await confirmBtn.click();
        }

        const autoBtn = pane.locator("button").filter({ hasText: /^自动$/ }).first();
        await autoBtn.waitFor({ state: "visible", timeout: 5000 });
        console.log(`点击“自动”按钮...`);
        await autoBtn.click();

        const eightHourBtn = pane.locator("button").filter({ hasText: /^8 小时$/ }).first();
        await eightHourBtn.waitFor({ state: "visible", timeout: 5000 });
        console.log("点击“8 小时”...");
        await eightHourBtn.click();

        const finalConfirmBtn = page.locator(".el-message-box__btns button").filter({ hasText: "确定" }).first();
        await finalConfirmBtn.waitFor({ state: "visible", timeout: 3000 });
        console.log("点击“确定”开始挂机...");
        await finalConfirmBtn.click();
      }

      await page.waitForTimeout(1000);
      await page.screenshot({ path: "status_" + username + ".png" });

      console.log("账号 " + username + " 脚本执行成功！");
      success = true;
      break;
    } catch (error) {
      console.error(
        "账号 " + username + " 执行出错 (尝试 " + (attempt + 1) + "/" + (MAX_RETRIES + 1) + "):",
        error,
      );
      await page.screenshot({ path: "error_" + username + "_attempt_" + attempt + ".png" });
      
      if (error.message && error.message.includes("登录失败")) {
        console.error("检测到登录失败，取消该账号后续重试。");
        await browser.close();
        break;
      }
    } finally {
      if (browser.isConnected()) {
        await browser.close();
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log("等待 10 秒后进行下一次重试...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
  return success;
}

(async () => {
  const ACCOUNTS_STR = process.env.WARSOUL_ACCOUNTS;
  let accounts = [];

  if (ACCOUNTS_STR) {
    try {
      accounts = JSON.parse(ACCOUNTS_STR);
    } catch (e) {
      console.error("WARSOUL_ACCOUNTS 格式错误，应为 JSON 数组。将尝试读取单个变量...");
    }
  }

  if (accounts.length === 0) {
    const USERNAME = process.env.WARSOUL_USERNAME;
    const PASSWORD = process.env.WARSOUL_PASSWORD;
    const MODE_VAL = process.env.WARSOUL_MODE || "0";
    if (USERNAME && PASSWORD) {
      accounts.push({ username: USERNAME, password: PASSWORD, mode: MODE_VAL });
    }
  }

  if (accounts.length === 0) {
    console.error("请设置环境变量 WARSOUL_ACCOUNTS (JSON) 或 WARSOUL_USERNAME/PASSWORD");
    process.exit(1);
  }

  console.log("检测到 " + accounts.length + " 个账号，开始串行处理...");

  let allSuccess = true;
  for (const acc of accounts) {
    const res = await runForAccount(acc.username, acc.password, acc.mode || "0");
    if (!res) allSuccess = false;
  }

  if (!allSuccess) {
    console.error("\n部分账号处理失败。");
    process.exit(1);
  } else {
    console.log("\n所有账号处理完毕！");
  }
})();
