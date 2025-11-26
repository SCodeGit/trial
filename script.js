/**************
 * CONFIG & DOM
 **************/
const config = { mode:"single", singleRepo:{ owner:"SCodeGit", repo:"trial", branch:"main" } };
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
const scPDFSelect = document.getElementById("scPDF");
const scPDFInput = document.getElementById("scPDFInput");
const scAISelect = document.getElementById("scAI");
const scOpenPDFBtn = document.getElementById("scOpenPDF");
const scOpenAIBtn = document.getElementById("scOpenAI");

let loadedPDFs = [];
let cachedFolders = {};
let recentOpened = [];

/**************
 * THEME toggle unified
 **************/
const themeBtn = document.getElementById("theme-toggle");
function setTheme(theme){
  document.body.setAttribute("data-theme", theme);
  themeBtn.textContent = theme==="dark"?"🌙":"☀️";
}
themeBtn.addEventListener("click", ()=>{
  const cur = document.body.getAttribute("data-theme")==="dark"?"light":"dark";
  setTheme(cur);
});

/**************
 * Helper
 **************/
function updateRecentUI(){
  if(!recentOpened.length){ recentPanel.style.display="none"; return; }
  recentPanel.style.display="block";
  recentList.innerHTML = recentOpened.map(n=>`<li>${n}</li>`).join("");
}
function showMessage(msg){ pdfList.innerHTML=`<div style="color:red">${msg}</div>`; }
function showLoading(msg="Loading…"){ pdfList.innerHTML=`<div style="text-align:center">${msg}</div>`; }

/**************
 * Fetch + Dropdowns
 **************/
async function fetchFolder(url){ 
  if(cachedFolders[url]) return cachedFolders[url];
  const res = await fetch(url); 
  const data = await res.json();
  cachedFolders[url]=data;
  return data;
}
function populateDropdown(dropdown, items){
  dropdown.innerHTML=`<option value="">Select ${dropdown.id.charAt(0).toUpperCase()+dropdown.id.slice(1)}</option>`;
  items.forEach(i=>{ if(i.type==="dir") dropdown.appendChild(new Option(i.name,i.path)); });
  dropdown.disabled=false;
}
function resetDropdowns(...dropdowns){ dropdowns.forEach(d=>{ d.innerHTML=`<option value="">Select ${d.id.charAt(0).toUpperCase()+d.id.slice(1)}</option>`; d.disabled=true; }); pdfList.innerHTML=""; loadedPDFs=[]; scPDFSelect.innerHTML=`<option>--No PDFs loaded--</option>`;}

/**************
 * Display PDFs
 **************/
function displayPDFs(pdfs){
  pdfList.innerHTML="";
  if(!pdfs.length){ showMessage("No PDFs found."); return; }
  pdfs.forEach(f=>{
    const url=`https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const a=document.createElement("a");
    a.href=url; a.download=f.name; a.textContent=f.name; a.className="pdf-main-link";
    a.addEventListener("click", ()=>{
      if(!recentOpened.includes(f.name)) recentOpened.unshift(f.name);
      if(recentOpened.length>10) recentOpened.pop();
      updateRecentUI();
    });
    pdfList.appendChild(a);
  });
  // populate SC Tools selector
  scPDFSelect.innerHTML=`<option value="">--Site PDFs--</option>`;
  pdfs.forEach(f=>{ scPDFSelect.appendChild(new Option(f.name,`https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`)); });
}

/**************
 * Load PDFs
 **************/
async function loadPDFsForProgram(){ 
  if(!progSel.value) return [];
  const files = await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f=>f.name.toLowerCase().endsWith(".pdf"));
}

/**************
 * Events
 **************/
searchBtn.addEventListener("click", async()=>{
  if(!progSel.value){ showMessage("Select program first"); return; }
  showLoading("Loading PDFs...");
  loadedPDFs = await loadPDFsForProgram();
  displayPDFs(loadedPDFs);
});
searchNameBtn.addEventListener("click", ()=>{
  const q=(searchInput.value||"").toLowerCase();
  const filtered = q? loadedPDFs.filter(f=>f.name.toLowerCase().includes(q)):loadedPDFs;
  displayPDFs(filtered);
});

/**************
 * SC Tools
 **************/
scToggle.addEventListener("click", ()=>{ 
  const open = scContent.style.display==="block";
  scContent.style.display=open?"none":"block"; 
});
scOpenAIBtn.addEventListener("click", ()=>{
  const ai = scAISelect.value; if(!ai) return alert("Select AI");
  const urls={ chatgpt:"https://chat.openai.com", copilot:"https://copilot.microsoft.com", deepseek:"https://deepseek.ai", questionai:"https://questionai.com"};
  window.open(urls[ai],"_blank");
});
scOpenPDFBtn.addEventListener("click", ()=>{
  const file = scPDFInput.files[0];
  const site = scPDFSelect.value;
  if(file){ const url=URL.createObjectURL(file); window.open(url,"_blank"); if(!recentOpened.includes(file.name)) recentOpened.unshift(file.name); if(recentOpened.length>10) recentOpened.pop(); updateRecentUI(); return; }
  if(site){ const name=scPDFSelect.options[scPDFSelect.selectedIndex].text; window.open(site,"_blank"); if(!recentOpened.includes(name)) recentOpened.unshift(name); if(recentOpened.length>10) recentOpened.pop(); updateRecentUI(); return; }
  alert("Choose site or upload PDF");
});

/**************
 * Drag SC Hub
 **************/
let isDragging=false, dragX=0, dragY=0;
scToggle.addEventListener("mousedown",(e)=>{
  isDragging=true; dragX=e.clientX-scToolsHub.offsetLeft; dragY=e.clientY-scToolsHub.offsetTop;
  scToolsHub.style.cursor="grabbing";
});
document.addEventListener("mousemove",(e)=>{
  if(!isDragging) return;
  scToolsHub.style.left=(e.clientX-dragX)+"px";
  scToolsHub.style.top=(e.clientY-dragY)+"px";
});
document.addEventListener("mouseup",()=>{ isDragging=false; scToolsHub.style.cursor="grab"; });

updateRecentUI();
