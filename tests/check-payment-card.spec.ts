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

    test('Debit Credit Card', async ({ page }) => {
        
        await test.step('Pilih metode pembayaran: Debit Credit Card', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('Credit Card', { exact: true }).click();
            await page.getByText('Debit Credit Card').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        await test.step('Validasi Pop-up Form Kartu Credit Debit berhasil dimuat', async () => {
            const creditCardFrame = page.frameLocator('iframe[name^="popup_"]');

            await expect(creditCardFrame.locator('form')).toContainText('Kartu kredit/debit');
            await expect(creditCardFrame.locator('form')).toContainText('Nomor kartu');
            await expect(creditCardFrame.locator('form')).toContainText('Masa berlaku');
            await expect(creditCardFrame.locator('form')).toContainText('CVV');
        });
    });

    test('Paypal', async ({ page }) => {
        
        await test.step('Pilih metode pembayaran: Paypal', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('Credit Card', { exact: true }).click();
            await page.getByText('Paypal').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
            await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
        });

        await test.step('Validasi Pop-up Paypal berhasil dimuat', async () => {
            const paypalFrame = page.frameLocator('iframe[name^="__zoid__paypal_buttons__"]');
            
            await expect(paypalFrame.getByText('Debit or Credit CardPowered by')).toBeVisible();
            await expect(paypalFrame.getByRole('link', { name: 'Debit or Credit Card' })).toBeVisible();
            await expect(paypalFrame.locator('div').filter({ hasText: 'Powered by' }).nth(2)).toBeVisible();
        });
    });

});