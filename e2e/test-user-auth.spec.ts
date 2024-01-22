import { test, expect } from '@playwright/test';

test('Mock user creating an account', async ({ page }) => {
  // Mock the api call before navigating
  const registerApiUrl = process.env.NEXT_REGISTER_USER_URL
  const siteUrl = process.env.NEXT_SITE_URL;

  await page.route(registerApiUrl, async route => {
    const response = {
      body: '{ \
        "firstName": "Mock",\
        "lastName": "User",\
        "email": "mockuser@email.com",\
        "password": "m/o/c/k/u/s/e/r#1",\
        "accountType": "teacher",\
        "lastLogin": "778876558"}'
    };
    await route.fulfill(response);
  });

  await page.goto(`${siteUrl}/register`);
  const registerPageText = await page.getByText('Create an account')
  expect(registerPageText).toBeVisible()

  const firstNameInput = page.locator('#firstName')
  await firstNameInput.fill('Mock')
  const firstNameVal = await firstNameInput.inputValue()
  expect(firstNameVal).toEqual('Mock');

  const lastNameInput = page.locator('#lastName')
  await lastNameInput.fill('User');
  const lastNameVal = await lastNameInput.inputValue()
  expect(lastNameVal).toEqual('User');

  const passwordInput = page.locator('#password')
  await passwordInput.fill('mockuser#1');
  const passwordVal = await passwordInput.inputValue()
  expect(passwordVal).toEqual('mockuser#1');

  const emailInput = page.locator('#email');
  await emailInput.fill('mockuser@email.com');
  const emailValue = await emailInput.inputValue()
  expect(emailValue).toEqual('mockuser@email.com');

  const teacherRadioBtn = page.locator('#teacher');
  await teacherRadioBtn.click();
  const teacherRadioVal = await teacherRadioBtn.isChecked()
  expect(teacherRadioVal).toBe(true)

  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL(`${siteUrl}/Mock-User`)
  await expect(page).toHaveURL(`${siteUrl}/Mock-User`)
});

test.skip('Mock user login into an existing account', async ({ page }) => {
  // Mock the api call before navigating
  const loginApiUrl = process.env.NEXT_LOGIN_USER_URL;
  const siteUrl = process.env.NEXT_SITE_URL;

  await page.route(loginApiUrl, async route => {
    const response = {
      body: '{ \
        "email": "mockuser@email.com",\
        "password": "m/o/c/k/u/s/e/r#1"}'
    };
    await route.fulfill(response);
  });

  await page.goto(`${siteUrl}/login`);
  const loginPageText = await page.getByText('Sign in to your account')
  expect(loginPageText).toBeVisible()

  const emailInput = page.locator("#email")
  await emailInput.fill("mockuser@email.com")
  const emailVal = await emailInput.inputValue()
  expect(emailVal).toEqual("mockuser@email.com")

  const passwordInput = page.locator('#password')
  await passwordInput.fill('mockuser#1');
  const passwordVal = await passwordInput.inputValue()
  expect(passwordVal).toEqual('mockuser#1');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(`${siteUrl}/Mock-User`);
});


