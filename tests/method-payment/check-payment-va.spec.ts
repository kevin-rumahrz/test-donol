import { test, expect } from '@playwright/test';

// Daftar semua bank Virtual Account yang diuji beserta flag exact match-nya.
// isExact: true digunakan pada bank yang namanya merupakan substring dari nama bank lain
// (contoh: "VA Permata" vs "VA Permata Syariah") agar selector tidak ambigu.
const vaMethods = [
    { name: 'VA Muamalat', isExact: false },
    { name: 'VA BSI', isExact: false },
    { name: 'VA Permata Syariah', isExact: false },
    { name: 'VA Mandiri', isExact: false },
    { name: 'VA BCA', isExact: false },
    { name: 'VA BNI', isExact: false },
    { name: 'VA BRI', isExact: false },
    { name: 'VA BJB', isExact: false },
    { name: 'VA Permata', isExact: true },  // exact: true agar tidak salah pilih "VA Permata Syariah"
    { name: 'VA Maybank', isExact: false },
    { name: 'VA Sinarmas', isExact: false },
    { name: 'VA Danamon', isExact: false },
    { name: 'VA CIMB', isExact: false },
];

// Grup test untuk memverifikasi alur pembayaran menggunakan seluruh metode Virtual Account
test.describe('Check Metode Pembayaran - VA', () => {
    // Timeout maksimal 40 detik per test case, mengakomodasi loading halaman yang lambat
    test.setTimeout(40000);

    // Setup yang dijalankan sebelum setiap test case dalam grup ini
    test.beforeEach(async ({ page }) => {

        // Langkah 1: Navigasi ke halaman form donasi Zakat Penghasilan
        await test.step('Navigasi ke halaman Zakat Penghasilan', async () => {
            // await page.goto('https://www.rumahzakat.org/donasi/zakat-penghasilan');
            await page.goto('https://www.rumahzakat.org/donasi');

            // Tutup popup yang muncul saat halaman pertama kali dibuka
            await page.getByRole('button').filter({ hasText: /^$/ }).click();
            
            await page.getByRole('link', { name: 'Zakat', exact: true }).click();
            await page.getByRole('link', { name: 'Zakat Penghasilan' }).click();
            await page.getByRole('button', { name: 'Tunaikan Sekarang' }).click();
        });

        // Langkah 2: Mengisi data diri donatur dengan data dummy untuk keperluan testing
        await test.step('Isi data diri donatur', async () => {
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

    // Loop untuk membuat satu test case per bank secara otomatis dari array vaMethods.
    // Pendekatan ini menghindari duplikasi kode — cukup tambahkan entri baru di array vaMethods
    // untuk menambah bank VA baru tanpa perlu menulis blok test() baru.
    for (const bank of vaMethods) {
        test(`${bank.name}`, async ({ page }) => {

            // Langkah 1: Buka dropdown metode pembayaran dan pilih bank VA sesuai iterasi
            await test.step(`Pilih metode pembayaran: ${bank.name}`, async () => {
                await page.getByText('Pilih Metode Pembayaran* Klik').click();
                await page.getByText('Bank Transfer Otomatis').click();

                // Gunakan exact match untuk bank yang namanya adalah substring dari bank lain
                if (bank.isExact) {
                    await page.getByText(bank.name, { exact: true }).click();
                } else {
                    await page.getByText(bank.name).click();
                }
            });

            // Langkah 2: Lanjutkan proses checkout dan konfirmasi doa
            await test.step('Proses checkout dan konfirmasi doa', async () => {
                await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
                // Popup doa muncul sebelum sistem memproses transaksi ke payment gateway
                await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
            });

            // Langkah 3: Validasi nomor Virtual Account berhasil digenerate dan ditampilkan
            await test.step('Validasi invoice dan Nomor Virtual Account berhasil ditampilkan', async () => {
                // Keberhasilan pembayaran VA ditandai dengan munculnya nomor VA yang harus ditransfer
                await expect(page.getByText('Nomor Virtual Account', { exact: true })).toBeVisible();
            });

        });
    }
});
