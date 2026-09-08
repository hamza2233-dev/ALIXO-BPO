/* =====================================================================
   ALIXO BPO — Command Dashboard
   Vanilla JS controller. Talks to a Google Apps Script Web App backend.
   Campaigns are STATIC and defined here — never fetched from Sheets.
===================================================================== */

/* ---------------------------------------------------------------------
   1. STATIC CAMPAIGN CONFIGURATION
--------------------------------------------------------------------- */
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
    target: 25,
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
    dqNotes: "",
    formLink: "https://silverbpo.callhub.ai/form.php",
    target: 25,
    status: "Active"
  },
  {
    name: "FE 180 (BLIND TRANSFER) (ADO)",
    type: "Static",
    did: "PING",
    states: "States: AL, AZ, CO, IL, IN, KS, KY, MI, MO, OH, PA, SC, TN, TX",
    timing: "06:30 PM - 03:00 AM",
    breakTime: "NO BREAK",
    ageLimit: "50-80",
    dqNotes: "",
    formLink: "https://silverbpo.callhub.ai/form3.php",
    target: 25,
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
    target: 25,
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
    target: 25,
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
    target: 25,
    status: "Active"
  },
  {
    name: "220 FE (BLIND TRANSFER) (ATTA)",
    type: "Static",
    did: "8554713892",
    states: "States: AL, AR, AZ, CA, CO, FL, GA, IA, IL, IN, KS, KY, LA, MD, MI, MO, MS, NC, NJ, NM, NV, OH, OR, PA, SC, TN, TX, VA",
    timing: "06:00 PM - 04:00 AM",
    breakTime: "NO BREAK",
    ageLimit: "50-79",
    dqNotes: "ORIGINAL NUMBER ONLY",
    formLink: "https://www.leadlync.site/form/",
    target: 25,
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
    target: 25,
    status: "Active"
  }
];

/* ---------------------------------------------------------------------
   2. BACKEND CONFIG — edit these two lines yourself, no UI for this.
   WEB_APP_URL: the /exec URL from your Apps Script deployment.
   SHEET_ID:    must match the SHEET_ID constant at the top of Code.gs.
--------------------------------------------------------------------- */
const WEB_APP_URL = ""; // <-- paste your Apps Script Web App URL here
const SHEET_ID = "1CbsdRlwnAYxZ4Ny7SQsjwOnVgshVlr-039ZfHAVA92I";

/* Theme + auto-refresh are the only things still remembered per-browser. */
const Config = {
  key: "alixo_dashboard_prefs",
  data: { webAppUrl: WEB_APP_URL, sheetId: SHEET_ID, theme: "dark", refreshInterval: 20 },
  load(){
    try{
      const raw = localStorage.getItem(this.key);
      if (raw) this.data = { ...this.data, ...JSON.parse(raw), webAppUrl: WEB_APP_URL, sheetId: SHEET_ID };
    }catch(e){ /* ignore */ }
    return this.data;
  },
  save(patch){
    this.data = { ...this.data, ...patch };
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }
};

/* ---------------------------------------------------------------------
   3. API layer — talks to the Apps Script Web App
--------------------------------------------------------------------- */
const Api = {
  async get(action, params = {}){
    const url = new URL(Config.data.webAppUrl);
    url.searchParams.set("action", action);
    Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== "") url.searchParams.set(k, v); });
    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) throw new Error("Network error: " + res.status);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  },
  async post(action, payload = {}){
    if (!Config.data.webAppUrl) throw new Error("No Web App URL configured. Set WEB_APP_URL in script.js.");
    // text/plain avoids a CORS preflight against Apps Script
    const res = await fetch(Config.data.webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload })
    });
    if (!res.ok) throw new Error("Network error: " + res.status);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  }
};

