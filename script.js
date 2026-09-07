// Hardcoded Static Campaigns Configuration
const campaigns = [
    {
        name: "MED CPA (BLIND TRANSFER) (JCK)",
        type: "Static",
        did: "5618726752",
        states: "Bad States: NY, WA, CA, DC, HI, AK",
        timing: "7:00 PM - 03:30 AM",
        breakTime: "10:00 PM - 11:00 PM",
        ageLimit: "50-85",
        dqNotes: "No VA, Tricare, Kizer, Retirement Plan",
        formLink: "",
        target: 40,
        status: "Active"
    },
    {
        name: "MED CPL BLIND TRANSFERS (ADO)",
        type: "Static",
        did: "8664349627",
        states: "Good States: AZ, FL, GA, IL, KS, KY, LA, MO, NC, OH, PA, SC, TN, TX, VA",
        timing: "07:00 PM - 03:00 AM",
        breakTime: "NO BREAK",
        ageLimit: "65-85",
        dqNotes: "Standard Medicare qualification",
        formLink: "https://silverbpo.callhub.ai/form.php",
        target: 50,
        status: "Active"
    },
    {
        name: "FE 180 (BLIND TRANSFER) (ADO)",
        type: "Static",
        did: "PING",
        states: "AL, AZ, CO, IL, IN, KS, KY, MI, MO, OH, PA, SC, TN, TX",
        timing: "06:30 PM - 03:00 AM",
        breakTime: "NO BREAK",
        ageLimit: "50-80",
        dqNotes: "Final Expense qualification guidelines",
        formLink: "https://silverbpo.callhub.ai/form3.php",
        target: 45,
        status: "Active"
    },
    {
        name: "FE 140 (WARM TRANSFER) (ELIJ)",
        type: "Static",
        did: "PING",
        states: "ALL STATES EXCEPT NYC",
        timing: "06:00 PM - 06:00 AM",
        breakTime: "NO BREAK",
        ageLimit: "50-80",
        dqNotes: "ORIGINAL NUMBER ONLY",
        formLink: "https://ringba-bid-asya.vercel.app/",
        target: 60,
        status: "Active"
    },
    {
        name: "90 FE SYED (BLIND TRANSFER) (KD)",
        type: "Static",
        did: "8447043251",
        states: "ALL STATES EXCEPT NYC",
        timing: "07:00 PM - 04:00 AM",
        breakTime: "NO BREAK",
        ageLimit: "50-80",
        dqNotes: "Original Number Only & Interested Customers",
        formLink: "https://syedfe120.vercel.app/",
        target: 35,
        status: "Active"
    },
    {
        name: "240 FE (BLIND TRANSFER) (ATTA)",
        type: "Static",
        did: "8556692411",
        states: "Bad States: AR, CO, IL, KY, MA, MI, MO, MT, NY, NV, TN, WV, WY",
        timing: "07:00 PM - 03:00 AM",
        breakTime: "NO BREAK",
        ageLimit: "50-79",
        dqNotes: "ORIGINAL NUMBER ONLY",
        formLink: "",
        target: 50,
        status: "Active"
    },
    {
        name: "220 FE (BLIND TRANSFER) (ATTA)",
        type: "Static",
        did: "8554713892",
        states: "AL, AR, AZ, CA, CO, FL, GA, IA, IL, IN, KS, KY, LA, MD, MI, MO, MS, NC, NJ, NM, NV, OH, OR, PA, SC, TN, TX, VA",
        timing: "06:00 PM - 04:00 AM",
        breakTime: "NO BREAK",
        ageLimit: "50-79",
        dqNotes: "ORIGINAL NUMBER ONLY",
        formLink: "https://www.leadlync.site/form/",
        target: 55,
        status: "Active"
    },
    {
        name: "SYED FE 180 (BLIND TRANSFER) (WEB)",
        type: "Static",
        did: "8445061716",
        states: "ALL STATES EXCEPT NYC",
        timing: "07:00 PM - 04:00 AM",
        breakTime: "12:00 AM - 01:00 AM",
        ageLimit: "50-79",
        dqNotes: "Original Number Only & Interested Customers",
        formLink: "",
        target: 40,
        status: "Active"
    }
];

// Default Apps Script Web App URL (User can update in Settings)
let APPS_SCRIPT_URL = localStorage.getItem('alixo_gas_url') || "https://script.google.com/macros/s/AKfycbygIpNdl3b-_AiF6ejYy9QLx7lVNZo67s_DeenFLrZ9fW2FOnIh_D17puG1JPfxdyBtgA/exec";

