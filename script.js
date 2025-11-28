/* ---------------- Theme toggle */
const body = document.body;
const themeBtn = document.getElementById("theme-toggle");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && systemPrefersDark)) {
    body.setAttribute("data-theme", "dark");
    themeBtn.textContent = '🌙';
} else {
    body.removeAttribute("data-theme");
    themeBtn.textContent = '☀️';
}

themeBtn.addEventListener("click", () => {
    if (body.getAttribute("data-theme") === "dark") {
        body.removeAttribute("data-theme");
        themeBtn.textContent = '☀️';
        localStorage.setItem("theme", "light");
    } else {
        body.setAttribute("data-theme", "dark");
        themeBtn.textContent = '🌙';
        localStorage.setItem("theme", "dark");
    }
});

/* ---------------- Instructions toggle */
function toggleInstructions() {
    const box = document.getElementById("instructionsBox");
    box.style.display = box.style.display === "block" ? "none" : "block";
}

/* ---------------- SC Tools Hub draggable (mouse + touch) */
const hub = document.getElementById("scToolsHub");
const toggle = document.getElementById("scToggle");
const content = document.getElementById("scContent");
toggle.addEventListener("click", () => { 
    content.style.display = content.style.display === "block" ? "none" : "block"; 
});

let isDragging = false, offsetX = 0, offsetY = 0;

function dragStart(e) {
    isDragging = true;
    if (e.type === "touchstart") {
        offsetX = e.touches[0].clientX - hub.offsetLeft;
        offsetY = e.touches[0].clientY - hub.offsetTop;
    } else {
        offsetX = e.clientX - hub.offsetLeft;
        offsetY = e.clientY - hub.offsetTop;
    }
}
function dragMove(e) {
    if (!isDragging) return;
    let x = 0, y = 0;
    if (e.type === "touchmove") {
        x = e.touches[0].clientX - offsetX;
        y = e.touches[0].clientY - offsetY;
    } else {
        x = e.clientX - offsetX;
        y = e.clientY - offsetY;
    }
    hub.style.left = x + "px";
    hub.style.top = y + "px";
}
function dragEnd() { isDragging = false; }

toggle.addEventListener("mousedown", dragStart);
toggle.addEventListener("touchstart", dragStart);
document.addEventListener("mousemove", dragMove);
document.addEventListener("touchmove", dragMove);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("touchend", dragEnd);

/* ---------------- Main GitHub PDF dropdowns */
const config = { mode: "single", singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" } };
const uni = document.getElementById("university");
const lvl = document.getElementById("level");
const sem = document.getElementById("semester");
const prog = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const scPDF = document.getElementById("scPDF");
let loadedPDFs = [], cachedFolders = [];

function showMessage(msg) { pdfList.innerHTML = `<div>${msg}</div>`; }

function populateDropdown(dropdown, items) {
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
        d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
        d.disabled = true;
    });
    pdfList.innerHTML = "";
    loadedPDFs = [];
    scPDF.innerHTML = `<option value="">--No PDFs loaded--</option>`;
}

async function fetchFolder(url, branch = config.singleRepo.branch) {
    const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
    try {
        const res = await fetch(fullUrl);
        if (!res.ok) return [];
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function loadPDFsForProgram() {
    if (!prog.value) return [];
    const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${prog.value}`);
    return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

function displayPDFs(pdfs) {
    if (!pdfs.length) {
        showMessage("No PDF files found.");
        scPDF.innerHTML = `<option value="">--No PDFs loaded--</option>`;
        return;
    }
    pdfList.innerHTML = "";
    loadedPDFs = pdfs;
    pdfs.forEach(f => {
        const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
        const div = document.createElement("div");
        div.innerHTML = `<a href="${rawURL}" target="_blank" data-path="${f.path}">${f.name}</a>`;
        pdfList.appendChild(div);
    });
    populateSCSiteSelector(pdfs);
}

function populateSCSiteSelector(pdfs) {
    scPDF.innerHTML = `<option value="">--Site PDFs--</option>`;
    if (!pdfs.length) {
        scPDF.innerHTML = `<option value="">--No PDFs loaded--</option>`;
        return;
    }
    pdfs.forEach(f => {
        const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
        const opt = document.createElement("option"); 
        opt.value = rawURL; 
        opt.textContent = f.name;
        scPDF.appendChild(opt);
    });
}

/* Load universities on page load */
(async () => {
    const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
    const universities = await fetchFolder(baseURL);
    populateDropdown(uni, universities);
})();

/* Dropdown events */
uni.addEventListener("change", async () => {
    resetDropdowns(lvl, sem, prog);
    if (!uni.value) return;
    const levels = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${uni.value}`);
    populateDropdown(lvl, levels);
});

lvl.addEventListener("change", async () => {
    resetDropdowns(sem, prog);
    if (!lvl.value) return;
    const sems = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${lvl.value}`);
    populateDropdown(sem, sems);
});

sem.addEventListener("change", async () => {
    resetDropdowns(prog);
    if (!sem.value) return;
    const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${sem.value}`);
    populateDropdown(prog, programs);
});

document.getElementById("searchBtn").addEventListener("click", async () => {
    if (!prog.value) { showMessage("Please select a program first."); return; }
    const files = await loadPDFsForProgram();
    displayPDFs(files);
});

/* SC Tools buttons */
document.getElementById("scOpenAI").addEventListener("click", () => {
    const ai = document.getElementById("scAI").value;
    if (!ai) { alert("Select AI"); return; }
    let url = "";
    switch (ai) {
        case "chatgpt": url = "https://chat.openai.com/"; break;
        case "copilot": url = "https://copilot.microsoft.com/"; break;
        case "deepseek": url = "https://deepseek.ai/"; break;
        case "questionai": url = "https://questionai.com/"; break;
    }
    window.open(url, "_blank");
});

document.getElementById("scOpenPDF").addEventListener("click", () => {
    const sel = scPDF.value;
    const up = document.getElementById("scPDFInput").files[0];
    if (up) { const url = URL.createObjectURL(up); window.open(url, "_blank"); return; }
    if (sel) { window.open(sel, "_blank"); return; }
    alert("Select PDF or upload one!");
});

/* ---------------- Dynamic Ad Script Injection ---------------- */
function injectAdScript() {
    const adScript = document.createElement("script");
    adScript.src = "https://intelligent-comfortable.com/bq3.VC0OPj3YpivKbMm_VaJAZ/DO0i2ZNezsE/xqNpjcgk4cLlT/Yh3/MMTcEs2OOCDFkq";
    adScript.async = true;
    document.body.appendChild(adScript);
}

// Optional: inject ad on page load
injectAdScript();
