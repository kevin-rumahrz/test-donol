import { test, expect } from '@playwright/test';

// Grup test untuk memverifikasi alur pembayaran menggunakan metode Kartu Kredit/Debit dan PayPal
test.describe('Check Metode Pembayaran - Credit Card', () => {

    // Timeout maksimal 40 detik per test case, mengakomodasi loading halaman yang lambat
    test.setTimeout(40000);

    // Setup yang dijalankan sebelum setiap test case dalam grup ini
    test.beforeEach(async ({ page }) => {

        // Langkah 1: Navigasi ke halaman form donasi Zakat Penghasilan
        await test.step('Navigasi ke halaman Zakat Penghasilan', async () => {
            await page.goto('https://www.rumahzakat.org/donasi');

            // Tutup popup yang muncul saat halaman pertama kali dibuka
            await page.getByRole('button').filter({ hasText: /^$/ }).click();
            
            await page.getByRole('link', { name: 'Zakat', exact: true }).click();
            await page.getByRole('link', { name: 'Zakat Penghasilan' }).click();
            await page.getByRole('button', { name: 'Tunaikan Sekarang' }).click();
        });

        // Langkah 2: Mengisi data diri donatur dengan data dummy untuk keperluan testing
        await test.step('Isi form data diri donatur', async () => {
            await page.getByRole('textbox', { name: 'Nama' }).fill('testing');
            await page.getByRole('textbox', { name: 'Telephone' }).fill('08123456789');
            await page.getByRole('textbox', { name: 'Email' }).fill('testing@test.test');
            await page.getByRole('checkbox', { name: 'Dengan ini, saya menyetujui' }).check();
            // Scroll ke bawah untuk memunculkan tombol konfirmasi
            await page.mouse.wheel(0, 600);

            // Tangani dua kemungkinan popup yang bisa muncul setelah scroll:
            // - "Oke, Tutup" untuk popup Sedekah Daging
            // - "Tutup" untuk popup Infak ID
            const buttonCloseSedekahDaging = page.getByRole('button', { name: 'Oke, Tutup', exact: true });
            const buttonCloseInfakID = page.getByRole('button', { name: 'Tutup', exact: true });
            await buttonCloseSedekahDaging.or(buttonCloseInfakID).click();
        });
    });

    // Test case: memverifikasi metode pembayaran Debit/Credit Card via iPay88
    test('Debit Credit Card', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih Debit Credit Card
        await test.step('Pilih metode pembayaran: Debit Credit Card', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();

            await page.getByText('Credit Card', { exact: true }).click();
            await page.getByText('Debit Credit Card').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        // Langkah 2: Validasi form kartu kredit/debit muncul di dalam iframe popup iPay88
        await test.step('Validasi Pop-up Form Kartu Credit Debit berhasil dimuat', async () => {
            // Form ditampilkan di dalam iframe, bukan langsung di halaman utama
            const creditCardFrame = page.frameLocator('iframe[name^="popup_"]');

            // Pastikan semua field kartu tersedia
            await expect(creditCardFrame.locator('form')).toContainText('Kartu kredit/debit');
            await expect(creditCardFrame.locator('form')).toContainText('Nomor kartu');
            await expect(creditCardFrame.locator('form')).toContainText('Masa berlaku');
            await expect(creditCardFrame.locator('form')).toContainText('CVV');
        });
    });

    // Test case: memverifikasi metode pembayaran PayPal
    test('Paypal', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih PayPal
        await test.step('Pilih metode pembayaran: Paypal', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();

            await page.getByText('Credit Card', { exact: true }).click();
            await page.getByText('Paypal').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
            // Konfirmasi doa yang muncul sebelum redirect ke PayPal
            await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
        });

        // Langkah 2: Validasi tombol PayPal muncul di dalam iframe resmi PayPal
        await test.step('Validasi Pop-up Paypal berhasil dimuat', async () => {
            // PayPal merender tombolnya di dalam iframe dengan nama yang mengandung "__zoid__paypal_buttons__"
            const paypalFrame = page.frameLocator('iframe[name^="__zoid__paypal_buttons__"]');

            await expect(paypalFrame.getByText('Debit or Credit CardPowered by')).toBeVisible();
            await expect(paypalFrame.getByRole('link', { name: 'Debit or Credit Card' })).toBeVisible();
            await expect(paypalFrame.locator('div').filter({ hasText: 'Powered by' }).nth(2)).toBeVisible();
        });
    });

});
