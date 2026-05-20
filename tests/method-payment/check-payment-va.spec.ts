import { test, expect } from '@playwright/test';

const vaMethods = [
    { name: 'VA Muamalat', isExact: false },
    { name: 'VA BSI', isExact: false },
    { name: 'VA Permata Syariah', isExact: false },
    { name: 'VA Mandiri', isExact: false },
    { name: 'VA BCA', isExact: false },
    { name: 'VA BNI', isExact: false },
    { name: 'VA BRI', isExact: false },
    { name: 'VA BJB', isExact: false },
    { name: 'VA Permata', isExact: true },
    { name: 'VA Maybank', isExact: false },
    { name: 'VA Sinarmas', isExact: false },
    { name: 'VA Danamon', isExact: false },
    { name: 'VA CIMB', isExact: false },
];

test.describe('Check Metode Pembayaran - VA', () => {
    test.setTimeout(40000);

    test.beforeEach(async ({ page }) => {
        await test.step('Navigasi ke halaman Zakat Penghasilan', async () => {
            // await page.goto('https://www.rumahzakat.org/donasi/zakat-penghasilan');
            await page.goto('https://www.rumahzakat.org/donasi');
            await page.getByRole('button').filter({ hasText: /^$/ }).click();
            await page.getByRole('link', { name: 'Zakat', exact: true }).click();
            await page.getByRole('link', { name: 'Zakat Penghasilan' }).click();
            await page.getByRole('button', { name: 'Tunaikan Sekarang' }).click();
        });

        await test.step('Isi data diri donatur', async () => {
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

    for (const bank of vaMethods) {
        test(`${bank.name}`, async ({ page }) => {
            
            await test.step(`Pilih metode pembayaran: ${bank.name}`, async () => {
                await page.getByText('Pilih Metode Pembayaran* Klik').click();
                await page.getByText('Bank Transfer Otomatis').click();
                
                if (bank.isExact) {
                    await page.getByText(bank.name, { exact: true }).click();
                } else {
                    await page.getByText(bank.name).click();
                }
            });

            await test.step('Proses checkout dan konfirmasi doa', async () => {
                await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
                await page.getByRole('button', { name: 'Aamiin Ya Rabbal’alamin' }).click();
            });

            await test.step('Validasi invoice dan Nomor Virtual Account berhasil ditampilkan', async () => {
                await expect(page.getByText('Nomor Virtual Account', { exact: true })).toBeVisible();
            });
            
        });
    }
});