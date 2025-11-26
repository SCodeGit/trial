// --- CONFIGURATION ---
const config = {
  mode: "single",
  singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
};

// --- DOM Elements - Main ---
const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

// --- DOM Elements - SC Tools Hub ---
const scToggle = document.getElementById("scToggle");
const scContent = document.getElementById("scContent");
const scUniversity = document.getElementById("scUniversity");
const scLevel = document.getElementById("scLevel");
const scSemester = document.getElementById("scSemester");
const scProgram = document.getElementById("scProgram");
const scPdfList = document.getElementById("scPdfList");
const scSearchInput = document.getElementById("scSearchInput");
const scSearchBtn = document.getElementById("scSearchBtn");
const scPdfViewer = document.getElementById("scPdfViewer");

// --- Floating viewer styles for SC ---
scPdfViewer.style.position = "relative";
scPdfViewer.style.width = "100%";
scPdfViewer.style.height = "300px";
scPdfViewer.style.border = "2px solid #1e3a8a";
scPdfViewer.style.borderRadius = "6px";
scPdfViewer.style.marginTop = "10px";

// --- UTILITIES ---
async function fetchFolder(url, branch = config.singleRepo.branch) {
  const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
  const res = await fetch(fullUrl);
  if (!res.ok) return [];
  return await res.json();
}

function populateDropdown(dropdown, items) {
  items.forEach(i => {
    if(i.type === "dir"){
      const opt = document.createElement("option");
      opt.value = i.path;
      opt.textContent = i.name;
      dropdown.appendChild(opt);
    }
  });
  dropdown.disabled = false;
}

function resetDropdowns(...dropdowns){
  dropdowns.forEach(d => {
    d.innerHTML = `<option value="">Select ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</option>`;
    d.disabled = true;
  });
}

// --- DISPLAY PDFs ---
function displayPDFs(targetList, pdfs, main = true){
  targetList.innerHTML = "";
  if(pdfs.length === 0){ targetList.innerHTML = "<p>No PDFs found.</p>"; return; }

  pdfs.forEach(f => {
    const url = `https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div = document.createElement("div");
    div.className = "pdf-item";
    if(main){
      div.innerHTML = `<a href="#" data-pdf="${url}">${f.name}</a>`;
      div.querySelector("a").addEventListener("click", e=>{
        e.preventDefault();
        const adLink = "https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";
        window.open(adLink,"_blank");
        window.open(url,"_blank");
      });
    } else {
      div.innerHTML = `<a href="#" data-pdf="${url}">${f.name}</a>`;
      div.querySelector("a").addEventListener("click", e=>{
        e.preventDefault();
        scPdfViewer.innerHTML = `<iframe src="https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true" style="width:100%;height:100%;border:none;"></iframe>`;
      });
    }
    targetList.appendChild(div);
  });
}

// --- LOAD PDFs ---
async function loadPDFsFromFolder(folder){
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${folder}`);
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

// --- SEARCH FUNCTION ---
async function searchPDFs(baseDropdown, searchText){
  let allPDFs = [];
  if(baseDropdown.value){
    const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${baseDropdown.value}`);
    for(const p of programs){
      if(p.type === "dir"){
        const pdfs = await loadPDFsFromFolder(p.path);
        allPDFs.push(...pdfs);
      }
    }
  } else {
    const universities = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`);
    for(const uni of universities){
      if(uni.type === "dir"){
        const levels = await fetchFolder(uni.url);
        for(const lvl of levels){
          if(lvl.type === "dir"){
            const semesters = await fetchFolder(lvl.url);
            for(const sem of semesters){
              if(sem.type === "dir"){
                const programs = await fetchFolder(sem.url);
                for(const prog of programs){
                  if(prog.type === "dir"){
                    const pdfs = await loadPDFsFromFolder(prog.path);
                    allPDFs.push(...pdfs);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if(searchText){
    allPDFs = allPDFs.filter(f => f.name.toLowerCase().includes(searchText.toLowerCase()));
  }
  return allPDFs;
}

// --- DROPDOWN LOGIC ---
async function initDropdowns(universityD, levelD, semesterD, programD){
  const baseURL = `https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities = await fetchFolder(baseURL);
  populateDropdown(universityD, universities);

  universityD.addEventListener("change", async ()=>{
    resetDropdowns(levelD, semesterD, programD);
    if(!universityD.value) return;
    const levels = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universityD.value}`);
    populateDropdown(levelD, levels);
  });

  levelD.addEventListener("change", async ()=>{
    resetDropdowns(semesterD, programD);
    if(!levelD.value) return;
    const semesters = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelD.value}`);
    populateDropdown(semesterD, semesters);
  });

  semesterD.addEventListener("change", async ()=>{
    resetDropdowns(programD);
    if(!semesterD.value) return;
    const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semesterD.value}`);
    populateDropdown(programD, programs);
  });
}

// --- INITIALIZE ---
(async()=>{
  initDropdowns(universitySel, levelSel, semSel, progSel);
  initDropdowns(scUniversity, scLevel, scSemester, scProgram);
})();

// --- SEARCH BUTTONS ---
searchBtn.addEventListener("click", async ()=>{
  const text = searchInput.value.trim();
  const results = await searchPDFs(semSel, text);
  displayPDFs(pdfList, results, true);
});

scSearchBtn.addEventListener("click", async ()=>{
  const text = scSearchInput.value.trim();
  const results = await searchPDFs(scSemester, text);
  displayPDFs(scPdfList, results, false);
});

// --- Instructions toggle ---
function toggleInstructions(){
  const box = document.getElementById("instructionsBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
}

// --- SC Tools toggle ---
scToggle.addEventListener("click", ()=>{
  scContent.style.display = scContent.style.display === "block" ? "none" : "block";
});

// --- Theme toggle ---
(function(){
  const btn = document.getElementById('theme-toggle');
  const body = document.body;
  try{
    const saved = localStorage.getItem('theme');
    if(saved === 'dark'){ body.setAttribute('data-theme','dark'); btn.textContent='🌙'; } 
    else { body.removeAttribute('data-theme'); btn.textContent='☀️'; }
  }catch(e){}

  btn.addEventListener('click', ()=>{
    if(body.hasAttribute('data-theme')){
      body.removeAttribute('data-theme'); btn.textContent='☀️'; localStorage.setItem('theme','light');
    } else {
      body.setAttribute('data-theme','dark'); btn.textContent='🌙'; localStorage.setItem('theme','dark');
    }
  });
})();

// --- Draggable SC Tools Hub ---
let isDragging = false, dragOffsetX=0, dragOffsetY=0;
scToggle.addEventListener('mousedown', e=>{
  isDragging = true;
  dragOffsetX = e.clientX - scContent.getBoundingClientRect().left;
  dragOffsetY = e.clientY - scContent.getBoundingClientRect().top;
  document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', e=>{
  if(isDragging){
    scContent.style.position='fixed';
    scContent.style.left=(e.clientX - dragOffsetX)+'px';
    scContent.style.top=(e.clientY - dragOffsetY)+'px';
    scContent.style.zIndex='10000';
  }
});
document.addEventListener('mouseup', e=>{
  isDragging = false;
  document.body.style.userSelect = '';
});
