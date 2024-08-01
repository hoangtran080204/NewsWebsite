const { test, expect } = require("@playwright/test");
test.beforeEach(async ({ page }) => {
  // Navigate to the authentication page before each test
  await page.goto("http://127.0.0.1:3000/user");
});

test.describe("User Authentication Page Tests", () => {
  test("Login/Signup form is visible", async ({ page }) => {
    await expect(page.locator(".login-signup-form")).toBeVisible();
    await expect(page.locator(".form-title")).toHaveText("Welcome");
    await expect(page.locator(".login-button")).toBeVisible();
    await expect(page.locator(".signup-button")).toBeVisible();
  });

  test("Input fields are present and functional", async ({ page }) => {
    const usernameInput = page.locator('input[placeholder="Username"]');
    const passwordInput = page.locator('input[placeholder="Password"]');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await usernameInput.fill("testuser");
    await passwordInput.fill("testpassword");

    await expect(usernameInput).toHaveValue("testuser");
    await expect(passwordInput).toHaveValue("testpassword");
  });

  test("Login with valid credentials test", async ({ page }) => {
    // Mock the API response for successful login
    await page.route("**/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "ok",
          message: "Login successful",
          access_token: "test_access_token",
          refresh_token: "test_refresh_token",
        }),
      });
    });

    await page.fill('input[placeholder="Username"]', "validuser");
    await page.fill('input[placeholder="Password"]', "validpassword");
    await page.click(".login-button");

    await expect(page.locator(".confirmation-message")).toHaveText(
      "Login successful"
    );

    // Check if tokens are stored in localStorage
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken")
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken")
    );
    expect(accessToken).toBe("test_access_token");
    expect(refreshToken).toBe("test_refresh_token");
  });

  test("Login with invalid credentials test", async ({ page }) => {
    // Mock the API response for failed login
    await page.route("**/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          message: "Invalid username or password",
        }),
      });
    });

    await page.fill('input[placeholder="Username"]', "invaliduser");
    await page.fill('input[placeholder="Password"]', "invalidpassword");
    await page.click(".login-button");

    await expect(page.locator(".confirmation-message")).toHaveText(
      "Invalid username or password"
    );

    // Check if tokens are null
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken")
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken")
    );
    expect(accessToken).toBe(null);
    expect(refreshToken).toBe(null);
  });

  test("Signup with new username test", async ({ page }) => {
    // Mock the API response for successful signup
    await page.route("**/signup", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: "ok",
          message: "Account created successfully",
          access_token: "new_access_token",
          refresh_token: "new_refresh_token",
        }),
      });
    });

    await page.fill('input[placeholder="Username"]', "newuser");
    await page.fill('input[placeholder="Password"]', "newpassword");
    await page.click(".signup-button");

    await expect(page.locator(".confirmation-message")).toHaveText(
      "Account created successfully"
    );

    // Check if tokens are stored in localStorage
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken")
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken")
    );
    expect(accessToken).toBe("new_access_token");
    expect(refreshToken).toBe("new_refresh_token");
  });

  test("Signup with existing username test", async ({ page }) => {
    // Mock the API response for failed signup
    await page.route("**/signup", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          message: "Sorry, this username already exists.",
        }),
      });
    });

    await page.fill('input[placeholder="Username"]', "existinguser");
    await page.fill('input[placeholder="Password"]', "somepassword");
    await page.click(".signup-button");

    await expect(page.locator(".confirmation-message")).toHaveText(
      "Sorry, this username already exists."
    );

    // Check if tokens are null
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken")
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken")
    );
    expect(accessToken).toBe(null);
    expect(refreshToken).toBe(null);
  });

  test("Empty form submission test", async ({ page }) => {
    await page.click(".login-button");
    // Check if the browser's default form validation prevents submission
    await expect(
      page.locator('input[placeholder="Username"]:invalid')
    ).toBeVisible();
  });

  test("API server error handling test", async ({ page }) => {
    // Mock a server error response
    await page.route("**/login", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          message: "An error occurred",
        }),
      });
    });

    await page.fill('input[placeholder="Username"]', "someuser");
    await page.fill('input[placeholder="Password"]', "somepassword");
    await page.click(".login-button");

    await expect(page.locator(".confirmation-message")).toHaveText(
      "An error occurred"
    );
  });
});
