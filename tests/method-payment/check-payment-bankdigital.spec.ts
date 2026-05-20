import { test, expect } from '@playwright/test';

// Grup test untuk memverifikasi alur pembayaran menggunakan metode Bank Digital
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

    // Test case: memverifikasi metode pembayaran Jenius (Bank Digital)
    test('Jenius', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih Jenius
        await test.step('Pilih metode pembayaran: Jenius', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();

            await page.getByText('Bank Digital').click();
            await page.getByText('Jenius').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        // Langkah 2: Validasi halaman pembayaran Jenius tampil dengan elemen yang benar
        await test.step('Validasi halaman Jenius berhasil dimuat', async () => {
            await expect(page.getByText('Choose Payment Method Digital')).toBeVisible();
            // Pastikan heading form Jenius muncul
            await expect(page.getByLabel('Jenius Pay').locator('h4')).toContainText('Form Payment');
            // Pastikan field $Cashtag tersedia untuk diisi
            await expect(page.locator('app-form-payment-jenius')).toContainText('$Cashtag *');
            await expect(page.getByRole('textbox', { name: '$Cashtag' })).toBeVisible();
        });
    });

});
