<script>
document.addEventListener("DOMContentLoaded", () => {
  // ---------------- CONFIG ----------------
  const config = {
    mode: "single",
    singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
  };

  // ---------------- AI MODE ----------------
  let aiMode = false;
  let busy = false; // prevent concurrent OCR

  // ---------------- DOM ----------------
  const universitySel = document.getElementById("university");
  const levelSel = document.getElementById("level");
  const semSel = document.getElementById("semester");
  const progSel = document.getElementById("program");
  const pdfList = document.getElementById("pdf-list");
  const searchBtn = document.getElementById("searchBtn");
  const aiFloat = document.getElementById("ai-float");
  const aiBadge = document.getElementById("ai-badge");
  const aiAnswerBox = document.getElementById("ai-answer-box");
  const aiAnswerTitle = document.getElementById("ai-answer-title");
  const aiAnswerContent = document.getElementById("ai-answer-content");
  const aiLoader = document.getElementById("ai-loader");

  let loadedPDFs = [];
  const AD_LINK = "https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";

  // ---------------- HELPERS ----------------
  const fetchFolder = async (url, branch = config.singleRepo.branch) => {
    try {
      const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
      const res = await fetch(fullUrl);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const resetDropdowns = (...dropdowns) => {
    dropdowns.forEach(d => {
      d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
      d.disabled = true;
    });
    pdfList.innerHTML = "";
    loadedPDFs = [];
    hideAIAnswer();
  };

  const populateDropdown = (dropdown, items) => {
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
  };

  const showAIAnswer = (title, content) => {
    aiAnswerBox.style.display = "block";
    aiAnswerTitle.textContent = title;
    aiAnswerContent.textContent = content;
  };

  const hideAIAnswer = () => {
    aiAnswerBox.style.display = "none";
    aiAnswerTitle.textContent = "AI Answer";
    aiAnswerContent.textContent = "";
  };

  const setLoader = visible => {
    aiLoader.style.display = visible ? "block" : "none";
  };

  // ---------------- LOAD PDFs ----------------
  const loadPDFs = async () => {
    if (!progSel.value) return [];
    const files = await fetchFolder(
      `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`
    );
    return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
  };

  // ---------------- OCR + CHATGPT ----------------
  const getAIFullAnswer = async (rawPdfUrl, fileName) => {
    if (busy) return "Already scanning - please wait.";
    busy = true;
    setLoader(true);
    showAIAnswer(`Scanning: ${fileName}`, "Downloading PDF and performing OCR. Please wait...");

    try {
      const arrayBuffer = await fetch(rawPdfUrl).then(r => {
        if (!r.ok) throw new Error("Failed to fetch PDF");
        return r.arrayBuffer();
      });

      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";

      for (let p = 1; p <= pdfDoc.numPages; p++) {
        showAIAnswer(`Scanning: ${fileName}`, `OCR page ${p} / ${pdfDoc.numPages}...`);
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

        const res = await Tesseract.recognize(canvas, 'eng');
        extractedText += `\n\n--- PAGE ${p} ---\n\n${res.data.text}`;
      }

      const TRUNC = 2500;
      const excerpt = extractedText.length > TRUNC ? extractedText.substring(0, TRUNC) + "\n\n...[truncated]" : extractedText;
      const prompt = `Source file: ${fileName}\n\nExtracted text (first ${TRUNC} chars):\n\n${excerpt}\n\nPlease answer the questions found in this text with full, step-by-step solutions.`;

      const chatUrl = `https://chat.openai.com/?system_prompt=${encodeURIComponent(prompt)}`;
      window.open(chatUrl, "_blank");

      showAIAnswer(`Done — ${fileName}`, "ChatGPT opened in a new tab with the extracted text. Paste if necessary.");
      return "Opened ChatGPT!";
    } catch (err) {
      showAIAnswer("OCR ERROR", err.message || err);
      return "OCR ERROR: " + (err.message || err);
    } finally {
      busy = false;
      setLoader(false);
    }
  };

  // ---------------- DISPLAY PDFs ----------------
  const displayPDFs = (pdfs) => {
    pdfList.innerHTML = "";
    hideAIAnswer();

    if (!pdfs || pdfs.length === 0) {
      pdfList.innerHTML = "<p>No PDF files found.</p>";
      return;
    }

    pdfs.forEach(f => {
      const rawURL = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
      const div = document.createElement("div");
      div.className = "pdf-item";

      if (!aiMode) {
        div.innerHTML = `<a href="${rawURL}" download>${f.name}</a>`;
      } else {
        div.innerHTML = `<button class="solve-btn" data-url="${rawURL}" data-name="${f.name}">Solve with AI — ${f.name}</button>`;
      }

      pdfList.appendChild(div);
    });

    if (!aiMode) {
      pdfList.querySelectorAll("a").forEach(link => {
        if (!link.dataset.adAttached) {
          link.dataset.adAttached = "true";
          link.addEventListener("click", () => window.open(AD_LINK, "_blank"));
        }
      });
    } else {
      pdfList.querySelectorAll(".solve-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (busy) return;
          window.open(AD_LINK, "_blank");

          const raw = btn.dataset.url;
          const name = btn.dataset.name;
          btn.textContent = "Scanning PDF…";
          btn.disabled = true;

          await getAIFullAnswer(raw, name);

          btn.textContent = `Solve with AI — ${name}`;
          btn.disabled = false;
        });
      });
    }
  };

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

  // ---------------- SEARCH BUTTON ----------------
  searchBtn.addEventListener("click", async () => {
    loadedPDFs = await loadPDFs();
    displayPDFs(loadedPDFs);
  });

  // ---------------- AI FLOAT TOGGLE ----------------
  const updateAIBadge = () => {
    if (aiMode) {
      aiFloat.classList.remove("off");
      aiBadge.textContent = "ON";
      aiBadge.style.color = "var(--ai-blue)";
    } else {
      aiFloat.classList.add("off");
      aiBadge.textContent = "OFF";
      aiBadge.style.color = "#7a7f89";
    }
  };

  aiFloat.addEventListener("click", () => {
    aiMode = !aiMode;
    updateAIBadge();
    hideAIAnswer();
    if (loadedPDFs.length) displayPDFs(loadedPDFs);
  });

  updateAIBadge();

});
</script>