/* ---------------------------------------------------------------------
   4. Utilities
--------------------------------------------------------------------- */
const Util = {
  normalizePhone(str){ return (str || "").replace(/\D/g, ""); },
  fmtPhone(digits){
    if (!digits) return "—";
    const d = digits.slice(-10);
    if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    return digits;
  },
  fmtTime(ts){
    if (!ts) return "—";
    const d = new Date(ts);
    if (isNaN(d)) return ts;
    return d.toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit", timeZone:"America/New_York" });
  },
  debounce(fn, ms){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },
  escapeHtml(str){
    return String(str ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  },
  todayLabelET(){
    return new Date().toLocaleDateString("en-US", { timeZone:"America/New_York", month:"long", day:"numeric" });
  },
  monthLabelET(){
    return new Date().toLocaleDateString("en-US", { timeZone:"America/New_York", month:"long", year:"numeric" });
  }
};

/* ---------------------------------------------------------------------
   5. Toasts
--------------------------------------------------------------------- */
const Toast = {
  show(msg, type = "info"){
    const stack = document.getElementById("toastStack");
    const el = document.createElement("div");
    el.className = "toast" + (type !== "info" ? " " + type : "");
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }
};

/* ---------------------------------------------------------------------
   6. Theme
--------------------------------------------------------------------- */
const Theme = {
  init(){
    const saved = Config.load().theme || "dark";
    this.apply(saved);
    document.getElementById("themeToggle").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      this.apply(next);
      Config.save({ theme: next });
    });
  },
  apply(theme){
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("themeIconSun").style.display = theme === "light" ? "block" : "none";
    document.getElementById("themeIconMoon").style.display = theme === "light" ? "none" : "block";
  }
};

/* ---------------------------------------------------------------------
   7. Navigation
--------------------------------------------------------------------- */
const Nav = {
  titles: {
    dashboard: "Dashboard", leadsubmission: "Lead Submission", dupechecker: "Dupe Checker",
    campaigns: "Active Campaigns", progress: "Progress", tools: "Tools"
  },
  init(){
    document.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => this.go(btn.dataset.page));
    });
    document.getElementById("menuBtn").addEventListener("click", () => this.toggleMobile(true));
    document.getElementById("scrim").addEventListener("click", () => this.toggleMobile(false));
  },
  toggleMobile(open){
    document.getElementById("sidebar").classList.toggle("open", open);
    document.getElementById("scrim").classList.toggle("show", open);
  },
  go(page){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page-" + page).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.page === page));
    document.getElementById("pageTitle").textContent = this.titles[page];
    this.toggleMobile(false);

    if (page === "dashboard") Dashboard.refresh();
    if (page === "dupechecker") DupeChecker.init();
    if (page === "campaigns") Campaigns.render();
    if (page === "progress") Progress.init();
    if (page === "tools") Tools.render();
  }
};

/* ---------------------------------------------------------------------
   8. Dashboard page
--------------------------------------------------------------------- */
const Dashboard = {
  autoTimer: null,
  async refresh(){
    document.getElementById("statTodayFoot").textContent = "since midnight, " + Util.todayLabelET();
    document.getElementById("statMonthFoot").textContent = Util.monthLabelET();
    if (!Config.data.webAppUrl){ this.renderEmpty(); return; }
    try{
      const data = await Api.get("getDashboardStats");
      document.getElementById("statTotal").textContent = data.totalLeads ?? "0";
      document.getElementById("statToday").textContent = data.todayLeads ?? "0";
      document.getElementById("statWeek").textContent = data.weekLeads ?? "0";
      document.getElementById("statMonth").textContent = data.monthLeads ?? "0";
      document.getElementById("statDup").textContent = data.duplicateLeads ?? "0";

      this.renderRecent(data.recentLeads || []);
      this.renderCampaignPerf(data.campaignPerformance || {});
      this.renderTopAgentsMini(data.topAgents || []);
      Connection.setOk();
    }catch(err){
      Connection.setBad();
      Toast.show("Could not load dashboard stats: " + err.message, "error");
      this.renderEmpty();
    }
  },
  startAutoRefresh(){
    clearInterval(this.autoTimer);
    const secs = Number(Config.data.refreshInterval) || 20;
    this.autoTimer = setInterval(() => {
      if (document.getElementById("page-dashboard").classList.contains("active")) this.refresh();
    }, secs * 1000);
  },
  renderEmpty(){
    document.querySelector("#recentLeadsTable tbody").innerHTML =
      `<tr><td colspan="5" class="empty-row">Set WEB_APP_URL in script.js to load live data.</td></tr>`;
    document.getElementById("campaignPerfRings").innerHTML = `<p class="empty-row">No data yet.</p>`;
    document.getElementById("topAgentsMini").innerHTML = `<p class="empty-row">No data yet.</p>`;
  },
  renderRecent(rows){
    const tbody = document.querySelector("#recentLeadsTable tbody");
    if (!rows.length){ tbody.innerHTML = `<tr><td colspan="5" class="empty-row">No leads submitted yet.</td></tr>`; return; }
    tbody.innerHTML = rows.slice(0, 5).map(r => `
      <tr>
        <td>${Util.fmtTime(r.timestamp)}</td>
        <td>${Util.escapeHtml(r.agentName)}</td>
        <td>${Util.escapeHtml(r.firstName)} ${Util.escapeHtml(r.lastName)}</td>
        <td>${Util.escapeHtml(r.campaign)}</td>
        <td>${Util.escapeHtml(r.state)}</td>
      </tr>`).join("");
  },
  ringColors: ["var(--cyan)", "var(--blue)", "var(--violet)"],
  renderCampaignPerf(perf){
    const active = campaigns.filter(c => c.status === "Active");
    const html = active.map((c, i) => {
      const count = perf[c.name] || 0;
      const pct = Math.min(100, Math.round((count / c.target) * 100));
      const color = this.ringColors[i % this.ringColors.length];
      return `
        <div class="perf-ring-card">
          <div class="perf-ring" style="--pct:${pct}; --ring-color:${color}">
            <div class="perf-ring-inner">
              <span class="perf-ring-value">${pct}%</span>
              <span class="perf-ring-sub">${count}/${c.target}</span>
            </div>
          </div>
          <span class="perf-ring-name">${Util.escapeHtml(c.name)}</span>
        </div>`;
    }).join("");
    document.getElementById("campaignPerfRings").innerHTML = html || `<p class="empty-row">No campaign activity today.</p>`;
  },
  renderTopAgentsMini(agents){
    if (!agents.length){ document.getElementById("topAgentsMini").innerHTML = `<p class="empty-row">No agent activity yet.</p>`; return; }
    document.getElementById("topAgentsMini").innerHTML = agents.slice(0,5).map((a,i) => `
      <div class="agent-row">
        <span class="agent-rank">${i+1}</span>
        <b>${Util.escapeHtml(a.agentName)}</b>
        <span>${a.count} leads</span>
      </div>`).join("");
  }
};

