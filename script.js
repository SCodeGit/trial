// ---------------- CONFIG ----------------
const config = {
  mode: "single",
  singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
};

// ---------------- AI MODE ----------------
let aiMode = false;

// ---------------- DOM ----------------
const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const toggleBtn = document.getElementById("toggleAI");

let loadedPDFs = [];

const AD_LINK = "https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";


// ---------------- FETCH FOLDER ----------------
async function fetchFolder(url, branch=config.singleRepo.branch) {
  try {
    const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
    const res = await fetch(fullUrl);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}


// ---------------- RESET DROPDOWNS ----------------
function resetDropdowns(...dropdowns) {
  dropdowns.forEach(d => {
    d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
    d.disabled = true;
  });

  pdfList.innerHTML = "";
  loadedPDFs = [];
}


// ---------------- POPULATE DROPDOWN ----------------
function populateDropdown(dropdown, items) {
  items.forEach(i => {
    if (i.type === "dir") {
      const opt = document.createElement("option");
      opt.value = i.path;
      opt.textContent = i.name;
      dropdown.appendChild(opt);
    }
  });

  dropdown.disabled = true;
  dropdown.disabled = false;
}


// ---------------- LOAD PDFs ----------------
async function loadPDFs() {
  if (!progSel.value) return [];
  const files = await fetchFolder(
    `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`
  );
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}


// ---------------- OCR + CHATGPT ----------------
async function getAIFullAnswer(rawPdfUrl, fileName) {
  try {
    // 1. Load PDF as bytes
    const pdfBytes = await fetch(rawPdfUrl).then(r => r.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

    let extractedText = "";

    // 2. OCR each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: canvas.getContext("2d"),
        viewport: viewport
      }).promise;

      const ocr = await Tesseract.recognize(canvas, "eng");
      extractedText += ocr.data.text + "\n\n";
    }

    // 3. Prefilled ChatGPT URL
    const prompt = `Extracted questions from ${fileName}:\n\n${extractedText.substring(0, 3000)}\n\nPlease answer all questions in detail.`;

    const chatUrl = `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
    window.open(chatUrl, "_blank");

    return "Opened ChatGPT!";
  } catch (err) {
    return "OCR ERROR: " + err.message;
  }
}


// ---------------- DISPLAY PDFs ----------------
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

    if (!aiMode) {
      // NORMAL DOWNLOAD MODE
      div.innerHTML = `<a href="${rawURL}" download>${f.name}</a>`;
    } else {
      // AI MODE
      div.innerHTML = `<button class="solve-btn" data-url="${rawURL}" data-name="${f.name}">Solve with AI</button>`;
    }

    pdfList.appendChild(div);
  });

  // --- event handlers ---
  if (!aiMode) {
    pdfList.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => window.open(AD_LINK, "_blank"));
    });
  } else {
    pdfList.querySelectorAll(".solve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        window.open(AD_LINK, "_blank");

        btn.textContent = "Scanning PDF...";
        const rawUrl = btn.dataset.url;
        const name = btn.dataset.name;

        const result = await getAIFullAnswer(rawUrl, name);
        btn.textContent = name;

        alert(result);
      });
    });
  }
}


// ---------------- INITIAL LOAD ----------------
(async () => {
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  populateDropdown(universitySel, universities);
})();


// ---------------- DROPDOWN EVENTS ----------------
universitySel.addEventListener("change", async () => {
  resetDropdowns(levelSel, semSel, progSel);
  if (!universitySel.value) return;

  const levels = await fetchFolder(
    `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universitySel.value}`
  );
  populateDropdown(levelSel, levels);
});

levelSel.addEventListener("change", async () => {
  resetDropdowns(semSel, progSel);
  if (!levelSel.value) return;

  const sems = await fetchFolder(
    `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelSel.value}`
  );
  populateDropdown(semSel, sems);
});

semSel.addEventListener("change", async () => {
  resetDropdowns(progSel);
  if (!semSel.value) return;

  const programs = await fetchFolder(
    `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semSel.value}`
  );
  populateDropdown(progSel, programs);
});


// ---------------- SEARCH BUTTON ----------------
searchBtn.addEventListener("click", async () => {
  loadedPDFs = await loadPDFs();
  displayPDFs(loadedPDFs);
});


// ---------------- AI MODE TOGGLE ----------------
toggleBtn.addEventListener("click", () => {
  aiMode = !aiMode;
  toggleBtn.textContent = aiMode ? "AI MODE: ON" : "AI MODE: OFF";

  if (loadedPDFs.length) displayPDFs(loadedPDFs);
});
