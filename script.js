// --- CONFIGURATION ---
const config = {
  mode: "single",
  singleRepo: {
    owner: "SCodeGit",
    repo: "trial",
    branch: "main"
  }
};

const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const searchNameBtn = document.getElementById("searchNameBtn");
const searchInput = document.getElementById("searchInput");

let loadedPDFs = [];

// --- Helper: fetch folder contents from GitHub API ---
async function fetchFolder(url, branch = config.singleRepo.branch) {
  try {
    const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
    const res = await fetch(fullUrl);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Fetch failed:", e);
    return [];
  }
}

// Populate dropdown with directories or PDFs (for first level)
function populateDropdown(dropdown, items, acceptFiles = false) {
  dropdown.innerHTML = `<option value="">Select ${dropdown.id.charAt(0).toUpperCase() + dropdown.id.slice(1)}</option>`;
  items.forEach(i => {
    if (i.type === "dir" || (acceptFiles && i.type === "file" && i.name.toLowerCase().endsWith(".pdf"))) {
      const opt = document.createElement("option");
      opt.value = i.path;
      opt.textContent = i.name;
      dropdown.appendChild(opt);
    }
  });
  dropdown.disabled = false;
}

// Reset dropdowns and PDF list
function resetDropdowns(...dropdowns) {
  dropdowns.forEach(d => {
    d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
    d.disabled = true;
  });
  pdfList.innerHTML = "";
  loadedPDFs = [];
}

// Display PDFs in the list with propounder
function displayPDFs(pdfs) {
  pdfList.innerHTML = "";
  if (pdfs.length === 0) {
    pdfList.innerHTML = "<p>No PDF files found.</p>";
    return;
  }

  pdfs.forEach(f => {
    const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div = document.createElement("div");
    div.className = "pdf-item";
    div.innerHTML = `<a href="${rawURL}" download>${f.name}</a>`;
    pdfList.appendChild(div);
  });

  // Attach propounder
  pdfList.querySelectorAll("a").forEach(link => {
    if (!link.dataset.propounderAttached) {
      link.dataset.propounderAttached = "true";
      link.addEventListener("click", () => {
        const script = document.createElement("script");
        script.src = "//chapturnjut.com/c4/8b/05/c48b05bd885410431e5f85e8291c9dee.js";
        script.type = "text/javascript";
        document.body.appendChild(script);
      });
    }
  });
}

// Load universities (first dropdown)
(async () => {
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  console.log("Fetched universities:", universities); // debug
  populateDropdown(universitySel, universities, false);
})();

// --- Dropdown event listeners ---
universitySel.addEventListener("change", async () => {
  resetDropdowns(levelSel, semSel, progSel);
  if (!universitySel.value) return;
  const levels = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universitySel.value}`);
  populateDropdown(levelSel, levels);
});

levelSel.addEventListener("change", async () => {
  resetDropdowns(semSel, progSel);
  if (!levelSel.value) return;
  const sems = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelSel.value}`);
  populateDropdown(semSel, sems);
});

semSel.addEventListener("change", async () => {
  resetDropdowns(progSel);
  if (!semSel.value) return;
  const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semSel.value}`);
  populateDropdown(progSel, programs);
});

// Load PDFs from selected program
async function loadPDFs() {
  if (!progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

// Search PDFs by program
searchBtn.addEventListener("click", async () => {
  loadedPDFs = await loadPDFs();
  displayPDFs(loadedPDFs);
});

// Search PDFs by name
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