/* ---------------------------------------------------------------------
   9. Lead Submission page
   Note: duplicate checking is NOT done here — some customers legitimately
   qualify for more than one campaign. Use the separate Dupe Checker page
   to look a number up before transferring.
--------------------------------------------------------------------- */
const LeadSubmission = {
  init(){
    const select = document.getElementById("campaignSelect");
    campaigns.filter(c => c.status === "Active").forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.name; opt.textContent = c.name;
      select.appendChild(opt);
    });

    document.getElementById("leadForm").addEventListener("submit", (e) => this.submit(e));
  },
  async submit(e){
    e.preventDefault();
    const form = e.target;
    const msg = document.getElementById("formMsg");

    if (!form.checkValidity()){ form.reportValidity(); return; }
    if (!Config.data.webAppUrl){
      msg.textContent = "Set WEB_APP_URL at the top of script.js first."; msg.className = "form-msg error";
      return;
    }

    const fd = new FormData(form);
    const payload = {
      agentName: fd.get("agentName")?.trim(),
      firstName: fd.get("firstName")?.trim(),
      lastName: fd.get("lastName")?.trim(),
      phone: Util.normalizePhone(fd.get("phone")),
      showNumber: Util.normalizePhone(fd.get("showNumber")),
      street: fd.get("street")?.trim(),
      city: fd.get("city")?.trim(),
      state: fd.get("state")?.trim().toUpperCase(),
      zipcode: fd.get("zipcode")?.trim(),
      transferBy: fd.get("transferBy"),
      duration: fd.get("duration")?.trim(),
      campaign: fd.get("campaign")
    };

    const submitBtn = document.getElementById("submitLeadBtn");
    submitBtn.disabled = true; submitBtn.textContent = "Submitting…";
    msg.textContent = ""; msg.className = "form-msg";

    try{
      const res = await Api.post("addLead", payload);
      const stamp = Util.fmtTime(res.timestamp);
      msg.textContent = `Lead submitted successfully — ${stamp} ET.`; msg.className = "form-msg ok";
      Toast.show(`Lead submitted successfully — ${stamp} ET.`, "success");
      form.reset();
      Dashboard.refresh();
      if (document.getElementById("page-progress").classList.contains("active")) Progress.refreshLiveFeed();
    }catch(err){
      msg.textContent = "Error: " + err.message; msg.className = "form-msg error";
      Toast.show("Submission failed: " + err.message, "error");
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Lead";
    }
  }
};

