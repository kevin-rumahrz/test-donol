import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { sendTelegramMessage, sendTelegramPhoto } from '../utils/telegramHelper';


function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms} ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)} s`;
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remSeconds}s`;
}

const LOG_URL = 'https://kevin-rumahrz.github.io/test-donol/';
const DASHBOARD_URL = 'https://datastudio.google.com/u/0/reporting/fa60b1ee-f113-44b3-9440-7e5c096ae5a9/page/p_h7gqwkox4d';

function formatJakartaTime(date: Date): string {
    const parts = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return `${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')} WIB`;
}

interface FailedTest {
    suiteTitle: string;
    testTitle: string;
    errorMessage: string;
    screenshots: string[];
}

class TelegramReporter implements Reporter {
    private startTime: number;
    private passed = 0;
    private failed = 0;
    private failedTests: FailedTest[] = [];

    constructor() {
        this.startTime = Date.now();
    }

    onTestEnd(test: TestCase, result: TestResult) {
        if (result.status === 'passed') {
            this.passed++;
        } else if (result.status === 'failed' || result.status === 'timedOut') {
            if (result.retry === test.retries) {
                this.failed++;
                const screenshots = result.attachments
                    .filter((a) => a.name === 'screenshot' && a.path)
                    .map((a) => a.path as string);
                
                this.failedTests.push({
                    suiteTitle: test.parent ? test.parent.title : 'Unknown Suite',
                    testTitle: test.title,
                    errorMessage: result.error?.message || 'Terjadi kesalahan tanpa pesan error.',
                    screenshots,
                });
            }
        }
    }

    async onEnd(result: FullResult) {
        const durationMs = Date.now() - this.startTime;
        const total = this.passed + this.failed;
        
        const isSuccess = this.failed === 0;
        const lines: string[] = [];

        if (isSuccess) {
            lines.push('🟢 <b>[SUCCESS] Automated Test Report</b>');
            lines.push('');
            lines.push('Berjalan stabil. Tidak ada anomali terdeteksi.');
        } else {
            lines.push('🔴 <b>[FAILED] Automated Test Report</b>');
            lines.push('');
            lines.push('<b>TINDAKAN DIBUTUHKAN.</b> Terdapat kegagalan pada pengujian Method Payment.');
        }

        lines.push('');
        lines.push('<b>Summary:</b>');
        lines.push(`• Waktu: ${formatJakartaTime(new Date())}`);
        lines.push(`• Total Test: ${total}`);
        lines.push(`• Passed: ${this.passed}`);
        lines.push(`• Failed: ${this.failed}`);
        lines.push(`• Durations: ${formatDuration(durationMs)}`);

        if (this.failedTests.length > 0) {
            const top = this.failedTests.slice(0, 3);
            lines.push('');
            lines.push(`<b>Detail Failed Test</b>`);
            top.forEach((t, i) => {
                lines.push(
                    `${i + 1}. [${escapeHtml(t.suiteTitle)}] - ${escapeHtml(t.testTitle)}: ${escapeHtml(t.errorMessage)}`
                );
            });

            const hasScreenshot = this.failedTests.some((t) => t.screenshots.length > 0);
            if (hasScreenshot) {
                lines.push('');
                lines.push('⚠️ Screenshot terlampir pada pesan ini.');
            }
        }

        lines.push('');
        lines.push(
            isSuccess
                ? `🔍 <a href="${LOG_URL}">Lihat Log Lengkap</a>`
                : `🔍 <a href="${DASHBOARD_URL}">Lihat Dashboard Report &amp; Log</a>`
        );

        try {
            await sendTelegramMessage(lines.join('\n'));
            console.log('[TELEGRAM-REPORTER] Laporan teks utama terkirim.');
        } catch (err) {
            console.error('[TELEGRAM-REPORTER] Gagal mengirim laporan ke Telegram:', err);
        }

        for (let i = 0; i < this.failedTests.length; i++) {
            const t = this.failedTests[i];
            const caption = `<b>Screenshot:</b>\nSuite: ${escapeHtml(t.suiteTitle)}\nTest: ${escapeHtml(t.testTitle)}`;
            for (const screenshot of t.screenshots) {
                try {
                    await sendTelegramPhoto(screenshot, caption);
                } catch (err) {
                    console.error(`[TELEGRAM-REPORTER] Gagal mengirim screenshot '${t.testTitle}':`, err);
                }
            }
        }
    }
}

export default TelegramReporter;