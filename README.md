# test-donol

Automated end-to-end testing project untuk website [Donol Rumah Zakat](https://www.rumahzakat.org/donasi), dibangun menggunakan [Playwright](https://playwright.dev/). Project ini mencakup pengujian metode pembayaran pada halaman donasi.

---

## Requirements

- [Node.js](https://nodejs.org/) versi LTS atau lebih baru
- Browser Chromium (akan diinstall otomatis oleh Playwright)

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/kevin-rumahrz/test-donol.git
cd test-donol
```

### 2. Install Playwright & Browsers

```bash
npx playwright install --with-deps
```

---

## Menjalankan Test

### Jalankan semua test

```bash
npx playwright test
```

### Jalankan test pada file tertentu

```bash
npx playwright test tests/method-payment/check-payment-ewallet.spec.ts
```

### Jalankan test dengan UI mode

```bash
npx playwright test --ui
```

### Jalankan test dengan mode headed (browser terlihat)

```bash
npx playwright test --headed
```

### Lihat laporan hasil test

```bash
npx playwright show-report
```

---

## CI/CD

Project ini menggunakan **GitHub Actions** untuk menjalankan test secara otomatis. Workflow dapat di-trigger secara manual melalui tab **Actions** di GitHub (`workflow_dispatch`).

Hasil test akan di-deploy secara otomatis ke **GitHub Pages** sebagai laporan HTML interaktif.

---

## Struktur Folder

```
test-donol/
+-- .github/
|   +-- workflows/
|       +-- main.yml               # GitHub Actions workflow untuk CI/CD
|
+-- tests/
|   +-- method-payment/            # Kumpulan test untuk metode pembayaran
|       +-- check-payment-bankdigital.spec.ts   # Test metode Bank Digital (Jenius)
|       +-- check-payment-card.spec.ts          # Test metode Kartu Kredit/Debit
|       +-- check-payment-ewallet.spec.ts       # Test metode E-Wallet
|       +-- check-payment-qris.spec.ts          # Test metode QRIS
|       +-- check-payment-va.spec.ts            # Test metode Virtual Account
|
+-- .gitignore
+-- package.json                   # Konfigurasi project dan dependencies
+-- package-lock.json
+-- playwright.config.ts           # Konfigurasi Playwright (browser, timeout, reporter)
+-- README.md
```

---

## Konfigurasi Playwright

Konfigurasi utama ada di `playwright.config.ts`:

| Opsi | Value | Keterangan |
|---|---|---|
| `testDir` | `./tests` | Direktori tempat file test berada |
| `fullyParallel` | `true` | Test dijalankan paralel |
| `retries` | `2` (CI) / `0` (lokal) | Jumlah retry jika test gagal |
| `workers` | `2` (CI) / auto (lokal) | Jumlah worker paralel |
| `reporter` | `html` | Laporan dalam format HTML |
| `screenshot` | `only-on-failure` | Screenshot hanya saat test gagal |
| Browser | Chromium | Browser yang digunakan untuk testing |

---

## Meneruskan Project & Menambahkan Test

### Konvensi Penamaan File

File test menggunakan pola:

```
tests/<nama-page/fitur>/<nama-test>.spec.ts
```

Contoh: `tests/method-payment/check-payment-ewallet.spec.ts`

### Struktur Dasar Sebuah Test

Setiap file `.spec.ts` menggunakan struktur berikut:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nama Grup Test', () => {

    test.setTimeout(40000); // timeout per test dalam ms

    // Dijalankan sebelum setiap test
    test.beforeEach(async ({ page }) => {
        await test.step('Navigasi ke halaman target', async () => {
            await page.goto('https://url-target.com');
            // langkah setup lainnya...
        });
    });

    // Satu test case
    test('Nama Test Case', async ({ page }) => {
        await test.step('Deskripsi langkah', async () => {
            // aksi (klik, isi form, dll)
        });

        await test.step('Validasi hasil', async () => {
            await expect(page.getByText('Teks yang diharapkan')).toBeVisible();
        });
    });

});
```

### Menambahkan Test Baru ke Grup yang Sudah Ada

Buka file `.spec.ts` yang sesuai dan tambahkan blok `test()` baru di dalam `test.describe()`:

```typescript
test('Nama Metode Baru', async ({ page }) => {
    await test.step('Pilih metode pembayaran', async () => {
        await page.getByText('Pilih Metode Pembayaran* Klik').click();
        await page.getByText('Kategori').click();
        await page.getByText('Nama Metode').click();
        await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
    });

    await test.step('Validasi halaman berhasil dimuat', async () => {
        await expect(page.getByText('Teks yang diharapkan')).toBeVisible();
    });
});
```

### Menambahkan Grup Test Baru (File Baru)

1. Buat file baru di folder yang sesuai atau buat subfolder baru:

```
tests/
+-- method-payment/      # subfolder yang sudah ada
+-- <nama-fitur-baru>/   # subfolder baru jika diperlukan
    +-- <nama-test>.spec.ts
```

2. Salin struktur dasar di atas ke file baru.

3. Sesuaikan `test.describe`, nama test, URL target, dan assertion sesuai kebutuhan.

4. Jalankan file baru tersebut untuk memverifikasi:

```bash
npx playwright test tests/<nama-fitur-baru>/<nama-test>.spec.ts --headed
```

### Tips Menulis Test

| Situasi | Selector yang digunakan |
|---|---|
| Tombol dengan label teks | `page.getByRole('button', { name: 'Label' })` |
| Input form | `page.getByRole('textbox', { name: 'Placeholder' })` |
| Elemen dengan teks tertentu | `page.getByText('Teks')` |
| Elemen dengan test-id | `page.getByTestId('id-elemen')` |
| Elemen di dalam iframe | `page.frameLocator('iframe[name="..."]').locator(...)` |

Gunakan `--headed` saat menulis test baru agar bisa melihat interaksi browser secara langsung.