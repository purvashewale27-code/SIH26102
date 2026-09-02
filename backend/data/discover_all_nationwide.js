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
            return null;
        }
        return await response.json();
    } catch (err) {
        return null;
    }
}

async function discoverAll() {
    console.log('Fetching official States list from MoSPI...');
    const states = await postRequest('getStateData', {});
    console.log(`Found ${states.length} States / UTs.`);
    fs.writeFileSync(path.join(DATA_DIR, 'states.json'), JSON.stringify(states, null, 2));

    const allConstituencies = [];
    const allLokSabhaMps = [];
    const allRajyaSabhaMps = [];

    for (const s of states) {
        const stateId = s.STATE_ID;
        const stateName = s.STATE_NAME;
        process.stdout.write(`Fetching ${stateName} (ID: ${stateId})... `);

        // Constituencies
        const consts = await postRequest('getConstituencyData', { id: String(stateId) });
        if (consts && consts.length) {
            for (const c of consts) {
                allConstituencies.push({
                    state_id: stateId,
                    state_name: stateName,
                    constituency_id: c.ID,
                    constituency_name: c.CAPTION
                });
            }
        }

        // Lok Sabha MPs (house 2)
        const lsMps = await postRequest('getMpNamesData', { state_combo: `${stateId},2,0` });
        if (lsMps && lsMps.length) {
            for (const m of lsMps) {
                allLokSabhaMps.push({
                    state_id: stateId,
                    state_name: stateName,
                    mp_id: m.ID,
                    mp_name: m.CAPTION,
                    house: 'Lok Sabha'
                });
            }
        }

        // Rajya Sabha MPs (house 1)
        const rsMps = await postRequest('getMpNamesData', { state_combo: `${stateId},1,0` });
        if (rsMps && rsMps.length) {
            for (const m of rsMps) {
                allRajyaSabhaMps.push({
                    state_id: stateId,
                    state_name: stateName,
                    mp_id: m.ID,
                    mp_name: m.CAPTION,
                    house: 'Rajya Sabha'
                });
            }
        }

        console.log(`Const: ${consts ? consts.length : 0} | LS MPs: ${lsMps ? lsMps.length : 0} | RS MPs: ${rsMps ? rsMps.length : 0}`);
        await sleep(150);
    }

    console.log('\n====================================================');
    console.log(`Total Constituencies Discovered: ${allConstituencies.length}`);
    console.log(`Total Lok Sabha MPs Discovered: ${allLokSabhaMps.length}`);
    console.log(`Total Rajya Sabha MPs Discovered: ${allRajyaSabhaMps.length}`);
    console.log(`Total Parliamentarians: ${allLokSabhaMps.length + allRajyaSabhaMps.length}`);
    console.log('====================================================\n');

    fs.writeFileSync(path.join(DATA_DIR, 'constituencies.json'), JSON.stringify(allConstituencies, null, 2));
    const allMpsCombined = [...allLokSabhaMps, ...allRajyaSabhaMps];
    fs.writeFileSync(path.join(DATA_DIR, 'mps.json'), JSON.stringify(allMpsCombined, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'mps_loksabha.json'), JSON.stringify(allLokSabhaMps, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'mps_rajyasabha.json'), JSON.stringify(allRajyaSabhaMps, null, 2));

    console.log('Saved nationwide metadata into backend/data/mospi/ !');
}

discoverAll();
