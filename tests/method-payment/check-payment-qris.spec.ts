import { test, expect } from '@playwright/test';

test.describe('Check Metode Pembayaran - QRIS', () => {

    test.setTimeout(40000);

    test.beforeEach(async ({ page }) => {

        await test.step('Navigasi ke halaman Zakat Penghasilan', async () => {
            await page.goto('https://www.rumahzakat.org/donasi');

            await page.getByRole('button', { name: 'Close popup' }).click();

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

    test('QRIS', async ({ page }) => {

        await test.step('Pilih metode pembayaran: QRIS', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('QRIS').first().click();
            await page.getByRole('img', { name: 'QRIS' }).click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
            await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
        });

        await test.step('Validasi Halaman Instruksi Pembayaran QRIS', async () => {
            await expect(page.getByRole('button', { name: 'Download QRIS' })).toBeVisible();
            await expect(page.getByRole('img', { name: 'QR Code' })).toBeVisible();

            // // Validasi QR Code Faspay
            // await expect(page.locator('#vanumber')).toContainText('Nomor Transaksi');
            // await expect(page.getByRole('rowgroup')).toContainText('Merchant');
            // await expect(page.getByRole('rowgroup')).toContainText('Yayasan Rumah Zakat');
            // await expect(page.locator('#totpay')).toContainText('Total Pembayaran');
        });
    });

});