/* ---------------------------------------------------------------------
   9b. Dupe Checker page — standalone lookup, does not block submission
--------------------------------------------------------------------- */
const DupeChecker = {
  init(){
    if (this._bound) return;
    this._bound = true;
    document.getElementById("dupeCheckForm").addEventListener("submit", (e) => this.search(e));
  },
  async search(e){
    e.preventDefault();
    const phoneInput = document.getElementById("dupeCheckPhone");
    const msg = document.getElementById("dupeCheckMsg");
    const btn = document.getElementById("dupeCheckBtn");
    const tbody = document.querySelector("#dupeCheckTable tbody");
    const digits = Util.normalizePhone(phoneInput.value);

    if (digits.length < 7){
      msg.textContent = "Enter a full phone number."; msg.className = "form-msg error";
      return;
    }
    if (!Config.data.webAppUrl){
      msg.textContent = "Set WEB_APP_URL at the top of script.js first."; msg.className = "form-msg error";
      return;
    }

    btn.disabled = true; btn.textContent = "Searching…";
    msg.textContent = ""; msg.className = "form-msg";

    try{
      const res = await Api.get("checkDuplicate", { phone: digits });
      if (!res.duplicate || !res.matches.length){
        msg.textContent = "✅ No prior submissions found for this number."; msg.className = "form-msg ok";
        tbody.innerHTML = `<tr><td colspan="5" class="empty-row">No matches found.</td></tr>`;
      } else {
        msg.textContent = `Found ${res.matches.length} prior submission(s) for this number.`; msg.className = "form-msg";
        tbody.innerHTML = res.matches.map(m => `
          <tr>
            <td>${Util.fmtTime(m.timestamp)}</td>
            <td>${Util.escapeHtml(m.agentName)}</td>
            <td>${Util.escapeHtml(m.firstName || "")} ${Util.escapeHtml(m.lastName || "")}</td>
            <td>${Util.escapeHtml(m.campaign)}</td>
            <td>${Util.escapeHtml(m.state || "")}</td>
          </tr>`).join("");
      }
    }catch(err){
      msg.textContent = "Search failed: " + err.message; msg.className = "form-msg error";
      Toast.show("Dupe check failed: " + err.message, "error");
    }finally{
      btn.disabled = false; btn.textContent = "Search";
    }
  }
};

/* ---------------------------------------------------------------------
   10. Active Campaigns page
--------------------------------------------------------------------- */
const Campaigns = {
  perf: {},
  async render(){
    const grid = document.getElementById("campaignGrid");
    const active = campaigns.filter(c => c.status === "Active");

    if (Config.data.webAppUrl){
      try{
        const data = await Api.get("getDashboardStats");
        this.perf = data.campaignPerformance || {};
      }catch(e){ /* render with zeros */ }
    }

    grid.innerHTML = active.map(c => {
      const count = this.perf[c.name] || 0;
      const pct = Math.min(100, Math.round((count / c.target) * 100));
      return `
      <div class="campaign-card">
        <div class="campaign-card-head">
          <h3>${Util.escapeHtml(c.name)}</h3>
          <span class="badge active">ACTIVE</span>
        </div>
        <div class="campaign-meta">
          <span><b>Type:</b> ${Util.escapeHtml(c.type)}</span>
          <span><b>Timing:</b> ${Util.escapeHtml(c.timing)}</span>
          <span><b>Break:</b> ${Util.escapeHtml(c.breakTime)}</span>
          <span><b>Age:</b> ${Util.escapeHtml(c.ageLimit)}</span>
        </div>
        <div class="did-row">
          <code>${c.did === "PING" ? "PING" : Util.escapeHtml(c.did)}</code>
          ${c.did !== "PING" ? `<button class="copy-did-btn" title="Copy DID" data-did="${Util.escapeHtml(c.did)}">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>
          </button>` : ""}
        </div>
        <div class="campaign-meta">
          <span>${Util.escapeHtml(c.states)}</span>
        </div>
        ${c.dqNotes ? `<div class="dq-note">DQ: ${Util.escapeHtml(c.dqNotes)}</div>` : ""}
        <div class="campaign-progress">
          <div class="campaign-progress-top"><span>Today: ${count} leads</span><span>Target: ${c.target}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="campaign-actions">
          ${c.formLink ? `<a class="primary-btn small" href="${Util.escapeHtml(c.formLink)}" target="_blank" rel="noopener">Before Transfer Form</a>` : ""}
        </div>
      </div>`;
    }).join("");

    grid.querySelectorAll(".copy-did-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        navigator.clipboard?.writeText(btn.dataset.did);
        Toast.show("DID copied: " + btn.dataset.did, "success");
      });
    });
  }
};

