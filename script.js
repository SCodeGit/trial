// --- CONFIGURATION ---
const config = {
  mode: "single",
  singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
};

// --- AI MODE ---
let aiMode = false;

// --- ORIGINAL DROPDOWN + DOWNLOAD SYSTEM ---
const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");

let loadedPDFs = [];

// --- AI FUNCTION: Get Full Answer via Cloudflare Worker ---
async function getAIFullAnswer(pdfName) {
  try {
    const prompt = `
You are solving an exam question from a past paper.
Give a FULL, DETAILED answer for the question based ONLY on the filename:

Filename: ${pdfName}

Provide:
- full solved answer
- explanations
- examples
- step-by-step where needed
    `;

    const response = await fetch('https://scode-colleges-of-education.kimbon226.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt })
    });

    const data = await response.json();
    return data?.generated_text || "No answer returned";
  } catch (err) {
    return 'AI ERROR: ' + err.message;
  }
}

// --- Fetch GitHub folder ---
async function fetchFolder(url, branch=config.singleRepo.branch) {
  const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
  const res = await fetch(fullUrl);
  if (!res.ok) return [];
  return await res.json();
}

// --- Populate dropdown ---
function populateDropdown(dropdown, items) {
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

// --- Reset dropdowns ---
function resetDropdowns(...dropdowns) {
  dropdowns.forEach(d => {
    d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
    d.disabled = true;
  });
  pdfList.innerHTML = "";
  loadedPDFs = [];
}

// --- Display PDFs ---
function displayPDFs(pdfs) {
  pdfList.innerHTML = "";
  if (pdfs.length === 0) { pdfList.innerHTML = "<p>No PDF files found.</p>"; return; }
  const adLink = "https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";

  pdfs.forEach(f => {
    const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div = document.createElement("div");
    div.className = "pdf-item";

    if (aiMode) {
      div.innerHTML = `<button class="solve-btn" data-name="${f.name}">${f.name}</button>`;
    } else {
      div.innerHTML = `<a href="${rawURL}" download>${f.name}</a>`;
    }
    pdfList.appendChild(div);
  });

  // Attach click events
  if (!aiMode) {
    pdfList.querySelectorAll("a").forEach(link => {
      if (!link.dataset.adAttached) {
        link.dataset.adAttached = "true";
        link.addEventListener("click", () => { window.open(adLink, "_blank"); });
      }
    });
  } else {
    pdfList.querySelectorAll(".solve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        window.open(adLink, "_blank"); // ad first
        btn.textContent = "Solving...";
        const answer = await getAIFullAnswer(btn.dataset.name);
        alert(answer);
        btn.textContent = btn.dataset.name;
      });
    });
  }
}

// --- Load universities ---
(async () => {
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  populateDropdown(universitySel, universities);
})();

// --- Dropdown listeners ---
universitySel.addEventListener("change", async () => {
  resetDropdowns(levelSel, semSel, progSel);
  if(!universitySel.value) return;
  const levels = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universitySel.value}`);
  populateDropdown(levelSel, levels);
});

levelSel.addEventListener("change", async () => {
  resetDropdowns(semSel, progSel);
  if(!levelSel.value) return;
  const sems = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelSel.value}`);
  populateDropdown(semSel, sems);
});

semSel.addEventListener("change", async () => {
  resetDropdowns(progSel);
  if(!semSel.value) return;
  const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semSel.value}`);
  populateDropdown(progSel, programs);
});

// --- Load PDFs ---
async function loadPDFs() {
  if (!progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

// --- Search button ---
searchBtn.addEventListener("click", async () => {
  loadedPDFs = await loadPDFs();
  displayPDFs(loadedPDFs);
});

// --- AI Mode Toggle Button ---
document.getElementById('toggleAI').addEventListener('click', async () => {
  aiMode = !aiMode;
  document.getElementById('toggleAI').textContent = aiMode ? "AI MODE: ON" : "AI MODE: OFF";
  // Refresh PDF list to show buttons/links correctly
  displayPDFs(loadedPDFs);
});
