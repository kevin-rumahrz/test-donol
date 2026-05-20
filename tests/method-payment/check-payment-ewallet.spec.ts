import { test, expect } from '@playwright/test';

// Grup test untuk memverifikasi alur pembayaran menggunakan berbagai metode E-Wallet
test.describe('Check Metode Pembayaran - E-Wallet', () => {

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

    // Test case: memverifikasi metode pembayaran GoPay via QRIS popup
    test('GoPay', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih GoPay
        await test.step('Pilih metode pembayaran: GoPay', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('eWallet').click();
            await page.getByText('Gopay', { exact: true }).click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        // Langkah 2: Validasi popup QRIS GoPay tampil dengan semua elemen yang dibutuhkan
        await test.step('Validasi Pop-up QRIS GoPay berhasil dimuat', async () => {
            // GoPay merender halaman pembayarannya di dalam iframe dengan nama dinamis
            const gopayFrame = page.frameLocator('iframe[name^="popup_"]');

            await expect(gopayFrame.locator('div').filter({ hasText: /^GoPay QRIS$/ })).toBeVisible();
            // Pastikan QR code gambar tampil untuk dipindai
            await expect(gopayFrame.getByRole('img', { name: 'qr-code' })).toBeVisible();
            await expect(gopayFrame.getByText('Cara bayar')).toBeVisible();
            await expect(gopayFrame.getByRole('button', { name: 'Download QRIS' })).toBeVisible();
            await expect(gopayFrame.getByRole('button', { name: 'Cek status' })).toBeVisible();
        });
    });

    // Test case: memverifikasi metode pembayaran ShopeePay via QR code
    test('ShopeePay', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih ShopeePay
        await test.step('Pilih metode pembayaran: ShopeePay', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('eWallet').click();
            await page.getByText('ShopeePay').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
            // Konfirmasi doa yang muncul sebelum redirect ke halaman pembayaran
            await page.getByRole('button', { name: "Aamiin Ya Rabbal'alamin" }).click();
        });

        // Langkah 2: Validasi halaman instruksi pembayaran ShopeePay tampil dengan QR code
        await test.step('Validasi Halaman Instruksi Pembayaran ShopeePay', async () => {
            await expect(page.getByRole('main')).toContainText('Scan QR Berikut dengan Aplikasi ShopeePay');
            // Pastikan gambar QR code untuk ShopeePay tampil
            await expect(page.getByRole('img', { name: 'Qr Shoope', exact: true })).toBeVisible();
            await expect(page.getByRole('main')).toContainText('Panduan Pembayaran via');
        });
    });

    // Test case: memverifikasi metode pembayaran OVO via notifikasi push ke aplikasi
    test('OVO', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih OVO
        await test.step('Pilih metode pembayaran: OVO', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('eWallet').click();
            await page.getByText('OVO').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        // Langkah 2: Validasi halaman instruksi OVO tampil, mengarahkan user ke aplikasi OVO
        await test.step('Validasi Halaman Instruksi Pembayaran ShopeePay', async () => {
            await expect(page.locator('body')).toContainText('Segera lakukan konfirmasi pembayaran melalui aplikasi OVO Anda dalam waktu');
            // Pastikan panduan langkah-langkah pembayaran OVO tampil lengkap
            await expect(page.locator('body')).toContainText('01 Periksa notifikasi / buka aplikasi OVO 02 Masukan kode keamanan Anda 03 Ketuk tombol bayar pada detil tagihan 04 Selamat pembayaran Anda berhasil');
            await expect(page.getByText('© 2026 iPay88 Indonesia. All')).toBeVisible();
        });
    });

    //HOLD - Test DANA di-skip sementara
    // test('DANA', async ({ page }) => {
    //     await test.step('Pilih metode pembayaran: DANA', async () => {
    //         await page.getByText('Pilih Metode Pembayaran* Klik').click();
    //         await page.getByText('eWallet').click();
    //         await page.getByText('DANA', { exact: true }).click();
    //         await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
    //     });

    //     await test.step('Validasi Halaman Instruksi Pembayaran Dana', async () => {
    //         await page.waitForLoadState('domcontentloaded');
    //         await expect(page.getByText('Step 1 Input Phone Number IN PROGRESS Step 2 Continue Payment Input your phone')).toBeVisible();

    //     });
    // });

    // Test case: memverifikasi metode pembayaran LinkAja Syariah via login aplikasi
    test('Link Aja Syariah', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih LinkAja Syariah
        await test.step('Pilih metode pembayaran: Link Aja Syariah', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('eWallet').click();
            await page.getByText('LinkAja Syariah').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        // Langkah 2: Validasi halaman login LinkAja Syariah tampil dengan form autentikasi
        await test.step('Validasi Halaman Instruksi Pembayaran Link Aja Syariah', async () => {
            // Pastikan form login nomor HP dan PIN LinkAja muncul
            await expect(page.locator('#payment-login')).toContainText('Phone Number LinkAja PIN Forgot PIN?');
            await expect(page.locator('#detail-text')).toBeVisible();
        });
    });

    // Test case: memverifikasi metode pembayaran Virgo via input nomor HP
    test('Virgo', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih Virgo
        await test.step('Pilih metode pembayaran: Virgo', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('eWallet').click();
            await page.getByText('Virgo').click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        // Langkah 2: Validasi halaman Virgo meminta input nomor HP untuk melanjutkan pembayaran
        await test.step('Validasi Halaman Instruksi Pembayaran Virgo', async () => {
            await expect(page.getByTestId('one-time-payment-login-interface-v1')).toBeVisible();
            await expect(page.getByTestId('one-time-payment-login-interface-v1')).toContainText('Masukkan nomor HP kamu');
        });
    });

    // Test case: memverifikasi metode pembayaran LinkAja (reguler, bukan Syariah) via login aplikasi
    test('Link Aja', async ({ page }) => {

        // Langkah 1: Buka dropdown metode pembayaran dan pilih LinkAja
        await test.step('Pilih metode pembayaran: Link Aja', async () => {
            await page.getByText('Pilih Metode Pembayaran* Klik').click();
            await page.getByText('eWallet').click();
            // Gunakan exact: true untuk membedakan "LinkAja" dari "LinkAja Syariah"
            await page.getByText('LinkAja', { exact: true }).click();
            await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
        });

        // Langkah 2: Validasi halaman login LinkAja tampil dengan form autentikasi
        await test.step('Validasi Halaman Instruksi Pembayaran Link Aja', async () => {
            await expect(page.locator('#payment-login')).toContainText('Phone Number LinkAja PIN Forgot PIN?');
            await expect(page.locator('#detail-text')).toBeVisible();
        });
    });

});