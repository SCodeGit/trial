// --- CONFIGURATION ---
const config = {
  mode: "single",
  singleRepo: {
    owner: "SCodeGit",
    repo: "trial",
    branch: "main"
  }
};

// --- YOUR OPENROUTER API KEY ---
const OPENROUTER_KEY = "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";

// --- AI MODE SWITCH (DEFAULT: OFF) ---
let aiMode = false;

// Toggle button handler (YOU WILL ADD BUTTON IN HTML LATER)
document.addEventListener("click", e => {
  if (e.target.id === "toggleAI") {
    aiMode = !aiMode;
    e.target.textContent = aiMode ? "AI MODE: ON" : "AI MODE: OFF";
  }
});

// --- AI FUNCTION: GET FULL ANSWER ---
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (err) {
    return "AI ERROR: " + err.message;
  }
}

// ---------------------------------------------------------------------------
// YOUR ORIGINAL CODE (UNCHANGED)
// ---------------------------------------------------------------------------

const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchNameBtn = document.getElementById("searchNameBtn");

let loadedPDFs = [];

async function fetchFolder(url, branch=config.singleRepo.branch) {
  const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
  const res = await fetch(fullUrl);
  if (!res.ok) return [];
  return await res.json();
}

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

function resetDropdowns(...dropdowns) {
  dropdowns.forEach(d => {
    d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
    d.disabled = true;
  });
  pdfList.innerHTML = "";
  loadedPDFs = [];
}

function displayPDFs(pdfs) {
  pdfList.innerHTML = "";
  if (pdfs.length === 0) {
    pdfList.innerHTML = "<p>No PDF files found.</p>";
    return;
  }

  const adLink = "https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";

  pdfs.forEach(f => {
    const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div = document.createElement("div");
    div.className = "pdf-item";

    // if AI mode → no download, instead show "Solve"
    if (aiMode) {
      div.innerHTML = `<button class="solve-btn" data-name="${f.name}">${f.name}</button>`;
    } else {
      div.innerHTML = `<a href="${rawURL}" download>${f.name}</a>`;
    }

    pdfList.appendChild(div);
  });

  // CLICK HANDLING
  if (!aiMode) {
    // DOWNLOAD MODE
    pdfList.querySelectorAll("a").forEach(link => {
      if (!link.dataset.adAttached) {
        link.dataset.adAttached = "true";
        link.addEventListener("click", () => {
          window.open(adLink, "_blank");
        });
      }
    });
  } else {
    // AI SOLVE MODE
    pdfList.querySelectorAll(".solve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        window.open(adLink, "_blank"); // ad first

        btn.textContent = "Solving...";
        const result = await getAIFullAnswer(btn.dataset.name);

        // Show answer in popup
        alert(result);
        btn.textContent = btn.dataset.name;
      });
    });
  }
}

// --- Load universities
(async () => {
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  populateDropdown(universitySel, universities);
})();

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

async function loadPDFs() {
  if (!progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

searchBtn.addEventListener("click", async () => {
  loadedPDFs = await loadPDFs();
  displayPDFs(loadedPDFs);
});

searchNameBtn.addEventListener("click", async () => {
  if (!progSel.value) {
    alert("Please select a program first!");
    return;
  }
  if (loadedPDFs.length === 0) loadedPDFs = await loadPDFs();

  const query = searchInput.value.toLowerCase().trim();
  const filtered = query ? loadedPDFs.filter(f => f.name.toLowerCase().includes(query)) : loadedPDFs;
  displayPDFs(filtered);
});
