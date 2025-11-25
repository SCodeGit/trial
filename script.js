// --- CONFIGURATION ---
const config = {
  mode: "single",
  singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
};

// --- AI MODE SWITCH ---
let aiMode = false;

// --- DOM ELEMENTS ---
const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const toggleBtn = document.getElementById("toggleAI");

let loadedPDFs = [];

// --- AD LINK ---
const AD_LINK = "https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";

// --- HELPER FUNCTIONS ---
async function fetchFolder(url, branch=config.singleRepo.branch) {
  try {
    const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
    const res = await fetch(fullUrl);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { console.error(e); return []; }
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

// --- LOAD PDFs FROM GITHUB ---
async function loadPDFs() {
  if (!progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

// --- OCR + ChatGPT FUNCTION ---
async function getAIFullAnswer(pdfFile) {
  try {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(pdfFile)).promise;
    let extractedText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

      const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
        logger: m => console.log(m)
      });
      extractedText += text + "\n\n";
    }

    const prompt = `PDF: ${pdfFile.name}\n\nPlease answer all questions in this PDF:\n\n${extractedText.substring(0,3000)}`;
    const chatUrl = `https://chat.openai.com/?system_prompt=${encodeURIComponent(prompt)}`;
    window.open(chatUrl, "_blank");

    return "Opened ChatGPT with extracted PDF text!";
  } catch (err) {
    return "OCR ERROR: " + err.message;
  }
}

// --- DISPLAY PDF LIST ---
function displayPDFs(pdfs) {
  pdfList.innerHTML = "";
  if (pdfs.length === 0) { pdfList.innerHTML = "<p>No PDF files found.</p>"; return; }

  pdfs.forEach(f => {
    const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div = document.createElement("div");
    div.className = "pdf-item";

    if (aiMode) {
      // Use file input for AI OCR mode
      div.innerHTML = `<input type="file" accept="application/pdf" class="solve-btn" data-name="${f.name}" />`;
      const input = div.querySelector("input");
      input.addEventListener("change", async (e) => {
        window.open(AD_LINK, "_blank"); // ad first
        input.disabled = true;
        const answer = await getAIFullAnswer(e.target.files[0]);
        alert(answer);
        input.disabled = false;
      });
    } else {
      div.innerHTML = `<a href="${rawURL}" download>${f.name}</a>`;
    }

    pdfList.appendChild(div);
  });

  // Attach download click event for ads
  if (!aiMode) {
    pdfList.querySelectorAll("a").forEach(link => {
      if (!link.dataset.adAttached) {
        link.dataset.adAttached = "true";
        link.addEventListener("click", () => { window.open(AD_LINK, "_blank"); });
      }
    });
  }
}

// --- INITIALIZE DROPDOWNS ---
(async () => {
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  populateDropdown(universitySel, universities);
})();

// --- DROPDOWN EVENT LISTENERS ---
universitySel.addEventListener("change", async () => { resetDropdowns(levelSel, semSel, progSel); if(!universitySel.value) return; const levels = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universitySel.value}`); populateDropdown(levelSel, levels); });
levelSel.addEventListener("change", async () => { resetDropdowns(semSel, progSel); if(!levelSel.value) return; const sems = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelSel.value}`); populateDropdown(semSel, sems); });
semSel.addEventListener("change", async () => { resetDropdowns(progSel); if(!semSel.value) return; const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semSel.value}`); populateDropdown(progSel, programs); });

// --- SEARCH BUTTON ---
searchBtn.addEventListener("click", async () => {
  loadedPDFs = await loadPDFs();
  displayPDFs(loadedPDFs);
});

// --- AI MODE TOGGLE ---
toggleBtn.addEventListener("click", () => {
  aiMode = !aiMode;
  toggleBtn.textContent = aiMode ? "AI MODE: ON" : "AI MODE: OFF";
  if (loadedPDFs.length) displayPDFs(loadedPDFs);
});
