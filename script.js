/***********************
 *  CONFIG & DOM refs
 ***********************/
const config = { mode: "single", singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" } };

const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchNameBtn = document.getElementById("searchNameBtn");
const recentPanel = document.getElementById("recentPanel");
const recentList = document.getElementById("recentList");

// SC Tools
const scToggle = document.getElementById("scToggle");
const scContent = document.getElementById("scContent");
const scInsToggle = document.getElementById("scInsToggle");
const scInsFull = document.getElementById("scInsFull");
const scPDFSelect = document.getElementById("scPDF");
const scPDFInput = document.getElementById("scPDFInput");
const scOpenPDFBtn = document.getElementById("scOpenPDF");
const scAISelect = document.getElementById("scAI");
const scOpenAIBtn = document.getElementById("scOpenAI");

let loadedPDFs = [];
let cachedFolders = {};
let recentOpened = [];

/***********************
 * Helper functions
 ***********************/
function showMessage(msg, type="info") {
  const cls = type === "error" ? "msg-error" : (type === "success" ? "msg-success" : "msg-info");
  pdfList.innerHTML = `<div class="${cls}">${msg}</div>`;
}
function showLoading(msg="Loading…") {
  pdfList.innerHTML = `<div style="text-align:center"><div class="loading-spinner"></div><p>${msg}</p></div>`;
}
function updateRecentUI() {
  if (!recentOpened.length) { recentPanel.style.display="none"; return; }
  recentPanel.style.display="block";
  recentList.innerHTML = recentOpened.map(n=>`<li>${n}</li>`).join("");
}

/***********************
 * GitHub fetch + dropdowns
 ***********************/
async function fetchFolder(url, branch=config.singleRepo.branch) {
  const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
  if(cachedFolders[fullUrl]) return cachedFolders[fullUrl];
  try {
    const res = await fetch(fullUrl);
    if(!res.ok) return [];
    const data = await res.json();
    cachedFolders[fullUrl]=data;
    return data;
  } catch(e){ console.error(e); return []; }
}
function populateDropdown(dropdown, items) {
  dropdown.innerHTML = `<option value="">Select ${dropdown.id.charAt(0).toUpperCase()+dropdown.id.slice(1)}</option>`;
  items.forEach(i => {
    if(i.type==="dir") {
      const opt = document.createElement("option");
      opt.value=i.path; opt.textContent=i.name;
      dropdown.appendChild(opt);
    }
  });
  dropdown.disabled=false;
}
function resetDropdowns(...dropdowns){
  dropdowns.forEach(d=>{ d.innerHTML=`<option value="">Select ${d.id.charAt(0).toUpperCase()+d.id.slice(1)}</option>`; d.disabled=true; });
  pdfList.innerHTML=""; loadedPDFs=[];
  populateSCSiteSelector([]);
}

/***********************
 * Display PDFs (main)
 ***********************/
function displayPDFs(pdfs){
  if(!Array.isArray(pdfs) || !pdfs.length){ showMessage("No PDF files found.","error"); populateSCSiteSelector([]); return; }
  pdfList.innerHTML="";
  const adLink="https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";
  pdfs.forEach(f=>{
    const rawURL=`https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div=document.createElement("div"); div.className="pdf-item";
    div.innerHTML=`<a href="${rawURL}" download class="pdf-main-link" data-path="${f.path}">${f.name}</a>`;
    pdfList.appendChild(div);
  });
  document.querySelectorAll(".pdf-main-link").forEach(link=>{
    if(link.dataset.initialized) return;
    link.dataset.initialized="1";
    link.addEventListener("click", ()=> {
      window.open(adLink,"_blank");
      const name=link.textContent;
      if(!recentOpened.includes(name)) recentOpened.unshift(name);
      if(recentOpened.length>10) recentOpened.pop();
      updateRecentUI();
    });
  });
  populateSCSiteSelector(pdfs);
}

/***********************
 * SC Tools: site PDF selector
 ***********************/
function populateSCSiteSelector(pdfs){
  scPDFSelect.innerHTML=`<option value="">--Site PDFs--</option>`;
  if(!pdfs.length){ scPDFSelect.innerHTML=`<option value="">--No PDFs loaded--</option>`; return; }
  pdfs.forEach(f=>{
    const rawURL=`https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const opt=document.createElement("option");
    opt.value=rawURL; opt.textContent=f.name;
    scPDFSelect.appendChild(opt);
  });
}

/***********************
 * Load universities on page load
 ***********************/
(async()=>{
  const baseURL=`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  showLoading("Loading universities...");
  const universities = await fetchFolder(baseURL);
  if(!universities.length){ showMessage("Unable to load universities.","error"); return; }
  populateDropdown(universitySel, universities);
  pdfList.innerHTML="";
})();

/***********************
 * Dropdown events
 ***********************/
universitySel.addEventListener("change", async()=>{
  resetDropdowns(levelSel, semSel, progSel);
  if(!universitySel.value) return;
  showLoading("Loading levels...");
  const levels = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universitySel.value}`);
  populateDropdown(levelSel, levels);
});
levelSel.addEventListener("change", async()=>{
  resetDropdowns(semSel, progSel);
  if(!levelSel.value) return;
  showLoading("Loading semesters...");
  const sems = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelSel.value}`);
  populateDropdown(semSel, sems);
});
semSel.addEventListener("change", async()=>{
  resetDropdowns(progSel);
  if(!semSel.value) return;
  showLoading("Loading programs...");
  const programs = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semSel.value}`);
  populateDropdown(progSel, programs);
});

