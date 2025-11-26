// script.js - improved, self-contained behavior for SCode site
// Author: ChatGPT (for SCode Studio)
// Features:
// - GitHub folder fetching with cache
// - dropdowns: university -> level -> semester -> program
// - load/display PDFs (main list opens in floating viewer)
// - SC Tools integration (site PDF selector, upload-to-open, AI open)
// - loading spinner, friendly messages, recent opened list
// - avoids duplicate handlers

// -------------------------------
// CONFIG
// -------------------------------
const config = {
  mode: "single",
  singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
};

// -------------------------------
// DOM refs
// -------------------------------
const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");

const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchNameBtn = document.getElementById("searchNameBtn");

const viewer = document.getElementById("sc-pdf-viewer");       // floating viewer container
const viewerFrame = document.getElementById("viewerFrame");   // inner frame container
const viewerCloseBtn = document.getElementById("viewerCloseBtn");

// SC Tools elements
const scToggle = document.getElementById("scToggle");
const scContent = document.getElementById("scContent");
const scInsToggle = document.getElementById("scInsToggle");
const scInsFull = document.getElementById("scInsFull");
const scPDFSelect = document.getElementById("scPDF");
const scPDFInput = document.getElementById("scPDFInput");
const scOpenPDFBtn = document.getElementById("scOpenPDF");
const scAISelect = document.getElementById("scAI");
const scOpenAIBtn = document.getElementById("scOpenAI");

// Recent UI (optional)
const recentPanel = document.getElementById("recentPanel");
const recentList = document.getElementById("recentList");

// -------------------------------
// State
// -------------------------------
let cachedFolders = {};   // cache responses keyed by URL
let loadedPDFs = [];      // currently loaded PDFs for the selected program
let recentOpened = [];    // names of recently opened PDFs (max 10)

// -------------------------------
// UI helpers
// -------------------------------
function showMessage(msg, type = "info") {
  if (!pdfList) return;
  const cls = type === "error" ? "msg-error" : (type === "success" ? "msg-success" : "msg-info");
  pdfList.innerHTML = `<div class="${cls}">${msg}</div>`;
}

function showLoading(msg = "Loading…") {
  if (!pdfList) return;
  pdfList.innerHTML = `<div style="text-align:center"><div class="loading-spinner"></div><p>${msg}</p></div>`;
}

function updateRecentUI() {
  if (!recentPanel || !recentList) return;
  if (recentOpened.length === 0) {
    recentPanel.style.display = "none";
    return;
  }
  recentPanel.style.display = "block";
  recentList.innerHTML = recentOpened.map(n => `<li>${escapeHtml(n)}</li>`).join("");
}

// small HTML-escape helper
function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
}

// -------------------------------
// GitHub fetch w/ cache
// -------------------------------
async function fetchFolder(url, branch = config.singleRepo.branch) {
  const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
  if (cachedFolders[fullUrl]) return cachedFolders[fullUrl];
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) return [];
    const data = await res.json();
    cachedFolders[fullUrl] = data;
    return data;
  } catch (err) {
    console.error("fetchFolder error", err);
    return [];
  }
}

// -------------------------------
// Dropdown helpers
// -------------------------------
function populateDropdown(dropdown, items) {
  if (!dropdown) return;
  dropdown.innerHTML = `<option value="">Select ${dropdown.id.charAt(0).toUpperCase() + dropdown.id.slice(1)}</option>`;
  items.forEach(i => {
    if (i.type === "dir") {
      const opt = document.createElement("option");
      opt.value = i.path;
      opt.textContent = i.name;
      dropdown.appendChild(opt);
    }
  });
  dropdown.disabled = false;
}

function resetDropdowns(...dropdowns) {
  dropdowns.forEach(d => {
    if (!d) return;
    d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
    d.disabled = true;
  });
  if (pdfList) pdfList.innerHTML = "";
  loadedPDFs = [];
  populateSCSiteSelector([]); // clear SC site selector when resetting
}