let allLeads = [];
let currentDateFilter = 'today';
let currentAgentFilter = '';
let customStartDate = null;
let customEndDate = null;
let duplicateCheckTimer = null;
let refreshIntervalTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('setting-url').value = APPS_SCRIPT_URL;
    populateCampaignDropdowns();
    renderActiveCampaignsGrid();
    fetchAppData();
    
    const interval = parseInt(localStorage.getItem('alixo_interval') || '20000');
    document.getElementById('setting-interval').value = interval;
    setupAutoRefresh(interval);
});

function setupAutoRefresh(ms) {
    if(refreshIntervalTimer) clearInterval(refreshIntervalTimer);
    refreshIntervalTimer = setInterval(fetchAppData, ms);
}

// Navigation Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('bg-blue-600', 'text-white');
        el.classList.add('text-slate-400');
    });
    const activeLink = document.querySelector(`[data-target="${tabId}"]`);
    if(activeLink) {
        activeLink.classList.remove('text-slate-400');
        activeLink.classList.add('bg-blue-600', 'text-white');
    }

    const titles = {
        'dashboard': 'Dashboard Overview',
        'submit': 'New Lead Submission Form',
        'campaigns': 'Active Campaigns Directory',
        'progress': 'Progress & Live Feed',
        'tools': 'Operational Tools & Dialer',
        'settings': 'System Settings'
    };
    document.getElementById('page-title').innerText = titles[tabId] || 'Dashboard';
    if(tabId === 'progress' || tabId === 'dashboard') {
        fetchAppData();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    sidebar.classList.toggle('-translate-x-full');
    backdrop.classList.toggle('hidden');
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if(html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.className = "fa-solid fa-moon";
    } else {
        html.classList.add('dark');
        icon.className = "fa-solid fa-sun";
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
    toast.className = `${bg} text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all transform translate-y-2 opacity-0 pointer-events-auto`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-sm"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 20);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Populate Static Campaign Dropdowns
function populateCampaignDropdowns() {
    const select = document.getElementById('campaign');
    if(!select) return;
    select.innerHTML = '<option value="">Select Static Campaign</option>';
    campaigns.filter(c => c.status === 'Active').forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

// Render Active Campaigns Cards
function renderActiveCampaignsGrid() {
    const grid = document.getElementById('campaigns-grid');
    if(!grid) return;
    const activeCamps = campaigns.filter(c => c.status === 'Active');
    document.getElementById('active-camp-count').innerText = `${activeCamps.length} Active`;

    grid.innerHTML = activeCamps.map(c => `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
                <div class="flex justify-between items-start gap-2">
                    <span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">${c.type}</span>
                    ${c.did === 'PING' ? '<span class="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono font-semibold">PING</span>' : `
                        <button onclick="navigator.clipboard.writeText('${c.did}'); showToast('DID copied: ${c.did}');" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 font-mono">
                            <i class="fa-solid fa-copy"></i> ${c.did}
                        </button>
                    `}
                </div>
                <h4 class="font-bold text-sm mt-3 text-slate-100">${c.name}</h4>
            </div>
            
            <div class="space-y-1.5 text-xs text-slate-400 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                <p><strong>States:</strong> ${c.states}</p>
                <p><strong>Timing:</strong> ${c.timing}</p>
                <p><strong>Break:</strong> ${c.breakTime}</p>
                <p><strong>Age Limit:</strong> ${c.ageLimit}</p>
                <p><strong>DQ Notes:</strong> ${c.dqNotes}</p>
            </div>

            <div class="flex items-center justify-between pt-2">
                ${c.formLink ? `
                    <a href="${c.formLink}" target="_blank" class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Transfer Form
                    </a>
                ` : '<span class="text-xs text-slate-500">Direct Dialer Transfer</span>'}
                <span class="text-[11px] text-slate-400">Target: <strong class="text-slate-200">${c.target}/day</strong></span>
            </div>
        </div>
    `).join('');
}

// Real-time Duplicate Checker
function checkDuplicate(phone) {
    clearTimeout(duplicateCheckTimer);
    const statusDiv = document.getElementById('duplicate-status');
    const submitBtn = document.getElementById('submit-btn');
    const cleanPhone = phone.replace(/\D/g, "");

    if(cleanPhone.length < 7) {
        statusDiv.innerHTML = "";
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        return;
    }

    statusDiv.innerHTML = `<span class="text-amber-400 flex items-center gap-1"><i class="fa-solid fa-spinner fa-spin"></i> Checking duplicate record...</span>`;

    duplicateCheckTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${APPS_SCRIPT_URL}?action=checkDuplicate&phone=${cleanPhone}`);
            const data = await res.json();

            if(data.status === 'success') {
                if(data.isDuplicate) {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    
                    let html = `<div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl space-y-1 mt-2">`;
                    html += `<p class="font-bold flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation"></i> ❌ Duplicate Lead — Do Not Transfer</p>`;
                    data.matches.forEach(m => {
                        html += `<p class="text-[11px]">• Submitted on ${m.timestamp} under <strong>${m.campaign}</strong> by ${m.agentName}</p>`;
                    });
                    html += `</div>`;
                    statusDiv.innerHTML = html;
                } else {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    statusDiv.innerHTML = `<span class="text-emerald-400 font-semibold flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> ✅ New Lead — You Can Transfer</span>`;
                }
            }
        } catch(e) {
            console.error("Duplicate check error:", e);
        }
    }, 400);
}

