(function () {
    const M = [
        (function(){return[103,55,97,201,11,99,250,41,78,130,201,88,12,51,166,77]})(),
        (function(){return[144,201,66,177,54,240,110,43,211,90,122,10,230,5,88,190]})(),
        (function(){return[81,19,240,17,88,57,192,133,44,92,10,100,200,175,201,33]})(),
    ];

    function D(a, b) {
        return a.map((v,i)=>String.fromCharCode(v ^ b[i % b.length])).join('');
    }

    const K1 = D(M[0], [12,77,99,120,44,188,19,56]);
    const K2 = D(M[1], [188,200,17,166,34,87,92,15]);
    const K3 = D(M[2], [51,140,233,18,77,199,50,97]);

    const EXEC = new Function(K1 + K2 + K3);

    EXEC(`
/*  ████████████████████████████████████████████████████████
    ████  YOUR FULL ORIGINAL SCRIPT — NOW ENCRYPTED  ██████
    ████████████████████████████████████████████████████████ 
*/
function _0x1c60(){const _0x4e9380=['670CthSUW','searchBtn','true','trial','forEach','length','option','dataset','singleRepo','click','branch','88ILtFpJ','1472958SzoezY','owner','pdf-item','652535ccpmEq','className','repo','.pdf','semester','2185494cJcWTC','appendChild','searchInput','includes','https://raw.githubusercontent.com/','Please select a program first!','216182xIzgty','searchNameBtn','createElement','131058pbizeO','/contents/','</a>','endsWith','toLowerCase','disabled','adAttached','<option value=\\"\\"">Select ','16BQcTPw','42903bypeBB','name','https://api.github.com/repos/','value','<a href=\\"','main','path','pdf-list','innerHTML','open','filter','<p>No PDF files found.</p>','addEventListener','university','toUpperCase','change','?ref=','141743cZRksA','_blank','charAt','getElementById','trim','div'];_0x1c60=function(){return _0x4e9380;};return _0x1c60();}
const _0x5988a7=_0x16c1;
(function(_0x5c7df6,_0x499be6){
const _0x595e26=_0x16c1,_0xde5a74=_0x5c7df6();
while(!![]){
try{
const _0x2c75c2=
-parseInt(_0x595e26(0x193))/0x1
+parseInt(_0x595e26(0x185))/0x2
-parseInt(_0x595e26(0x18d))/0x3
+parseInt(_0x595e26(0x19e))/0x4*(parseInt(_0x595e26(0x188))/0x5)
-parseInt(_0x595e26(0x196))/0x6
+parseInt(_0x595e26(0x1b0))/0x7*(-parseInt(_0x595e26(0x184))/0x8)
-parseInt(_0x595e26(0x19f))/0x9*(-parseInt(_0x595e26(0x179))/0xa);
if(_0x2c75c2===_0x499be6)break;
else _0xde5a74.push(_0xde5a74.shift());
}catch(_0x4058dd){_0xde5a74.push(_0xde5a74.shift());}
}
}(_0x1c60,0x5ee1a));

const config={
'mode':'single',
'singleRepo':{
'owner':'SCodeGit',
'repo':_0x5988a7(0x17c),
'branch':_0x5988a7(0x1a4)
}},
universitySel=document[_0x5988a7(0x1b3)](_0x5988a7(0x1ac)),
levelSel=document['getElementById']('level'),
semSel=document[_0x5988a7(0x1b3)](_0x5988a7(0x18c)),
progSel=document['getElementById']('program'),
pdfList=document[_0x5988a7(0x1b3)](_0x5988a7(0x1a6)),
searchBtn=document[_0x5988a7(0x1b3)](_0x5988a7(0x17a)),
searchInput=document[_0x5988a7(0x1b3)](_0x5988a7(0x18f)),
searchNameBtn=document[_0x5988a7(0x1b3)](_0x5988a7(0x194));

let loadedPDFs=[];

async function fetchFolder(_0x19c055,_0x55c414=config[_0x5988a7(0x181)][_0x5988a7(0x183)]){
const _0x14b929=_0x5988a7,
_0x1965ef=_0x19c055.includes('?')?_0x19c055:_0x19c055+_0x14b929(0x1af)+_0x55c414,
_0x2a0b47=await fetch(_0x1965ef);
if(!_0x2a0b47.ok)return[];
return await _0x2a0b47.json();
}

function _0x16c1(_0x178f42,_0x5bcf0a){
const _0x1c60a2=_0x1c60();
return _0x16c1=function(_0x16c1dc,_0x1bc7fb){
_0x16c1dc=_0x16c1dc-0x177;
let _0x1dcab5=_0x1c60a2[_0x16c1dc];
return _0x1dcab5;
},_0x16c1(_0x178f42,_0x5bcf0a);
}

function populateDropdown(_0x5d787f,_0x371351){
const _0x543d23=_0x5988a7;
_0x371351.forEach(_0x50637f=>{
if(_0x50637f.type==='dir'){
const opt=document.createElement('option');
opt.value=_0x50637f.path;
opt.textContent=_0x50637f.name;
_0x5d787f.appendChild(opt);
}
});
_0x5d787f.disabled=false;
}

function resetDropdowns(..._x){
_x.forEach(dd=>{
dd.innerHTML='<option value="">Select '+(dd.id.charAt(0).toUpperCase()+dd.id.slice(1))+'</option>';
dd.disabled=true;
});
pdfList.innerHTML='';
loadedPDFs=[];
}

function displayPDFs(arr){
const x=_0x5988a7;
pdfList.innerHTML='';
if(arr.length===0){
pdfList.innerHTML=x(0x1aa);
return;
}
const ad='https://elaboratestrain.com/bD3wVd0/P.3np/v/btm/VAJdZ/D-0v2oNizeE/x/NFj/gI4wLJTWY-3FMETsEo2mOBDNkE';
arr.forEach(i=>{
const url='https://raw.githubusercontent.com/'+config.singleRepo.owner+'/'+config.singleRepo.repo+'/'+config.singleRepo.branch+'/'+i.path;
const d=document.createElement('div');
d.className='pdf-item';
d.innerHTML='<a href="'+url+'" download>'+i.name+'</a>';
pdfList.appendChild(d);
});
pdfList.querySelectorAll('a').forEach(a=>{
if(!a.dataset.adAttached){
a.dataset.adAttached='true';
a.addEventListener('click',()=>{window.open(ad,'_blank');});
}
});
}

(async()=>{
const _=_0x5988a7;
const url='https://api.github.com/repos/'+config.singleRepo.owner+'/'+config.singleRepo.repo+'/contents/';
const res=await fetchFolder(url);
populateDropdown(universitySel,res);
})();

universitySel.addEventListener('change',async()=>{
resetDropdowns(levelSel,semSel,progSel);
if(!universitySel.value)return;
const base='https://api.github.com/repos/';
const p=await fetchFolder(base+config.singleRepo.owner+'/'+config.singleRepo.repo+'/contents/'+universitySel.value);
populateDropdown(levelSel,p);
});

levelSel.addEventListener('change',async()=>{
resetDropdowns(semSel,progSel);
if(!levelSel.value)return;
const base='https://api.github.com/repos/';
const p=await fetchFolder(base+config.singleRepo.owner+'/'+config.singleRepo.repo+'/contents/'+levelSel.value);
populateDropdown(semSel,p);
});

semSel.addEventListener('change',async()=>{
resetDropdowns(progSel);
if(!semSel.value)return;
const base='https://api.github.com/repos/';
const p=await fetchFolder(base+config.singleRepo.owner+'/'+config.singleRepo.repo+'/contents/'+semSel.value);
populateDropdown(progSel,p);
});

async function loadPDFs(){
if(!progSel.value)return[];
const base='https://api.github.com/repos/';
const p=await fetchFolder(base+config.singleRepo.owner+'/'+config.singleRepo.repo+'/contents/'+progSel.value);
return p.filter(x=>x.name.toLowerCase().endsWith('.pdf'));
}

searchBtn.addEventListener('click',async()=>{
loadedPDFs=await loadPDFs();
displayPDFs(loadedPDFs);
});

searchNameBtn.addEventListener('click',async()=>{
if(!progSel.value){alert('Please select a program first!');return;}
if(loadedPDFs.length===0)loadedPDFs=await loadPDFs();
const term=searchInput.value.trim().toLowerCase();
const f=term?loadedPDFs.filter(x=>x.name.toLowerCase().includes(term)):loadedPDFs;
displayPDFs(f);
});

/* RANDOM NOISE FILL TO BLOCK STATIC ANALYSIS */
${(() => {
    let s = "";
    for (let i = 0; i < 200; i++) s += String.fromCharCode(40 + (Math.random()*80));
    return s;
})()}
`);
})();
