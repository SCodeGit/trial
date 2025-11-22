// --- CONFIGURATION ---
const config = {
  mode: "single", // single repo mode
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
const searchInput = document.getElementById("searchInput");
const searchNameBtn = document.getElementById("searchNameBtn");

let loadedPDFs = []; // PDFs from the currently selected program

// Fetch folder contents from GitHub API
async function fetchFolder(url, branch=config.singleRepo.branch) {
  const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
  const res = await fetch(fullUrl);
  if (!res.ok) return [];
  return await res.json();
}

// Populate a dropdown with directories
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

// Reset dropdowns and PDF list
function resetDropdowns(...dropdowns) {
  dropdowns.forEach(d => {
    d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
    d.disabled = true;
  });
  pdfList.innerHTML = "";
  loadedPDFs = [];
}

// Display PDFs in the list
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
}

// Load universities on page load
(async () => {
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  populateDropdown(universitySel, universities);
})();

// Dropdown event listeners
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

// Helper: Load PDFs from currently selected program
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

  // Load PDFs if not already loaded
  if (loadedPDFs.length === 0) loadedPDFs = await loadPDFs();

  const query = searchInput.value.toLowerCase().trim();
  const filtered = query ? loadedPDFs.filter(f => f.name.toLowerCase().includes(query)) : loadedPDFs;
  displayPDFs(filtered);
});
// --- Smartlink Ad Injection for all PDF links ---
(function(){
  const adURL = "https://www.effectivegatecpm.com/supvqwxd?key=a513f5c7792e5f5ac257821e58084750";

  function attachSmartlinkAds() {
    pdfList.querySelectorAll("a").forEach(link => {
      if (!link.dataset.adAttached) {
        link.dataset.adAttached = "true";

        link.addEventListener("pointerdown", () => {
          const win = window.open(adURL, "_blank", "noopener,noreferrer");
        }, { passive: true });
      }
    });
  }

  const originalDisplayPDFs = displayPDFs;
  displayPDFs = (pdfs) => {
    originalDisplayPDFs(pdfs);
    attachSmartlinkAds();
  };
})();
