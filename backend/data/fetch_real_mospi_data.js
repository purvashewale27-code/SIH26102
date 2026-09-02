/**
 * fetch_real_mospi_data.js
 * Ingestion script to pull 100% genuine real government data directly from
 * Ministry of Statistics & Programme Implementation (MoSPI) eSAKSHI API.
 * Sourced live from: https://mplads.mospi.gov.in/rest/PreLoginDashboardData/
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mplads.mospi.gov.in/rest/PreLoginDashboardData';
const DATA_DIR = path.join(__dirname, 'mospi');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function postRequest(endpoint, payload) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            console.warn(`[WARN] ${endpoint} returned HTTP ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (err) {
        console.error(`[ERROR] Failed to fetch ${endpoint}:`, err.message);
        return null;
    }
}

async function run() {
    console.log('====================================================');
    console.log(' MoSPI MPLADS Real-Data Ingestion Pipeline (SIH 26102)');
    console.log('====================================================\n');

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 1. Fetch States
    console.log('Fetching official States list from MoSPI...');
    const states = await postRequest('getStateData', {});
    if (!states || !states.length) {
        throw new Error('Failed to retrieve States from MoSPI API');
    }
    console.log(`Found ${states.length} States / UTs.`);
    fs.writeFileSync(path.join(DATA_DIR, 'states.json'), JSON.stringify(states, null, 2));

    // Target a representative sample of major states for deep work collection
    // Maharashtra (21), Uttar Pradesh (33), Karnataka (18), Gujarat (27), Delhi (11), Rajasthan (28), Tamil Nadu (30), Bihar (6)
    const targetStateIds = [21, 33, 18, 27, 11, 28, 30, 6];
    const targetStates = states.filter(s => targetStateIds.includes(s.STATE_ID));

    const allConstituencies = [];
    const allMps = [];
    const allWorkRecords = [];
    const allExpenditures = [];
    const allAllocations = [];

    for (const state of targetStates) {
        console.log(`\nProcessing State: ${state.STATE_NAME} (ID: ${state.STATE_ID})`);

        // Fetch Constituencies
        const constituencies = await postRequest('getConstituencyData', { id: String(state.STATE_ID) });
        if (constituencies && constituencies.length) {
            console.log(`   Fetched ${constituencies.length} Constituencies.`);
            for (const c of constituencies) {
                allConstituencies.push({
                    state_id: state.STATE_ID,
                    state_name: state.STATE_NAME,
                    constituency_id: c.ID,
                    constituency_name: c.CAPTION
                });
            }
        }
        await sleep(300);

        // Fetch MPs for Lok Sabha (house 2)
        const mps = await postRequest('getMpNamesData', { state_combo: `${state.STATE_ID},2,0` });
        if (mps && mps.length) {
            console.log(`   Fetched ${mps.length} Hon'ble MPs.`);
            for (const mp of mps) {
                allMps.push({
                    state_id: state.STATE_ID,
                    state_name: state.STATE_NAME,
                    mp_id: mp.ID,
                    mp_name: mp.CAPTION,
                    house: 'Lok Sabha'
                });
            }

            // Fetch works for the first 4 MPs per state to maintain rate-limits and fast collection
            const sampleMps = mps.slice(0, 4);
            for (const mp of sampleMps) {
                console.log(`      Querying Works for MP: ${mp.CAPTION} (ID: ${mp.ID})...`);
                const comboStr = `${state.STATE_ID},0,${mp.ID},2`;

                // Fetch Works Recommended
                const recData = await postRequest('getTilesReportData', {
                    combo: comboStr,
                    key: 'Works Recommended'
                });
                if (recData && recData['Total Works Recommended']) {
                    try {
                        const parsed = JSON.parse(recData['Total Works Recommended']);
                        console.log(`         -> Recommended Works: ${parsed.length}`);
                        allWorkRecords.push(...parsed);
                    } catch (e) {}
                }
                await sleep(200);

                // Fetch Works Completed
                const compData = await postRequest('getTilesReportData', {
                    combo: comboStr,
                    key: 'Works Completed'
                });
                if (compData && compData['Total Works Completed']) {
                    try {
                        const parsed = JSON.parse(compData['Total Works Completed']);
                        console.log(`         -> Completed Works: ${parsed.length}`);
                        allWorkRecords.push(...parsed);
                    } catch (e) {}
                }
                await sleep(200);

                // Fetch Detailed Expenditure & Vendors
                const expData = await postRequest('getTilesReportData', {
                    combo: comboStr,
                    key: 'Expenditure on Completed and On-going Works as on Date'
                });
                if (expData && expData['Total Expenditure']) {
                    try {
                        const parsed = JSON.parse(expData['Total Expenditure']);
                        console.log(`         -> Expenditure Records: ${parsed.length}`);
                        allExpenditures.push(...parsed);
                    } catch (e) {}
                }
                await sleep(200);

                // Fetch Allocation Limits
                const allocData = await postRequest('getTilesReportData', {
                    combo: comboStr,
                    key: "Allocated Limit for Hon'ble MPs"
                });
                if (allocData && allocData['Allocated Limit']) {
                    try {
                        const parsed = JSON.parse(allocData['Allocated Limit']);
                        allAllocations.push(...parsed);
                    } catch (e) {}
                }
                await sleep(200);
            }
        }
    }

    // Save all collected data
    fs.writeFileSync(path.join(DATA_DIR, 'constituencies.json'), JSON.stringify(allConstituencies, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'mps.json'), JSON.stringify(allMps, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'real_works_recommended_completed.json'), JSON.stringify(allWorkRecords, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'real_expenditures_and_vendors.json'), JSON.stringify(allExpenditures, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'real_mp_allocations.json'), JSON.stringify(allAllocations, null, 2));

    console.log('\n====================================================');
    console.log(' Data Ingestion Complete Summary:');
    console.log(` - States / UTs saved: ${states.length}`);
    console.log(` - Constituencies saved: ${allConstituencies.length}`);
    console.log(` - MPs registered: ${allMps.length}`);
    console.log(` - Real Works Sanctioned/Completed: ${allWorkRecords.length}`);
    console.log(` - Real Expenditure & Vendor Records: ${allExpenditures.length}`);
    console.log(` - Real MP Allocation Limits: ${allAllocations.length}`);
    console.log(` Saved into: ${DATA_DIR}`);
    console.log('====================================================\n');
}

run().catch(console.error);
