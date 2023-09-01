import { test, expect } from '@playwright/test'

test.skip('User Auth', async ({ page }) => {
  await page.goto('https://eduplanner-jade.vercel.app/');
  const pageText = await page.getByText('Hello, Next.js!');
  expect(pageText).toBeVisible();

  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page).toHaveURL('/login')
  const loginPageText = await page.getByText('Sign in to your account')
  expect(loginPageText).toBeVisible()

  await page.getByLabel('Username or Email').fill('sysadmin');
  await page.getByLabel('Password').fill('sysadmin');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/user/sysadmin')
  const userDashboardText = await page.getByText('Welcome Kelly!')
  expect(userDashboardText).toBeVisible()
});