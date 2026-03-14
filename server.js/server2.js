const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const JOSAA_URL = 'https://josaa.admissions.nic.in/applicant/SeatAllotmentResult/CurrentORCR.aspx';

async function scrapeJoSAA() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    const allData = [];

    try {
        await page.goto(JOSAA_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1500));

        // ── Step 1: Round 6 ──
        console.log('Setting Round 6...');
        await page.waitForSelector('select', { timeout: 10000 });

        await page.evaluate(() => {
            const sel = document.querySelectorAll('select')[0];
            for (const opt of sel.options) {
                if (opt.text.trim() === '6') {
                    sel.value = opt.value;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }
            }
        });

        // Wait for page postback after round selection
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
            .catch(() => {}); // ignore if no navigation happens
        await new Promise(r => setTimeout(r, 1500));

        // ── Step 2: Institute Type → NIT ──
        console.log('Setting Institute Type to NIT...');
        await page.evaluate(() => {
            const selects = document.querySelectorAll('select');
            for (let i = 0; i < selects.length; i++) {
                for (const opt of selects[i].options) {
                    if (opt.text.trim() === 'National Institute of Technology') {
                        selects[i].value = opt.value;
                        selects[i].dispatchEvent(new Event('change', { bubbles: true }));
                        return;
                    }
                }
            }
        });

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
            .catch(() => {});
        await new Promise(r => setTimeout(r, 2000));

        // ── Step 3: Institute Name → ALL ──
        console.log('Setting Institute Name to ALL...');
        await page.waitForSelector('select', { timeout: 10000 });

        await page.evaluate(() => {
            const sel = document.querySelectorAll('select')[2];
            if (!sel) return;
            for (const opt of sel.options) {
                if (opt.text.trim() === 'ALL') {
                    sel.value = opt.value;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }
            }
        });

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
            .catch(() => {});
        await new Promise(r => setTimeout(r, 2000));

        // ── Step 4: Academic Program → ALL ──
        console.log('Setting Academic Program to ALL...');

        // Log select[3] options to confirm it loaded
        const programOptions = await page.evaluate(() => {
            const sel = document.querySelectorAll('select')[3];
            if (!sel) return [];
            return Array.from(sel.options).map(o => o.text.trim());
        });
        console.log('Program options:', programOptions.slice(0, 5));

        await page.evaluate(() => {
            const sel = document.querySelectorAll('select')[3];
            if (!sel) return;
            for (const opt of sel.options) {
                if (opt.text.trim() === 'ALL') {
                    sel.value = opt.value;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }
            }
        });

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
            .catch(() => {});
        await new Promise(r => setTimeout(r, 1500));

        // ── Step 5: Seat Type → ALL ──
        console.log('Setting Seat Type to ALL...');

        const seatOptions = await page.evaluate(() => {
            const sel = document.querySelectorAll('select')[4];
            if (!sel) return [];
            return Array.from(sel.options).map(o => o.text.trim());
        });
        console.log('Seat options:', seatOptions.slice(0, 5));

        await page.evaluate(() => {
            const sel = document.querySelectorAll('select')[4];
            if (!sel) return;
            for (const opt of sel.options) {
                if (opt.text.trim() === 'ALL') {
                    sel.value = opt.value;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }
            }
        });

        await new Promise(r => setTimeout(r, 800));

        // ── Step 6: Click Submit ──
        console.log('Clicking Submit...');
        await page.click('input[type="submit"], button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
            .catch(() => {});
        await page.waitForSelector('table tr td', { timeout: 25000 });
        await new Promise(r => setTimeout(r, 2000));

        // ── Step 7: Extract table ──
        console.log('Extracting data...');
        const rows = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('table tr'))
                .slice(1)
                .map(r => {
                    const c = r.querySelectorAll('td');
                    return {
                        institute:   c[0]?.innerText.trim(),
                        program:     c[1]?.innerText.trim(),
                        quota:       c[2]?.innerText.trim(),
                        seatType:    c[3]?.innerText.trim(),
                        gender:      c[4]?.innerText.trim(),
                        openingRank: c[5]?.innerText.trim(),
                        closingRank: c[6]?.innerText.trim(),
                    };
                })
                .filter(r => r.institute && r.closingRank);
        });

        console.log(`Extracted ${rows.length} rows`);
        rows.forEach(r => allData.push({ ...r, round: '6' }));

    } catch (err) {
        console.error('ERROR:', err.message);
    }

    await browser.close();

    // ── Format & save ──
    const formatted = allData.map(row => ({
        name:        row.institute,
        branch:      row.program,
        quota:       row.quota,
        seatType:    row.seatType,
        gender:      row.gender,
        openingRank: row.openingRank,
        closingRank: row.closingRank,
        maxRank:     parseInt(row.closingRank) || 999999,
        round:       row.round,
        state:       'Other',
        category:    row.seatType,
    }));

    fs.writeFileSync(
        path.join(__dirname, 'colleges.json'),
        JSON.stringify(formatted, null, 2)
    );

    console.log(`\nDone! Saved ${formatted.length} records to colleges.json`);
    return formatted;
}

app.get('/scrape', async (req, res) => {
    try {
        console.log('\n--- Scrape started ---');
        const data = await scrapeJoSAA();
        res.json({ success: true, count: data.length });
    } catch (err) {
        console.error('Scrape failed:', err);
        res.json({ success: false, error: err.message });
    }
});

app.get('/status', (req, res) => {
    const filePath = path.join(__dirname, 'colleges.json');
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath));
        res.json({ ready: true, count: data.length });
    } else {
        res.json({ ready: false });
    }
});

app.listen(3000, () => {
    console.log('\nServer at http://localhost:3000');
    console.log('Go to http://localhost:3000/scrape to start\n');
});