// -------------------------------
// Display PDFs (main list) -> opens in floating viewer
// -------------------------------
function displayPDFs(pdfs) {
  if (!pdfList) return;
  if (!Array.isArray(pdfs) || pdfs.length === 0) {
    showMessage("No PDF files found.", "error");
    populateSCSiteSelector([]);
    return;
  }

  pdfList.innerHTML = "";
  const adLink = "https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";

  pdfs.forEach(f => {
    const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div = document.createElement("div");
    div.className = "pdf-item";
    // clicking main list opens in floating viewer (no auto-download)
    div.innerHTML = `<a href="#" class="pdf-main-link" data-pdf="${rawURL}">${escapeHtml(f.name)}</a>`;
    pdfList.appendChild(div);
  });

  // attach click handlers (avoid duplicates)
  document.querySelectorAll(".pdf-main-link").forEach(link => {
    if (link.dataset.init) return;
    link.dataset.init = "1";
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pdfURL = link.dataset.pdf;
      openInViewer(pdfURL);
      // open ad in new tab (keeping original behavior)
      try { window.open(adLink, "_blank"); } catch (err) { /* ignore */ }
      // record recent
      const name = link.textContent || pdfURL;
      recordRecent(name);
    });
  });

  // populate SC site selector so user may open site PDFs in new tab
  populateSCSiteSelector(pdfs);
}

// -------------------------------
// viewer functions
// -------------------------------
function openInViewer(pdfURL) {
  if (!viewer || !viewerFrame) {
    // fallback: open directly in new tab
    window.open(pdfURL, "_blank");
    return;
  }

  // Use Google Docs viewer for broader embed compatibility
  const iframeSrc = `https://docs.google.com/gview?url=${encodeURIComponent(pdfURL)}&embedded=true`;
  viewerFrame.innerHTML = `<iframe src="${iframeSrc}" style="width:100%;height:100%;border:none"></iframe>`;
  viewer.style.display = "block";
  viewer.setAttribute("aria-hidden", "false");
  viewer.scrollIntoView({ behavior: "smooth" });
}

if (viewerCloseBtn) {
  viewerCloseBtn.addEventListener("click", () => {
    if (!viewer || !viewerFrame) return;
    viewer.style.display = "none";
    viewerFrame.innerHTML = "";
    viewer.setAttribute("aria-hidden", "true");
  });
}

// -------------------------------
// load PDFs for a program
// -------------------------------
async function loadPDFsForProgram() {
  if (!progSel || !progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f => f.name && f.name.toLowerCase().endsWith(".pdf"));
}

// -------------------------------
// search & filter handlers
// -------------------------------
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    if (!progSel || !progSel.value) {
      showMessage("Please select a program first.", "error");
      return;
    }
    showLoading("Loading PDFs for program...");
    loadedPDFs = await loadPDFsForProgram();
    displayPDFs(loadedPDFs);
  });
}

if (searchNameBtn) {
  searchNameBtn.addEventListener("click", async () => {
    if (!progSel || !progSel.value) {
      showMessage("Please select a program first.", "error");
      return;
    }
    if (!loadedPDFs || loadedPDFs.length === 0) loadedPDFs = await loadPDFsForProgram();
    const q = (searchInput && searchInput.value || "").toLowerCase().trim();
    const filtered = q ? loadedPDFs.filter(f => f.name.toLowerCase().includes(q)) : loadedPDFs;
    displayPDFs(filtered);
  });
}

// -------------------------------
// SC Tools helpers
// -------------------------------
function populateSCSiteSelector(pdfs) {
  if (!scPDFSelect) return;
  scPDFSelect.innerHTML = `<option value="">--Site PDFs--</option>`;
  if (!pdfs || pdfs.length === 0) {
    scPDFSelect.innerHTML = `<option value="">--No PDFs loaded--</option>`;
    return;
  }
  pdfs.forEach(f => {
    const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const opt = document.createElement("option");
    opt.value = rawURL;
    opt.textContent = f.name;
    scPDFSelect.appendChild(opt);
  });
}

