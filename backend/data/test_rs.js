async function test() {
  const r = await fetch("https://mplads.mospi.gov.in/rest/PreLoginDashboardData/getMpNamesData", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({state_combo: "21,1,0"})
  });
  const data = await r.json();
  console.log("Maharashtra Rajya Sabha MPs count:", data ? data.length : 0);
  if (data && data.length) console.log("Sample RS MP:", JSON.stringify(data[0]));
}
test();
