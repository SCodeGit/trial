let data = {};
let currentPath = [];

fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    renderLevel(data);
  });

function renderLevel(level) {
  const viewer = document.getElementById('viewer');
  viewer.innerHTML = '';

  Object.keys(level).forEach(key => {
    const item = document.createElement('div');
    item.classList.add('folder');
    item.textContent = key;

    item.onclick = () => {
      currentPath.push(key);
      updateBreadcrumb();
      if (Array.isArray(level[key])) {
        renderPDFs(level[key]);
      } else {
        renderLevel(level[key]);
      }
    };
    viewer.appendChild(item);
  });
}

function renderPDFs(pdfList) {
  const viewer = document.getElementById('viewer');
  viewer.innerHTML = '';
  pdfList.forEach(pdf => {
    const link = document.createElement('a');
    link.href = `https://raw.githubusercontent.com/SCodeGit/trial/main/${pdf.path}`;
    link.textContent = pdf.name;
    link.target = '_blank';
    link.classList.add('pdf-link');
    viewer.appendChild(link);
  });
}

function updateBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.innerHTML = currentPath.join(' / ') + ' <button onclick="goBack()">← Back</button>';
}

function goBack() {
  currentPath.pop();
  breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.innerHTML = currentPath.join(' / ');
  
  let ref = data;
  for (const key of currentPath) ref = ref[key];
  renderLevel(ref);
}