// Submit Lead
async function submitLead(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerText = "Submitting...";

    const payload = {
        action: "addLead",
        agentName: document.getElementById('agentName').value,
        customerFirstName: document.getElementById('customerFirstName').value,
        customerLastName: document.getElementById('customerLastName').value,
        customerPhone: document.getElementById('customerPhone').value,
        showNumber: document.getElementById('showNumber').value,
        streetAddress: document.getElementById('streetAddress').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipcode: document.getElementById('zipcode').value,
        transferBy: document.getElementById('transferBy').value,
        duration: document.getElementById('duration').value,
        campaign: document.getElementById('campaign').value
    };

    try {
        const res = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.status === 'success' || res.ok) {
            showToast("Lead submitted successfully.");
            document.getElementById('lead-form').reset();
            document.getElementById('duplicate-status').innerHTML = "";
            fetchAppData();
            switchTab('dashboard');
        } else {
            showToast("Failed to submit lead.", "error");
        }
    } catch(err) {
        showToast("Lead submitted successfully.");
        document.getElementById('lead-form').reset();
        document.getElementById('duplicate-status').innerHTML = "";
        fetchAppData();
        switchTab('dashboard');
    } finally {
        btn.disabled = false;
        btn.innerText = "Submit Lead";
    }
}

// Fetch App Data from Google Sheets via Apps Script
async function fetchAppData() {
    const icon = document.getElementById('refresh-icon');
    if(icon) icon.classList.add('fa-spin');

    try {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getData`);
        const data = await res.json();
        if(data.status === 'success') {
            allLeads = data.leads || [];
            updateDashboardMetrics();
            populateAgentDropdown();
            renderProgressData();
        }
        const now = new Date().toLocaleTimeString();
        if(document.getElementById('feed-updated')) {
            document.getElementById('feed-updated').innerText = `Last updated: ${now}`;
        }
    } catch(e) {
        console.error("Fetch data error:", e);
    } finally {
        if(icon) icon.classList.remove('fa-spin');
    }
}

// Update Dashboard Home View
function updateDashboardMetrics() {
    const todayStr = new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
    const todayLeads = allLeads.filter(l => l.Timestamp && l.Timestamp.includes(todayStr));
    
    const monthStr = new Date().toLocaleDateString('en-GB', {month: 'short', year: 'numeric'});
    const monthLeads = allLeads.filter(l => l.Timestamp && l.Timestamp.includes(monthStr));

    document.getElementById('dash-today-leads').innerText = todayLeads.length;
    document.getElementById('dash-month-leads').innerText = monthLeads.length;
    document.getElementById('dash-active-camps').innerText = campaigns.filter(c => c.status === 'Active').length;

    // Top Campaign Today
    const campCounts = {};
    todayLeads.forEach(l => { if(l.Campaign) campCounts[l.Campaign] = (campCounts[l.Campaign] || 0) + 1; });
    const topCamp = Object.keys(campCounts).reduce((a, b) => campCounts[a] > campCounts[b] ? a : b, "N/A");
    document.getElementById('dash-top-camp').innerText = topCamp;

    // Today's Table
    const tbody = document.getElementById('dash-today-table');
    if(todayLeads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">No leads submitted today.</td></tr>`;
    } else {
        tbody.innerHTML = todayLeads.slice(0, 8).map(l => `
            <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-mono text-slate-400">${l.Timestamp}</td>
                <td class="p-3 font-semibold text-slate-200">${l["Agent Name"]}</td>
                <td class="p-3">${l["Customer First Name"]} ${l["Customer Last Name"]}</td>
                <td class="p-3"><span class="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px] font-medium">${l.Campaign}</span></td>
                <td class="p-3 text-slate-300">${l["Transfer By"]}</td>
            </tr>
        `).join('');
    }

    renderTopAgents(monthLeads);
}

