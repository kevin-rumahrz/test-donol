import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { pool } from '../utils/db'; 

class DbReporter implements Reporter {
    private runId: string;

    constructor() {
        this.runId = `run_${Date.now()}`;
    }

    async onTestEnd(test: TestCase, result: TestResult) {
        const suiteTitle = test.parent ? test.parent.title : 'Unknown Suite';
        
        const testTitle = test.title;
        
        const status = result.status;
        const durationMs = result.duration;
        const errorMessage = result.error?.message || null;

        try {
            await pool.execute(
                `INSERT INTO playwright_test_results 
                (run_id, suite_title, test_title, status, duration_ms, error_message, executed_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [this.runId, suiteTitle, testTitle, status, durationMs, errorMessage]
            );
        } catch (err) {
            console.error(`[DB-REPORTER] Gagal menyimpan metrik untuk test '${testTitle}':`, err);
        }
    }

    async onEnd(result: FullResult) {
        await pool.end();
    }
}

export default DbReporter;