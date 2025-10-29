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

let loadedPDFs = []; // Store fetched PDFs

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
}

// Load universities
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

// Program PDF search
searchBtn.addEventListener("click", async () => {
  pdfList.innerHTML = "";
  loadedPDFs = [];
  if (!progSel.value) {
    alert("Please select a program to search PDFs.");
    return;
  }
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  loadedPDFs = files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
  displayPDFs(loadedPDFs);
});

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

// Name search filter
searchNameBtn.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return displayPDFs(loadedPDFs);
  const filtered = loadedPDFs.filter(f => f.name.toLowerCase().includes(query));
  displayPDFs(filtered);
});
