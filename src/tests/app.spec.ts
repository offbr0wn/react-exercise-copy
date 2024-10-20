import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("HomePage tests", () => {
  test("can view homepage correctly without and accessibility errors", async ({
    page,
  }) => {
    await page.goto(`/`);
    await expect(page.locator('h1:has-text("React Exercise")')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("main")
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Form Component Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display validation error for empty keywords", async ({
    page,
  }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    const errorMessage = page.locator(
      "text=keywords must have at least 2 characters."
    );
    await expect(errorMessage).toBeVisible();
  });

  test("should display validation error for invalid yearStart", async ({
    page,
  }) => {
    const yearStartField = page.locator('input[name="yearStart"]');
    await yearStartField.fill("1899");

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    const errorMessage = page.locator("text=Year start must be after 1900.");
    await expect(errorMessage).toBeVisible();
  });

  test("should display validation error for unselected media type", async ({
    page,
  }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    const errorMessage = page.locator("text=Please select a media type");
    await expect(errorMessage).toBeVisible();
  });

  test("should not display validation error for selected media type", async ({
    page,
  }) => {
    const mediaTypeSelect = page.locator('select[name="mediaType"]');
    await mediaTypeSelect.selectOption("audio");
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    const errorMessage = page.locator("text=Please select a media type");
    await expect(errorMessage).toBeHidden();
  });
});

test.describe("NASA API Data Display Tests", () => {
  test("should load and display NASA data in the table", async ({ page }) => {
    // Navigate to the page where the form and table are located
    await page.goto("/");

    // Ensure the page is fully loaded
    await page.waitForLoadState("networkidle");

    // Fill in the form fields with valid data
    await page.fill('input[name="keywords"]', "moon");
    await page.selectOption('select[name="mediaType"]', "video");
    await page.fill('input[name="yearStart"]', "2000");

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for the table to be visible
    const resultTable = page.locator("table");
    await expect(resultTable).toBeVisible();

    // Check if the table contains any rows
    const resultRows = page.locator("table tr");
    expect(await resultRows.count()).toBeGreaterThan(0);

    // Verify that at least one row contains the media type "video"
    const videoRows = resultRows.locator('td:has-text("video")');
    const videoRowCount = await videoRows.count();
    expect(videoRowCount).toBeGreaterThan(0);
  });
});
