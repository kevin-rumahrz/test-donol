import { test, expect } from '@playwright/test';

// Grup test untuk memverifikasi alur pembayaran menggunakan metode QRIS
test.describe('Check Metode Pembayaran - QRIS', () => {

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

    // Test case: memverifikasi metode pembayaran QRIS menampilkan QR code yang dapat diunduh
    test('QRIS', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih QRIS
        await test.step('Pilih metode pembayaran: QRIS', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            // Gunakan .first() karena teks "QRIS" muncul lebih dari sekali di halaman
            await page.getByText('QRIS').first().click();
            await page.getByRole('img', { name: 'QRIS' }).click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
            // Konfirmasi doa yang muncul sebelum redirect ke halaman QRIS
            await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
        });

        // Langkah 2: Validasi halaman QRIS menampilkan gambar QR dan tombol unduh
        await test.step('Validasi Halaman Instruksi Pembayaran QRIS', async () => {
            // Pastikan area Download QRIS dan gambar QR code muncul di halaman
            await expect(page.locator('div').filter({ hasText: 'Download QRIS' }).nth(5)).toBeVisible();
            await expect(page.locator('img')).toBeVisible();
            // Pastikan tombol download tersedia agar user bisa menyimpan QR
            await expect(page.getByRole('button', { name: 'Download QRIS' })).toBeVisible();
        });
    });

});
