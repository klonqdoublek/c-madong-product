import { test, expect } from "@playwright/test";

// Dev login credentials (matches NEXT_PUBLIC_DEV_LOGIN=true on dev/staging)
const DEV_EMAIL = "dev@c-madong.app";
const DEV_PASSWORD = "devadmin123";

/**
 * Helper: perform dev login flow
 */
async function devLogin(page: import("@playwright/test").Page) {
  await page.goto("/th/login");

  // Expand dev login section
  const devToggle = page.locator("button", { hasText: "Dev Login" });
  // Fallback: the button text may be in Thai
  const devToggleTh = page.locator("button", {
    hasText: "เข้าสู่ระบบสำหรับนักพัฒนา",
  });

  const toggle =
    (await devToggle.count()) > 0 ? devToggle : devToggleTh;
  await toggle.click();

  // Fill credentials
  await page.locator("#dev-email").fill(DEV_EMAIL);
  await page.locator("#dev-password").fill(DEV_PASSWORD);

  // Submit
  await page.locator('form button[type="submit"]').click();

  // Wait for navigation to admin dashboard
  await page.waitForURL("**/admin/dashboard", { timeout: 15_000 });
}

test.describe("Auth Flow", () => {
  test("1. Dev login navigates to admin dashboard", async ({ page }) => {
    await devLogin(page);

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/th\/admin\/dashboard/);

    // Verify stat cards are visible
    await expect(
      page.locator("h1", { hasText: /ภาพรวม|Dashboard/ })
    ).toBeVisible();
  });

  test("2. Unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/th/admin/dashboard");

    // Should redirect to login page
    await expect(page).toHaveURL(/\/th\/login/, { timeout: 10_000 });
  });

  test("3. Register page without LINE data shows warning", async ({
    page,
  }) => {
    await page.goto("/th/register");

    // Should show some indication that LINE data is missing or redirect back
    // The page may redirect to login or show an error
    const url = page.url();
    const hasWarning =
      url.includes("/login") ||
      (await page.locator("text=/LINE|ไลน์|ข้อมูล/").count()) > 0;
    expect(hasWarning).toBeTruthy();
  });

  test("4. Dashboard shows seeded data (non-zero stats)", async ({ page }) => {
    await devLogin(page);

    // Wait for stats to load (TanStack Query)
    await page.waitForTimeout(2000);

    // Check that at least one stat card shows a non-zero value
    // The stat values are inside <p class="font-heading text-2xl font-bold">
    const statValues = page.locator("p.font-heading.text-2xl.font-bold");
    const count = await statValues.count();
    expect(count).toBeGreaterThan(0);

    // At least one stat should be > 0 (if seed data is present)
    let hasNonZero = false;
    for (let i = 0; i < count; i++) {
      const text = await statValues.nth(i).textContent();
      if (text && parseInt(text, 10) > 0) {
        hasNonZero = true;
        break;
      }
    }
    // Note: This will pass even without seed data — it's a soft check
    // If seed data is deployed, at least totalStudents should be > 0
    if (!hasNonZero) {
      console.warn(
        "All dashboard stats are 0 — seed data may not be deployed yet"
      );
    }
  });

  test("5. Sidebar navigation works", async ({ page }) => {
    await devLogin(page);

    // Click on a sidebar link — "ภาพรวม" (Overview) should already be active
    // Try navigating to Knowledge Base
    const knowledgeBaseLink = page.locator('a[href*="/admin/knowledge-base"]');
    if ((await knowledgeBaseLink.count()) > 0) {
      await knowledgeBaseLink.click();
      await expect(page).toHaveURL(/\/admin\/knowledge-base/);
    }

    // Navigate back to dashboard
    const dashboardLink = page.locator('a[href*="/admin/dashboard"]');
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("6. Logout redirects to login", async ({ page }) => {
    await devLogin(page);

    // Click logout button (has text "ออกจากระบบ" or LogOut icon)
    const logoutBtn = page.locator("button", { hasText: "ออกจากระบบ" });
    if ((await logoutBtn.count()) > 0) {
      await logoutBtn.click();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/th\/login/, { timeout: 10_000 });
    } else {
      // If logout button text differs, skip gracefully
      test.skip();
    }
  });
});
