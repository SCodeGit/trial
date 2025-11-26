// --- CONFIGURATION ---
const config = {
  mode: "single",
  singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
};

// --- DOM Elements ---
const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const viewerContainer = document.getElementById("sc-pdf-viewer");

// --- Floating Viewer Setup ---
function createFloatingViewer() {
  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✖ Close";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "10px";
  closeBtn.style.padding = "6px 12px";
  closeBtn.style.background = "#1e3a8a";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "6px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.zIndex = "10000";
  closeBtn.addEventListener("click", () => {
    viewerContainer.style.display = "none";
    viewerContainer.innerHTML = "";
  });

  viewerContainer.appendChild(closeBtn);
}

// Apply floating styles
viewerContainer.style.position = "fixed";
viewerContainer.style.top = "50px";
viewerContainer.style.right = "20px";
viewerContainer.style.width = "700px";
viewerContainer.style.height = "80vh";
viewerContainer.style.border = "2px solid #1e3a8a";
viewerContainer.style.borderRadius = "10px";
viewerContainer.style.background = "#fff";
viewerContainer.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
viewerContainer.style.display = "none";
viewerContainer.style.zIndex = "9999";
viewerContainer.style.overflow = "hidden";

// --- Utility Functions ---
async function fetchFolder(url, branch = config.singleRepo.branch) {
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
  viewerContainer.style.display = "none";
  viewerContainer.innerHTML = "";
  createFloatingViewer(); // re-add close button
}

async function loadPDFs() {
  if (!progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

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
    div.innerHTML = `<a href="#" data-pdf="${rawURL}">${f.name}</a>`;
    pdfList.appendChild(div);
  });

  pdfList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const pdfURL = link.dataset.pdf;
      viewerContainer.innerHTML = `<iframe src="https://docs.google.com/gview?url=${encodeURIComponent(pdfURL)}&embedded=true" style="width:100%;height:100%;border:none;"></iframe>`;
      viewerContainer.style.display = "block";
      createFloatingViewer(); // ensure close button is there
      viewerContainer.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// --- Dropdown Event Listeners ---
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

// --- Search Button ---
searchBtn.addEventListener("click", async () => {
  const loadedPDFs = await loadPDFs();
  displayPDFs(loadedPDFs);
});

// --- Initialize ---
(async () => {
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  populateDropdown(universitySel, universities);
  createFloatingViewer(); // setup initial close button
})();