if (scToggle && scContent) {
  scToggle.addEventListener("click", () => {
    const isOpen = scContent.style.display === "block";
    scContent.style.display = isOpen ? "none" : "block";
    scContent.setAttribute("aria-hidden", isOpen ? "true" : "false");
  });
}

if (scInsToggle && scInsFull) {
  scInsToggle.addEventListener("click", () => {
    const show = scInsFull.style.display === "block";
    scInsFull.style.display = show ? "none" : "block";
    scInsToggle.textContent = show ? "Show more instructions" : "Hide instructions";
  });
}

if (scOpenAIBtn && scAISelect) {
  scOpenAIBtn.addEventListener("click", () => {
    const ai = scAISelect.value;
    if (!ai) { alert("Please select an AI!"); return; }
    let url = "";
    switch (ai) {
      case "chatgpt": url = "https://chat.openai.com/"; break;
      case "copilot": url = "https://copilot.microsoft.com/"; break;
      case "deepseek": url = "https://deepseek.ai/"; break;
      case "questionai": url = "https://questionai.com/"; break;
      default: url = ""; break;
    }
    if (url) window.open(url, "_blank");
  });
}

if (scOpenPDFBtn) {
  scOpenPDFBtn.addEventListener("click", () => {
    const uploaded = scPDFInput && scPDFInput.files && scPDFInput.files[0];
    const siteUrl = scPDFSelect && scPDFSelect.value;
    if (uploaded) {
      const url = URL.createObjectURL(uploaded);
      window.open(url, "_blank");
      recordRecent(uploaded.name);
      return;
    }
    if (siteUrl) {
      window.open(siteUrl, "_blank");
      const name = scPDFSelect.options[scPDFSelect.selectedIndex].text;
      recordRecent(name);
      return;
    }
    alert("Please choose a site PDF or upload a PDF to open.");
  });
}

// -------------------------------
// record recent
// -------------------------------
function recordRecent(name) {
  if (!name) return;
  if (!recentOpened.includes(name)) recentOpened.unshift(name);
  if (recentOpened.length > 10) recentOpened.pop();
  updateRecentUI();
}

// -------------------------------
// Initialize: load universities on page load
// -------------------------------
(async function init() {
  if (!universitySel) return;
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  showLoading("Loading universities...");
  const universities = await fetchFolder(baseURL);
  if (!universities || universities.length === 0) {
    showMessage("Unable to load universities — check repo, network, or rate limits.", "error");
    return;
  }
  populateDropdown(universitySel, universities);
  pdfList.innerHTML = "";
  updateRecentUI();
})();

// -------------------------------
// Dropdown change handlers
// -------------------------------
if (universitySel) {
  universitySel.addEventListener("change", async () => {
    resetDropdowns(levelSel, semSel, progSel);
    if (!universitySel.value) return;
    showLoading("Loading levels...");
    const levels = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universitySel.value}`);
    populateDropdown(levelSel, levels);
    pdfList.innerHTML = "";
  });
}

if (levelSel) {
  levelSel.addEventListener("change", async () => {
    resetDropdowns(semSel, progSel);
    if (!levelSel.value) return;
    showLoading("Loading semesters...");
    const sems = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelSel.value}`);
    populateDropdown(semSel, sems);
    pdfList.innerHTML = "";
  });
}

if (semSel) {
  semSel.addEventListener("change", async () => {
    resetDropdowns(progSel);
    if (!semSel.value) return;
    showLoading("Loading programs...");
    const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semSel.value}`);
    populateDropdown(progSel, programs);
    pdfList.innerHTML = "";
  });
}

// -------------------------------
// Expose a helper to toggle the page instructions if your button uses inline onclick
// -------------------------------
function toggleInstructions() {
  const box = document.getElementById("instructionsBox");
  if (!box) return;
  box.style.display = box.style.display === "block" ? "none" : "block";
}
// if the page used inline onclick to call window.toggleInstructions
window.toggleInstructions = toggleInstructions;

// -------------------------------
// End of script
// -------------------------------
