const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'processed', 'mplads_unified_projects.json');
const csvPath = path.join(__dirname, 'processed', 'mplads_unified_projects.csv');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const headers = [
    'project_id',
    'project_title',
    'state',
    'district',
    'constituency',
    'mp_name',
    'tenure',
    'work_category',
    'implementing_agency',
    'vendor_name',
    'estimated_cost_inr',
    'cost_provenance',
    'actual_expenditure_inr',
    'expenditure_provenance',
    'payment_amount_inr',
    'physical_progress_pct',
    'progress_provenance',
    'sanction_date',
    'expected_completion_date',
    'completion_status',
    'status_provenance',
    'cost_overrun_pct',
    'delay_days',
    'progress_gap_pct',
    'is_march_rush'
];

function escapeCsv(val) {
    if (val === null || val === undefined) return '';
    let str = String(val).replace(/"/g, '""');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str}"`;
    }
    return str;
}

const rows = [headers.join(',')];

for (const p of data) {
    const f = p.fields;
    const row = [
        escapeCsv(p.project_id),
        escapeCsv(p.project_title),
        escapeCsv(p.state),
        escapeCsv(p.district),
        escapeCsv(p.constituency),
        escapeCsv(p.mp_name),
        escapeCsv(p.tenure),
        escapeCsv(p.work_category),
        escapeCsv(p.implementing_agency),
        escapeCsv(p.vendor_name),
        f.estimated_cost.value,
        f.estimated_cost.provenance,
        f.actual_expenditure.value,
        f.actual_expenditure.provenance,
        f.payment_amount.value,
        f.physical_progress_pct.value,
        f.physical_progress_pct.provenance,
        escapeCsv(f.sanction_date.value),
        escapeCsv(f.expected_completion_date.value),
        escapeCsv(f.completion_status.value),
        f.completion_status.provenance,
        f.cost_overrun_pct.value,
        f.delay_days.value,
        f.progress_gap_pct.value,
        f.is_march_rush.value
    ];
    rows.push(row.join(','));
}

fs.writeFileSync(csvPath, rows.join('\n'), 'utf8');
console.log(`Generated CSV with ${rows.length - 1} records at: ${csvPath}`);
