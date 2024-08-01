// @ts-check
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  // Navigate to the home page before each test
  await page.goto("http://127.0.0.1:3000");
});

test.describe("Navbar Tests", () => {
  test("Navbar title is visible and correct", async ({ page }) => {
    const navbarTitle = page.locator(".navbar-title");
    await expect(navbarTitle).toBeVisible();
    await expect(navbarTitle).toHaveText("News Website");
  });

  test("Home Page link is visible and navigates to the home page", async ({
    page,
  }) => {
    const homeLink = page.locator('.navbar-links a:has-text("Home")');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");

    await homeLink.click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/");
  });

  test("Sign In link is visible and navigates to user authentication page", async ({
    page,
  }) => {
    const signInLink = page.locator('.navbar-links a:has-text("Sign In")');
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/user");

    await signInLink.click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/user");
  });
});

test.describe("Search Bar and Search Functionality Tests", () => {
  test("Search Bar initial state", async ({ page }) => {
    // Check if the search input and button are visible
    await expect(page.locator(".search-input")).toBeVisible();
    await expect(page.locator(".search-button")).toBeVisible();

    // Check if the initial search message is displayed
    const searchMessage = page.locator(
      'text="Please enter a keyword to search for articles."'
    );
    await expect(searchMessage).toBeVisible();
  });

  test("Search Input test", async ({ page }) => {
    const searchInput = page.locator(".search-input");
    await searchInput.fill("test search");
    await expect(searchInput).toHaveValue("test search");
  });

  test("Search Functionality test without login", async ({ page }) => {
    const searchInput = page.locator(".search-input");
    const searchButton = page.locator(".search-button");

    await searchInput.fill("test search");
    await searchButton.click();

    // Check if the "must be logged in" message appears
    const loginMessage = page.locator(
      'text="You must be logged in to search."'
    );
    await expect(loginMessage).toBeVisible();
  });

  test("Search Functionality Test with mock api response for internal server error ", async ({
    page,
  }) => {
    // Mock the localStorage to simulate a logged-in state
    await page.evaluate(() => {
      localStorage.setItem("accessToken", "test-access-token");
    });

    // Mock the API to return a server error
    await page.route("**/search**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          message: "API Request Failed.",
        }),
      });
    });

    const searchInput = page.locator(".search-input");
    const searchButton = page.locator(".search-button");

    await searchInput.fill("test search");
    await searchButton.click();

    // Check if the error message appears
    const errorMessage = page.locator(
      'text="Failed to search for articles. Please try again later."'
    );
    await expect(errorMessage).toBeVisible();
  });

  test("Search Functionality test with expired token and failed refresh token", async ({
    page,
  }) => {
    // Mock the localStorage to simulate a logged-in state with expired tokens
    await page.evaluate(() => {
      localStorage.setItem("accessToken", "expired-access-token");
      localStorage.setItem("refreshToken", "expired-refresh-token");
    });

    // Mock the search API to return 401 for expired token
    await page.route("**/search**", async (route) => {
      await route.fulfill({ status: 401 });
    });

    // Mock the refresh token API to fail
    await page.route("**/refresh-token", async (route) => {
      await route.fulfill({ status: 401 });
    });

    const searchInput = page.locator(".search-input");
    const searchButton = page.locator(".search-button");

    await searchInput.fill("test search");
    await searchButton.click();

    // Check if the "logged out" message appears
    const loggedOutMessage = page.locator(
      'text="You are logged out. Please log in again."'
    );
    await expect(loggedOutMessage).toBeVisible();
  });

  test("Search functionality with mock login and successful returns", async ({
    page,
  }) => {
    // Mock the localStorage getItem to simulate a logged-in state
    await page.evaluate(() => {
      localStorage.setItem("accessToken", "test-access-token");
    });

    // Mock the API response
    await page.route("**/search**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "ok",
          article_count: "2",
          article_list: [
            {
              url: "https://example.com/article1",
              urlToImage: "https://example.com/image1.jpg",
              author: "Hoang Tran",
              source: { name: "NBC News" },
              title: "Test Article 1",
              description: "This is a test article",
            },
            {
              url: "https://example.com/article2",
              urlToImage: "https://example.com/image2.jpg",
              author: "Kevin Tran",
              source: { name: "Fox News" },
              title: "Test Article 2",
              description: "This is another test article",
            },
          ],
        }),
      });
    });

    const searchInput = page.locator(".search-input");
    const searchButton = page.locator(".search-button");

    await searchInput.fill("test search");
    await searchButton.click();

    // Check if the search results are displayed
    const resultsContainer = page.locator(".results-container");
    await expect(resultsContainer).toBeVisible();

    // Check if the correct number of article cards are displayed
    const articleCards = page.locator(".article-card");
    await expect(articleCards).toHaveCount(2);

    // Check the content of the first article card
    const firstCard = articleCards.first();
    await expect(firstCard.locator(".article-title")).toHaveText(
      "Test Article 1"
    );
    await expect(firstCard.locator(".article-author")).toHaveText("Hoang Tran");
    await expect(firstCard.locator(".article-source")).toHaveText("NBC News");
    await expect(firstCard).toHaveAttribute(
      "href",
      "https://example.com/article1"
    );
    await expect(firstCard.locator("img")).toHaveAttribute(
      "src",
      "https://example.com/image1.jpg"
    );
    await expect(firstCard.locator("img")).toHaveAttribute(
      "alt",
      "This is a test article"
    );

    // Check the second card
    const secondCard = articleCards.nth(1);
    await expect(secondCard.locator(".article-title")).toHaveText(
      "Test Article 2"
    );
    await expect(secondCard.locator(".article-author")).toHaveText(
      "Kevin Tran"
    );
    await expect(secondCard.locator(".article-source")).toHaveText("Fox News");
    await expect(secondCard).toHaveAttribute(
      "href",
      "https://example.com/article2"
    );
    await expect(secondCard.locator("img")).toHaveAttribute(
      "src",
      "https://example.com/image2.jpg"
    );
    await expect(secondCard.locator("img")).toHaveAttribute(
      "alt",
      "This is another test article"
    );
  });
});
