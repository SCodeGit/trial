<script>
const config = {
  mode: "single",
  singleRepo: { owner: "SCodeGit", repo: "trial", branch: "main" }
};

const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semSel = document.getElementById("semester");
const progSel = document.getElementById("program");
const pdfList = document.getElementById("pdf-list");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchNameBtn = document.getElementById("searchNameBtn");
const viewerContainer = document.getElementById("sc-pdf-viewer");
const pdfInput = document.getElementById("pdfInput");

let loadedPDFs = [];

async function fetchFolder(url, branch=config.singleRepo.branch){
  const fullUrl = url.includes("?") ? url : `${url}?ref=${branch}`;
  const res = await fetch(fullUrl);
  if (!res.ok) return [];
  return await res.json();
}

function populateDropdown(dropdown, items){
  items.forEach(i=>{
    if(i.type==="dir"){
      const opt = document.createElement("option");
      opt.value = i.path;
      opt.textContent = i.name;
      dropdown.appendChild(opt);
    }
  });
  dropdown.disabled=false;
}

function resetDropdowns(...dropdowns){
  dropdowns.forEach(d=>{
    d.innerHTML=`<option value="">Select ${d.id.charAt(0).toUpperCase()+d.id.slice(1)}</option>`;
    d.disabled=true;
  });
  pdfList.innerHTML="";
  viewerContainer.style.display="none";
  loadedPDFs=[];
}

function displayPDFs(pdfs){
  pdfList.innerHTML="";
  if(pdfs.length===0){ pdfList.innerHTML="<p>No PDF files found.</p>"; return; }

  const adLink="https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE";

  pdfs.forEach(f=>{
    const rawURL=`https://raw.githubusercontent.com/${config.singleRepo.owner}/${config.singleRepo.repo}/${config.singleRepo.branch}/${f.path}`;
    const div=document.createElement("div");
    div.className="pdf-item";
    const a=document.createElement("a");
    a.href="#";
    a.textContent=f.name;
    a.addEventListener("click", e=>{
      e.preventDefault();
      // Show PDF in iframe viewer
      viewerContainer.innerHTML=`<iframe src="https://docs.google.com/gview?url=${encodeURIComponent(rawURL)}&embedded=true" style="width:100%;height:100%;border:none;"></iframe>`;
      viewerContainer.style.display="block";
      viewerContainer.scrollIntoView({behavior:"smooth"});
      // Trigger ad in new tab
      window.open(adLink,"_blank","noopener,noreferrer");
    });
    div.appendChild(a);
    pdfList.appendChild(div);
  });
}

async function loadPDFs(){
  if(!progSel.value) return [];
  const files=await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${progSel.value}`);
  return files.filter(f=>f.name.toLowerCase().endsWith(".pdf"));
}

searchBtn.addEventListener("click", async ()=>{
  loadedPDFs=await loadPDFs();
  displayPDFs(loadedPDFs);
});

if(searchNameBtn){
  searchNameBtn.addEventListener("click", async ()=>{
    if(!progSel.value){ alert("Please select a program first!"); return; }
    if(loadedPDFs.length===0) loadedPDFs=await loadPDFs();
    const query=searchInput.value.toLowerCase().trim();
    const filtered=query ? loadedPDFs.filter(f=>f.name.toLowerCase().includes(query)) : loadedPDFs;
    displayPDFs(filtered);
  });
}

function viewPDF(){
  if(pdfInput.files.length===0){ alert("Please select a PDF from your computer."); return; }
  const file=pdfInput.files[0];
  const url=URL.createObjectURL(file);
  viewerContainer.innerHTML=`<iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>`;
  viewerContainer.style.display="block";
  viewerContainer.scrollIntoView({behavior:"smooth"});
}

// Load universities on page load
(async ()=>{
  const baseURL=`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/`;
  const universities=await fetchFolder(baseURL);
  populateDropdown(universitySel, universities);
})();

// Dropdown event listeners
universitySel.addEventListener("change", async ()=>{
  resetDropdowns(levelSel, semSel, progSel);
  if(!universitySel.value) return;
  const levels=await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${universitySel.value}`);
  populateDropdown(levelSel, levels);
});

levelSel.addEventListener("change", async ()=>{
  resetDropdowns(semSel, progSel);
  if(!levelSel.value) return;
  const sems=await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${levelSel.value}`);
  populateDropdown(semSel, sems);
});

semSel.addEventListener("change", async ()=>{
  resetDropdowns(progSel);
  if(!semSel.value) return;
  const programs=await fetchFolder(`https://api.github.com/repos/${config.singleRepo.owner}/${config.singleRepo.repo}/contents/${semSel.value}`);
  populateDropdown(progSel, programs);
});
</script>
