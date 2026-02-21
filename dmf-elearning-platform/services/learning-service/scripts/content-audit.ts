/**
 * Content Quality Audit — Post-Masterplan Step 4
 * Reviews 10% random sample of seeded content for quality
 *
 * Run: npx tsx scripts/content-audit.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditResult {
    type: string;
    total: number;
    sampled: number;
    issues: Array<{ id: string; issue: string; severity: 'warning' | 'error' }>;
    score: number;
}

async function auditContent(): Promise<void> {
    console.log('═══════════════════════════════════════');
    console.log('📋 CONTENT QUALITY AUDIT');
    console.log('═══════════════════════════════════════\n');

    const results: AuditResult[] = [];

    // ─── READING ───
    const readings = await prisma.readingContent.findMany();
    const readingSample = readings.sort(() => Math.random() - 0.5).slice(0, Math.ceil(readings.length * 0.1));
    const readingIssues: AuditResult['issues'] = [];

    for (const r of readingSample) {
        if (!r.title || r.title.length < 3) readingIssues.push({ id: r.id, issue: 'Title too short', severity: 'error' });
        if (!r.content || r.content.length < 20) readingIssues.push({ id: r.id, issue: 'Content too short', severity: 'error' });
        if (r.wordCount <= 0) readingIssues.push({ id: r.id, issue: 'Word count is 0', severity: 'warning' });
        if (!r.level) readingIssues.push({ id: r.id, issue: 'Missing level', severity: 'error' });
        // Check for German content (basic heuristic)
        const germanChars = /[äöüßÄÖÜ]/;
        if (!germanChars.test(r.content)) readingIssues.push({ id: r.id, issue: 'No German special characters found', severity: 'warning' });
    }

    results.push({
        type: '📖 Reading',
        total: readings.length,
        sampled: readingSample.length,
        issues: readingIssues,
        score: Math.round(((readingSample.length - readingIssues.filter(i => i.severity === 'error').length) / readingSample.length) * 100),
    });

    // ─── SPEAKING ───
    const speakings = await prisma.speakingPrompt.findMany();
    const speakingSample = speakings.sort(() => Math.random() - 0.5).slice(0, Math.ceil(speakings.length * 0.1));
    const speakingIssues: AuditResult['issues'] = [];

    for (const s of speakingSample) {
        if (!s.promptText || s.promptText.length < 10) speakingIssues.push({ id: s.id, issue: 'Prompt too short', severity: 'error' });
        if (!s.level) speakingIssues.push({ id: s.id, issue: 'Missing level', severity: 'error' });
        if (!s.sampleResponse || s.sampleResponse.length < 5) speakingIssues.push({ id: s.id, issue: 'Missing sample response', severity: 'warning' });
    }

    results.push({
        type: '🎤 Speaking',
        total: speakings.length,
        sampled: speakingSample.length,
        issues: speakingIssues,
        score: Math.round(((speakingSample.length - speakingIssues.filter(i => i.severity === 'error').length) / speakingSample.length) * 100),
    });

    // ─── WRITING ───
    const writings = await prisma.writingPrompt.findMany();
    const writingSample = writings.sort(() => Math.random() - 0.5).slice(0, Math.ceil(writings.length * 0.1));
    const writingIssues: AuditResult['issues'] = [];

    for (const w of writingSample) {
        if (!w.promptText || w.promptText.length < 10) writingIssues.push({ id: w.id, issue: 'Prompt too short', severity: 'error' });
        if (!w.level) writingIssues.push({ id: w.id, issue: 'Missing level', severity: 'error' });
        if (w.minWords <= 0) writingIssues.push({ id: w.id, issue: 'minWords is 0', severity: 'warning' });
    }

    results.push({
        type: '✍️ Writing',
        total: writings.length,
        sampled: writingSample.length,
        issues: writingIssues,
        score: Math.round(((writingSample.length - writingIssues.filter(i => i.severity === 'error').length) / writingSample.length) * 100),
    });

    // ─── LISTENING ───
    const listenings = await prisma.listeningContent.findMany();
    const listeningSample = listenings.sort(() => Math.random() - 0.5).slice(0, Math.ceil(listenings.length * 0.1));
    const listeningIssues: AuditResult['issues'] = [];

    for (const l of listeningSample) {
        if (!l.title || l.title.length < 3) listeningIssues.push({ id: l.id, issue: 'Title too short', severity: 'error' });
        if (!l.transcript || l.transcript.length < 10) listeningIssues.push({ id: l.id, issue: 'Transcript too short', severity: 'error' });
        if (!l.level) listeningIssues.push({ id: l.id, issue: 'Missing level', severity: 'error' });
    }

    results.push({
        type: '🎧 Listening',
        total: listenings.length,
        sampled: listeningSample.length,
        issues: listeningIssues,
        score: Math.round(((listeningSample.length - listeningIssues.filter(i => i.severity === 'error').length) / listeningSample.length) * 100),
    });

    // ─── REPORT ───
    console.log('──── Results ────\n');
    let totalScore = 0;

    for (const r of results) {
        console.log(`${r.type}: ${r.total} total, ${r.sampled} sampled → Score: ${r.score}%`);
        if (r.issues.length > 0) {
            for (const issue of r.issues.slice(0, 5)) {
                console.log(`  ${issue.severity === 'error' ? '❌' : '⚠️'} [${issue.id.slice(0, 8)}] ${issue.issue}`);
            }
            if (r.issues.length > 5) console.log(`  ... and ${r.issues.length - 5} more`);
        } else {
            console.log('  ✅ No issues found');
        }
        console.log();
        totalScore += r.score;
    }

    const avgScore = Math.round(totalScore / results.length);
    console.log('═══════════════════════════════════════');
    console.log(`📊 OVERALL CONTENT QUALITY: ${avgScore}%`);
    console.log(`   Total items: ${results.reduce((a, r) => a + r.total, 0)}`);
    console.log(`   Total sampled: ${results.reduce((a, r) => a + r.sampled, 0)}`);
    console.log(`   Total issues: ${results.reduce((a, r) => a + r.issues.length, 0)}`);
    console.log('═══════════════════════════════════════');

    await prisma.$disconnect();
}

auditContent().catch(console.error);