/***********************
 * Load PDFs for program
 ***********************/
async function loadPDFsForProgram(){
  if(!progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f=>f.name.toLowerCase().endsWith(".pdf"));
}

/***********************
 * Search / filter buttons
 ***********************/
searchBtn.addEventListener("click", async()=>{
  if(!progSel.value){ showMessage("Please select a program first.","error"); return; }
  showLoading("Loading PDFs for program...");
  loadedPDFs = await loadPDFsForProgram();
  displayPDFs(loadedPDFs);
});
searchNameBtn.addEventListener("click", async()=>{
  if(!progSel.value){ showMessage("Please select a program first.","error"); return; }
  if(!loadedPDFs.length) loadedPDFs = await loadPDFsForProgram();
  const q=(searchInput.value||"").toLowerCase().trim();
  const filtered = q ? loadedPDFs.filter(f=>f.name.toLowerCase().includes(q)) : loadedPDFs;
  displayPDFs(filtered);
});

/***********************
 * SC Tools interactions
 ***********************/
scToggle.addEventListener("click", ()=>{
  const isOpen=scContent.style.display==="block";
  scContent.style.display=isOpen?"none":"block";
  scContent.setAttribute("aria-hidden", isOpen?"true":"false");
});
scInsToggle.addEventListener("click", ()=>{
  const show=scInsFull.style.display==="block";
  scInsFull.style.display=show?"none":"block";
  scInsToggle.textContent = show?"Show more instructions":"Hide instructions";
});
scOpenAIBtn.addEventListener("click", ()=>{
  const ai=scAISelect.value; if(!ai){ alert("Please select an AI!"); return; }
  let url="";
  switch(ai){
    case 'chatgpt': url="https://chat.openai.com/"; break;
    case 'copilot': url="https://copilot.microsoft.com/"; break;
    case 'deepseek': url="https://deepseek.ai/"; break;
    case 'questionai': url="https://questionai.com/"; break;
  }
  window.open(url,"_blank");
});
scOpenPDFBtn.addEventListener("click", ()=>{
  const siteUrl=scPDFSelect.value;
  const upload=scPDFInput.files[0];
  if(upload){
    const url=URL.createObjectURL(upload);
    window.open(url,"_blank");
    if(!recentOpened.includes(upload.name)) recentOpened.unshift(upload.name);
    if(recentOpened.length>10) recentOpened.pop();
    updateRecentUI();
    return;
  }
  if(siteUrl){
    window.open(siteUrl,"_blank");
    const name=scPDFSelect.options[scPDFSelect.selectedIndex].text;
    if(!recentOpened.includes(name)) recentOpened.unshift(name);
    if(recentOpened.length>10) recentOpened.pop();
    updateRecentUI();
    return;
  }
  alert("Please choose a site PDF or upload a PDF to open.");
});

updateRecentUI();
