import { test, expect, Request } from '@playwright/test';

test.describe('Flip', () => {
    test.beforeEach(async ({ page }) => {

        await test.step('Navigasi ke halaman Zakat Penghasilan', async () => {
            await page.goto('https://www.rumahzakat.org/donasi/zakat-penghasilan');

            await page.getByRole('button', { name: 'Close popup' }).click();
            await page.getByRole('button', { name: 'Tunaikan Sekarang' }).click();
        });

        await test.step('Isi form data diri donatur', async () => {
            await page.getByRole('textbox', { name: 'Nama' }).fill('testing');
            await page.getByRole('textbox', { name: 'Telephone' }).fill('08123456789');
            await page.getByRole('textbox', { name: 'Email' }).fill('testing@test.test');
            await page.getByRole('checkbox', { name: 'Dengan ini, saya menyetujui' }).check();
            await page.mouse.wheel(0, 600);

            const buttonCloseSedekahDaging = page.getByRole('button', { name: 'Oke, Tutup', exact: true });
            const buttonCloseInfakID = page.getByRole('button', { name: 'Tutup', exact: true });
            await buttonCloseSedekahDaging.or(buttonCloseInfakID).click();
        });
    });

    test('Flip', async ({ page }) => {
        const FLIP_URL = /^https:\/\/(pwf\.)?flip\.id\/pwf\//;
        let flipRequest!: Promise<Request>;

        await test.step('Pilih metode pembayaran: Flip', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('Flip').first().click();
            await page.getByText('Flip').nth(1).click();

            await page.route(/^https:\/\/([a-z]+\.)?flip\.id\//, async route => {
                if (route.request().resourceType() === 'document') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'text/html',
                        body: '<html><body><h1>Simulated Flip Payment Page</h1></body></html>',
                    });
                } else {
                    await route.abort();
                }
            });

            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
            flipRequest = page.waitForRequest(req => FLIP_URL.test(req.url()) && req.isNavigationRequest());
            await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
        });

        await test.step('Validasi redirect ke Flip (mocked)', async () => {
            const req = await flipRequest;
            expect(req.url()).toContain('RZTumbuhBersama');
            await expect(page).toHaveURL(FLIP_URL);
            await expect(page.getByRole('heading', { name: 'Simulated Flip Payment Page' })).toBeVisible();
        });
    });

});
