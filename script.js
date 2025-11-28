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

/* ---------------- Main GitHub PDF dropdowns */
const config = { mode: "single", singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" } };
const uni = document.getElementById("university");
const lvl = document.getElementById("level");
const sem = document.getElementById("semester");
const prog = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
let loadedPDFs = [];

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

/* ---------------- Dynamic Ad Script Injection ---------------- */
function injectAdScript() {
    const adScript = document.createElement("script");
    adScript.src = "https://intelligent-comfortable.com/bq3.VC0OPj3YpivKbMm_VaJAZ/DO0i2ZNezsE/xqNpjcgk4cLlT/Yh3/MMTcEs2OOCDFk";
    adScript.async = true;
    document.body.appendChild(adScript);
}

injectAdScript();