/* ---------------------------------------------------------------------
   11. Progress page
--------------------------------------------------------------------- */
const Progress = {
  currentRange: "today",
  customStart: null,
  customEnd: null,
  liveFeedTimer: null,
  agentsLoaded: false,

  init(){
    if (this._bound) { this.refreshAll(); this.restartAutoRefresh(); return; }
    this._bound = true;

    document.getElementById("dateChips").addEventListener("click", (e) => {
      const btn = e.target.closest(".chip"); if (!btn) return;
      document.querySelectorAll("#dateChips .chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      this.currentRange = btn.dataset.range;
      document.getElementById("customRangeRow").hidden = this.currentRange !== "custom";
      if (this.currentRange !== "custom") this.refreshAll();
    });
    document.getElementById("applyRangeBtn").addEventListener("click", () => {
      this.customStart = document.getElementById("rangeStart").value;
      this.customEnd = document.getElementById("rangeEnd").value;
      if (!this.customStart || !this.customEnd){ Toast.show("Pick both a start and end date.", "error"); return; }
      this.refreshAll();
    });
    document.getElementById("agentFilter").addEventListener("change", () => this.refreshAll());
    document.getElementById("refreshProgressBtn").addEventListener("click", () => this.refreshAll());

    this.refreshAll();
    this.restartAutoRefresh();
  },
  restartAutoRefresh(){
    clearInterval(this.liveFeedTimer);
    const secs = Number(Config.data.refreshInterval) || 20;
    this.liveFeedTimer = setInterval(() => this.refreshLiveFeed(), secs * 1000);
  },
  async refreshAll(){
    if (!Config.data.webAppUrl){
      Toast.show("Set WEB_APP_URL in script.js to load progress data.", "error");
      return;
    }
    await Promise.all([
      this.refreshStats(),
      this.refreshLiveFeed(),
      this.refreshTodayLeads(),
      this.refreshTopAgents(),
      this.loadAgentList()
    ]);
  },
  async refreshStats(){
    try{
      const agent = document.getElementById("agentFilter").value;
      const params = { range: this.currentRange, agent };
      if (this.currentRange === "custom"){ params.start = this.customStart; params.end = this.customEnd; }
      const data = await Api.get("getProgress", params);
      document.getElementById("progTotal").textContent = data.totalLeads ?? "0";
      document.getElementById("progToday").textContent = data.todayLeads ?? "0";
      document.getElementById("progWeek").textContent = data.weekLeads ?? "0";
      document.getElementById("progMonth").textContent = data.monthLeads ?? "0";
      document.getElementById("progRange").textContent = data.rangeLeads ?? "0";
      Connection.setOk();
    }catch(err){ Connection.setBad(); Toast.show("Progress load failed: " + err.message, "error"); }
  },
  async refreshLiveFeed(){
    if (!Config.data.webAppUrl) return;
    try{
      const data = await Api.get("getLiveFeed", { limit: 40 });
      const tbody = document.querySelector("#liveFeedTable tbody");
      const rows = data.leads || [];
      tbody.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td>${Util.fmtTime(r.timestamp)}</td><td>${Util.escapeHtml(r.agentName)}</td>
          <td>${Util.escapeHtml(r.firstName)} ${Util.escapeHtml(r.lastName)}</td>
          <td>${Util.escapeHtml(r.campaign)}</td>
        </tr>`).join("") : `<tr><td colspan="4" class="empty-row">No leads yet.</td></tr>`;
    }catch(err){ /* silent on background refresh */ }
  },
  async refreshTodayLeads(){
    if (!Config.data.webAppUrl) return;
    try{
      const data = await Api.get("getTodayLeads");
      const tbody = document.querySelector("#todayLeadsTable tbody");
      const rows = data.leads || [];
      tbody.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td>${Util.fmtTime(r.timestamp)}</td><td>${Util.escapeHtml(r.agentName)}</td>
          <td>${Util.escapeHtml(r.firstName)} ${Util.escapeHtml(r.lastName)}</td>
          <td>${Util.fmtPhone(r.phone)}</td><td>${Util.escapeHtml(r.campaign)}</td>
          <td>${Util.escapeHtml(r.state)}</td><td>${Util.escapeHtml(r.transferBy)}</td><td>${Util.escapeHtml(r.duration)}</td>
        </tr>`).join("") : `<tr><td colspan="8" class="empty-row">No leads submitted today yet.</td></tr>`;
    }catch(err){ /* silent */ }
  },
  async refreshTopAgents(){
    if (!Config.data.webAppUrl) return;
    try{
      const data = await Api.get("getTopAgents");
      const row = document.getElementById("topAgentsRow");
      const agents = (data.agents || []).slice(0,3);
      row.innerHTML = agents.length ? agents.map((a,i) => `
        <div class="top-agent-card">
          <div class="rank">#${i+1}</div>
          <div class="name">${Util.escapeHtml(a.agentName)}</div>
          <div class="count">${a.count} leads this month</div>
        </div>`).join("") : `<p class="empty-row">No agent activity this month yet.</p>`;
    }catch(err){ /* silent */ }
  },
  async loadAgentList(){
    if (this.agentsLoaded || !Config.data.webAppUrl) return;
    try{
      const data = await Api.get("getTopAgents", { all: true });
      const select = document.getElementById("agentFilter");
      (data.agents || []).forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.agentName; opt.textContent = a.agentName;
        select.appendChild(opt);
      });
      this.agentsLoaded = true;
    }catch(e){ /* silent */ }
  }
};

