/* ---------------- Lazy load images */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img").forEach(img => {
    if(!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
  });
});

/* ---------------- Theme toggle using system */
const body=document.body,themeBtn=document.getElementById("theme-toggle");
const systemPrefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
if(localStorage.getItem("theme")==="dark" || (!localStorage.getItem("theme") && systemPrefersDark)){body.setAttribute("data-theme","dark");themeBtn.textContent='🌙';} 
else{body.removeAttribute("data-theme");themeBtn.textContent='☀️';}
themeBtn.addEventListener("click",()=>{ 
  if(body.getAttribute("data-theme")==="dark"){body.removeAttribute("data-theme");themeBtn.textContent='☀️';localStorage.setItem("theme","light");} 
  else{body.setAttribute("data-theme","dark");themeBtn.textContent='🌙';localStorage.setItem("theme","dark");}
});

/* ---------------- Instructions toggle */
function toggleInstructions(){ 
  const box=document.getElementById("instructionsBox"); 
  box.style.display=box.style.display==="block"?"none":"block"; 
}

/* ---------------- SC Tools Hub draggable */
const hub=document.getElementById("scToolsHub"),toggle=document.getElementById("scToggle"),content=document.getElementById("scContent");
toggle.addEventListener("click",()=>{ content.style.display = content.style.display==="block"?"none":"block"; });
let isDragging=false, offsetX=0, offsetY=0;
hub.addEventListener("mousedown",(e)=>{ if(e.target===toggle){isDragging=true;offsetX=e.clientX-hub.offsetLeft;offsetY=e.clientY-hub.offsetTop;} });
document.addEventListener("mousemove",(e)=>{ if(isDragging){hub.style.left=(e.clientX-offsetX)+"px";hub.style.top=(e.clientY-offsetY)+"px";} });
document.addEventListener("mouseup",()=>{ isDragging=false; });

/* ---------------- SC Tools hub buttons */
document.getElementById("scOpenAI").addEventListener("click",()=>{
  const ai=document.getElementById("scAI").value;
  if(ai){window.open(`https://www.${ai}.com`, "_blank");}else{alert("Select an AI first.");}
});
document.getElementById("scOpenPDF").addEventListener("click",()=>{
  const file=document.getElementById("scPDFInput").files[0];
  if(file){const url=URL.createObjectURL(file);window.open(url, "_blank");}else{alert("Select a PDF first.");}
});

/* ---------------- PDF Selection logic */
const universitySel = document.getElementById("university");
const levelSel = document.getElementById("level");
const semesterSel = document.getElementById("semester");
const programSel = document.getElementById("program");
const searchBtn = document.getElementById("searchBtn");
const pdfList = document.getElementById("pdf-list");
const recentPanel = document.getElementById("recentPanel");
const recentList = document.getElementById("recentList");

/* Example: Load dummy universities */
const universities=["Peki COE","Accra COE","Kumasi COE"];
universities.forEach(u=>{let opt=document.createElement("option");opt.value=u;opt.textContent=u;universitySel.appendChild(opt);});

/* Dynamic enabling of selects */
universitySel.addEventListener("change",()=>{
  levelSel.disabled=false;
  levelSel.innerHTML='<option value="">Select Level</option><option value="100">100</option><option value="200">200</option><option value="300">300</option>';
});
levelSel.addEventListener("change",()=>{
  semesterSel.disabled=false;
  semesterSel.innerHTML='<option value="">Select Semester</option><option value="First">First</option><option value="Second">Second</option>';
});
semesterSel.addEventListener("change",()=>{
  programSel.disabled=false;
  programSel.innerHTML='<option value="">Select Program</option><option value="Early Childhood">Early Childhood</option><option value="Primary">Primary</option>';
});

/* Search PDFs logic */
searchBtn.addEventListener("click",()=>{
  const uni=universitySel.value, lvl=levelSel.value, sem=semesterSel.value, prog=programSel.value;
  if(!uni||!lvl||!sem||!prog){alert("Select all filters first.");return;}
  pdfList.innerHTML='';
  for(let i=1;i<=3;i++){
    const a=document.createElement("a");
    a.href="#";
    a.textContent=`${uni} - ${lvl} - ${sem} - ${prog} - Past Question ${i}`;
    a.addEventListener("click",(e)=>{e.preventDefault();alert("Open PDF feature here.");addToRecent(a.textContent);});
    pdfList.appendChild(a);
  }
});

/* Recent opened */
function addToRecent(title){
  recentPanel.style.display="block";
  let li=document.createElement("li");
  li.textContent=title;
  recentList.appendChild(li);
}
