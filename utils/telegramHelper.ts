const TELEGRAM_API_BASE = 'https://api.telegram.org';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

export interface TelegramResponse {
    ok: boolean;
    description?: string;
}

export async function sendTelegramMessage(text: string): Promise<TelegramResponse> {
    if (!botToken || !chatId) {
        throw new Error(
            '[TELEGRAM] TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum di-set pada environment.'
        );
    }

    const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        }),
    });

    const data = (await res.json()) as TelegramResponse;

    if (!res.ok || !data.ok) {
        throw new Error(
            `[TELEGRAM] Gagal mengirim pesan (HTTP ${res.status}): ${data.description || 'Unknown error'}`
        );
    }

    return data;
}

/**
 * @param filePath
 * @param caption
 */

export async function sendTelegramPhoto(filePath: string, caption?: string): Promise<TelegramResponse> {
    if (!botToken || !chatId) {
        throw new Error(
            '[TELEGRAM] TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum di-set pada environment.'
        );
    }

    const { readFile } = await import('node:fs/promises');
    const path = await import('node:path');

    const buffer = await readFile(filePath);
    const fileName = path.basename(filePath);

    const form = new FormData();
    form.append('chat_id', chatId);
    if (caption) {
        form.append('caption', caption);
        form.append('parse_mode', 'HTML');
    }
    form.append('photo', new Blob([buffer], { type: 'image/png' }), fileName);

    const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendPhoto`;

    const res = await fetch(url, { method: 'POST', body: form });

    const data = (await res.json()) as TelegramResponse;

    if (!res.ok || !data.ok) {
        throw new Error(
            `[TELEGRAM] Gagal mengirim foto (HTTP ${res.status}): ${data.description || 'Unknown error'}`
        );
    }

    return data;
}
