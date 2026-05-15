import { test, expect } from '@playwright/test';

test.describe('Check Metode Pembayaran - E-Wallet', () => {
    
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

    test('GoPay', async ({ page }) => {
        
        await test.step('Pilih metode pembayaran: GoPay', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('eWallet').click();
            await page.getByText('Gopay', { exact: true }).click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        await test.step('Validasi Pop-up QRIS GoPay berhasil dimuat', async () => {
            const gopayFrame = page.frameLocator('iframe[name^="popup_"]');

            await expect(gopayFrame.locator('div').filter({ hasText: /^GoPay QRIS$/ })).toBeVisible();
            await expect(gopayFrame.getByRole('img', { name: 'qr-code' })).toBeVisible();
            await expect(gopayFrame.getByText('Cara bayar')).toBeVisible();
            await expect(gopayFrame.getByRole('button', { name: 'Download QRIS' })).toBeVisible();
            await expect(gopayFrame.getByRole('button', { name: 'Cek status' })).toBeVisible();
        });
    });

    test('ShopeePay', async ({ page }) => {
        await test.step('Pilih metode pembayaran: ShopeePay', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('eWallet').click();
            await page.getByText('ShopeePay').click();
            
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
            await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
        });

        await test.step('Validasi Halaman Instruksi Pembayaran ShopeePay', async () => {
            await expect(page.getByRole('main')).toContainText('Scan QR Berikut dengan Aplikasi ShopeePay');
            
            await expect(page.getByRole('img', { name: 'Qr Shoope', exact: true })).toBeVisible();
            
            await expect(page.getByRole('main')).toContainText('Panduan Pembayaran via');
        });
    });

    test('OVO', async ({ page }) => {
        await test.step('Pilih metode pembayaran: OVO', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('eWallet').click();
            await page.getByText('OVO').click();
            
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        await test.step('Validasi Halaman Instruksi Pembayaran ShopeePay', async () => {
            await expect(page.locator('body')).toContainText('Segera lakukan konfirmasi pembayaran melalui aplikasi OVO Anda dalam waktu');
            await expect(page.locator('body')).toContainText('01 Periksa notifikasi / buka aplikasi OVO 02 Masukan kode keamanan Anda 03 Ketuk tombol bayar pada detil tagihan 04 Selamat pembayaran Anda berhasil');
            await expect(page.getByText('© 2026 iPay88 Indonesia. All')).toBeVisible();
        });
    });

    test('DANA', async ({ page }) => {
        await test.step('Pilih metode pembayaran: DANA', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('eWallet').click();
            await page.getByText('DANA', { exact: true }).click();
            
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        await test.step('Validasi Halaman Instruksi Pembayaran Dana', async () => {
            await expect(page.getByText('Step 1 Input Phone Number IN PROGRESS Step 2 Continue Payment Input your phone')).toBeVisible();

        });
    });

    test('Link Aja Syariah', async ({ page }) => {
        await test.step('Pilih metode pembayaran: Link Aja Syariah', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('eWallet').click();
            await page.getByText('LinkAja Syariah').click();            
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        await test.step('Validasi Halaman Instruksi Pembayaran Link Aja Syariah', async () => {
            await expect(page.locator('#payment-login')).toContainText('Phone Number LinkAja PIN Forgot PIN?');
            await expect(page.locator('#detail-text')).toBeVisible();
        });
    });

    test('Virgo', async ({ page }) => {
        await test.step('Pilih metode pembayaran: Virgo', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('eWallet').click();
            await page.getByText('Virgo').click();
            
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });
        

        await test.step('Validasi Halaman Instruksi Pembayaran Virgo', async () => {
            await expect(page.getByTestId('one-time-payment-login-interface-v1')).toBeVisible();
            await expect(page.getByTestId('one-time-payment-login-interface-v1')).toContainText('Masukkan nomor HP kamu');
        });
    });

    test('Link Aja', async ({ page }) => {
        await test.step('Pilih metode pembayaran: Link Aja', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            
            await page.getByText('eWallet').click();
            await page.getByText('LinkAja', { exact: true }).click();
            
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        await test.step('Validasi Halaman Instruksi Pembayaran Link Aja', async () => {
            await expect(page.locator('#payment-login')).toContainText('Phone Number LinkAja PIN Forgot PIN?');
            await expect(page.locator('#detail-text')).toBeVisible();
        });
    });

});