/* ---------------------------------------------------------------------
   12. Tools page
--------------------------------------------------------------------- */
const Tools = {
  links: [
    { name: "Inhouse Form", url: "https://docs.google.com/forms/d/1aI1zJBzCfVVHZsoN7J9y3IgXlD1jlm3M93QVZNzskGo/edit", note: "Internal intake form" },
    { name: "TCPA Tools", url: "https://tcpa.tools/", note: "Compliance lookup" },
    { name: "Pharmacy Form", url: "https://forms.gle/dwKd8qccigrdx7BN7", note: "Pharmacy verification" },
    { name: "Searching Website", url: "https://uspeoplesearch.net/", note: "People / number lookup" },
    { name: "Inbound Transfer Form", url: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSd8A350LojvYD9qY78p1uydYB15lDscFtqiMABMLfsAxizG_Q/formResponse", note: "Inbound transfer logging" }
  ],
  rendered: false,
  render(){
    if (this.rendered) return;
    document.getElementById("toolsGrid").innerHTML = this.links.map(l => `
      <a class="tool-card" href="${l.url}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7zM5 5h5V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5h-2v5H5V5z" fill="currentColor"/></svg>
        <b>${Util.escapeHtml(l.name)}</b>
        <span>${Util.escapeHtml(l.note)}</span>
      </a>`).join("");

    document.getElementById("copyLoginBtn").addEventListener("click", () => {
      const text = "Dialer Domain: https://silverbpo.callhub.ai/\nIP Whitelisted Link: https://silverbpo.callhub.ai:444\nUsername: Silver1 - Silver20\nPassword: Silver1 - Silver20\nLogin: Same ID and Same Password";
      navigator.clipboard?.writeText(text);
      Toast.show("Login details copied.", "success");
    });
    this.rendered = true;
  }
};

/* ---------------------------------------------------------------------
   13. Connection indicator
--------------------------------------------------------------------- */
const Connection = {
  setOk(){ document.getElementById("connDot").className = "conn-dot ok"; document.getElementById("connLabel").textContent = "Connected to Sheets"; },
  setBad(){ document.getElementById("connDot").className = "conn-dot bad"; document.getElementById("connLabel").textContent = "Link unavailable"; },
  async check(){
    if (!Config.data.webAppUrl){
      document.getElementById("connDot").className = "conn-dot";
      document.getElementById("connLabel").textContent = "Set WEB_APP_URL in script.js";
      return;
    }
    try{ await Api.get("getDashboardStats"); this.setOk(); }catch(e){ this.setBad(); }
  }
};

/* ---------------------------------------------------------------------
   15. Clock
--------------------------------------------------------------------- */
function tickClock(){
  const el = document.getElementById("pageClock");
  el.textContent = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York", weekday:"short", month:"short", day:"numeric",
    hour:"numeric", minute:"2-digit", second:"2-digit"
  }) + " ET";
}

/* ---------------------------------------------------------------------
   16. Boot
--------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  Config.load();
  Theme.init();
  Nav.init();
  LeadSubmission.init();

  tickClock();
  setInterval(tickClock, 1000);

  Connection.check();
  Dashboard.refresh();
  Dashboard.startAutoRefresh();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    Toast.show("Logout is a placeholder — wire up your auth provider here.");
  });
});
