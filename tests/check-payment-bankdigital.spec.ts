import { test, expect } from '@playwright/test';

test.describe('Check Metode Pembayaran - Credit Card', () => {
    
    test.setTimeout(40000);

    test.beforeEach(async ({ page }) => {
        await test.step('Navigasi ke halaman Zakat Penghasilan', async () => {
            await page.goto('https://www.rumahzakat.org/donasi');
            await page.getByRole('button').filter({ hasText: /^$/ }).click();
            await page.getByRole('link', { name: 'Zakat', exact: true }).click();
            await page.getByRole('link', { name: 'Zakat Penghasilan' }).click();
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

    test('Jenius', async ({ page }) => {
        
        await test.step('Pilih metode pembayaran: Jenius', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('Bank Digital').click();
            await page.getByText('Jenius').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        await test.step('Validasi halaman Jenius berhasil dimuat', async () => {
            await expect(page.getByText('Choose Payment Method Digital')).toBeVisible();
            await expect(page.getByLabel('Jenius Pay').locator('h4')).toContainText('Form Payment');
            await expect(page.locator('app-form-payment-jenius')).toContainText('$Cashtag *');
            await expect(page.getByRole('textbox', { name: '$Cashtag' })).toBeVisible();

        });
    });

});