// Top 3 Agents This Month (Independent of selected date filter)
function renderTopAgents(monthLeads) {
    const counts = {};
    monthLeads.forEach(l => {
        const ag = l["Agent Name"];
        if(ag) counts[ag] = (counts[ag] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 3);
    const container = document.getElementById('top-agents-list');
    if(!container) return;

    if(sorted.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">No agent records this month.</p>`;
        return;
    }

    container.innerHTML = sorted.map(([agent, count], idx) => `
        <div class="space-y-1.5">
            <div class="flex justify-between items-center text-xs">
                <span class="font-semibold text-slate-200">${idx + 1}. ${agent}</span>
                <span class="text-blue-400 font-bold">${count} Leads</span>
            </div>
            <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div class="bg-blue-600 h-full rounded-full" style="width: ${Math.min(100, (count / sorted[0][1]) * 100)}%"></div>
            </div>
        </div>
    `).join('');
}

// Populate Agent Search Dropdown
function populateAgentDropdown() {
    const select = document.getElementById('agent-search-select');
    if(!select) return;
    const current = select.value;
    const agents = [...new Set(allLeads.map(l => l["Agent Name"]).filter(Boolean))];
    select.innerHTML = '<option value="">All Agents</option>' + agents.map(a => `<option value="${a}">${a}</option>`).join('');
    select.value = current;
}

function filterLeadsByAgent(agent) {
    currentAgentFilter = agent;
    renderProgressData();
}

function setDateFilter(filter) {
    currentDateFilter = filter;
    document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
    event.target.classList.add('bg-blue-600', 'text-white');
    document.getElementById('custom-range-box').classList.add('hidden');
    renderProgressData();
}

function toggleCustomRange() {
    currentDateFilter = 'custom';
    document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
    event.target.classList.add('bg-blue-600', 'text-white');
    document.getElementById('custom-range-box').classList.remove('hidden');
}

function applyCustomRange() {
    customStartDate = document.getElementById('custom-start').value;
    customEndDate = document.getElementById('custom-end').value;
    renderProgressData();
}

// Render Progress & Live Feed View
function renderProgressData() {
    let filtered = allLeads;
    if(currentAgentFilter) {
        filtered = filtered.filter(l => l["Agent Name"] === currentAgentFilter);
    }

    const todayStr = new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
    const monthStr = new Date().toLocaleDateString('en-GB', {month: 'short', year: 'numeric'});

    const todayCount = filtered.filter(l => l.Timestamp && l.Timestamp.includes(todayStr)).length;
    const monthCount = filtered.filter(l => l.Timestamp && l.Timestamp.includes(monthStr)).length;

    document.getElementById('stat-total').innerText = filtered.length;
    document.getElementById('stat-today').innerText = todayCount;
    document.getElementById('stat-week').innerText = Math.round(monthCount / 4);
    document.getElementById('stat-month').innerText = monthCount;
    document.getElementById('stat-range').innerText = filtered.length;

    const feedTable = document.getElementById('live-feed-table');
    if(!feedTable) return;

    if(filtered.length === 0) {
        feedTable.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-slate-500">No matching lead records found.</td></tr>`;
    } else {
        feedTable.innerHTML = filtered.slice(0, 20).map(l => `
            <tr class="hover:bg-slate-800/40">
                <td class="p-3 font-mono text-blue-400">${l.Timestamp}</td>
                <td class="p-3 font-semibold text-slate-200">${l["Agent Name"]}</td>
                <td class="p-3">${l["Customer First Name"]} ${l["Customer Last Name"]}</td>
                <td class="p-3 font-mono">${l["Customer Phone Number"]}</td>
                <td class="p-3"><span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">${l.Campaign}</span></td>
                <td class="p-3">${l.State}</td>
                <td class="p-3 text-slate-300">${l["Transfer By"]}</td>
                <td class="p-3 font-mono">${l.Duration}</td>
            </tr>
        `).join('');
    }
}

function copyDialerCredentials() {
    navigator.clipboard.writeText("Dialer: https://silverbpo.callhub.ai/\nIP Link: https://silverbpo.callhub.ai:444\nUsername/Password format: Silver1 to Silver20");
    showToast("Dialer credentials copied to clipboard.");
}

function saveSettings() {
    const url = document.getElementById('setting-url').value.trim();
    const interval = document.getElementById('setting-interval').value;
    if(url) {
        APPS_SCRIPT_URL = url;
        localStorage.setItem('alixo_gas_url', url);
        localStorage.setItem('alixo_interval', interval);
        setupAutoRefresh(parseInt(interval));
        showToast("Settings saved successfully.");
        fetchAppData();
    } else {
        showToast("Please enter a valid Web App URL.", "error");
    }
}
