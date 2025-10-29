async function loadData() {
  const res = await fetch('data.json');
  const data = await res.json();
  displayUniversities(data);
}

function displayUniversities(data) {
  const content = document.getElementById('content');
  content.innerHTML = '';
  const ul = document.createElement('ul');

  for (let uni in data) {
    const li = document.createElement('li');
    li.textContent = uni;
    li.onclick = () => displayLevels(data[uni], uni);
    ul.appendChild(li);
  }
  content.appendChild(ul);
}

function displayLevels(levels, uniName) {
  const content = document.getElementById('content');
  content.innerHTML = `<h2>${uniName}</h2>`;
  const ul = document.createElement('ul');

  for (let level in levels) {
    const li = document.createElement('li');
    li.textContent = level;
    li.onclick = () => displaySemesters(levels[level], uniName, level);
    ul.appendChild(li);
  }
  content.appendChild(ul);
}

function displaySemesters(sems, uni, level) {
  const content = document.getElementById('content');
  content.innerHTML = `<h2>${uni} - ${level}</h2>`;
  const ul = document.createElement('ul');

  for (let sem in sems) {
    const li = document.createElement('li');
    li.textContent = sem;
    li.onclick = () => displaySubjects(sems[sem], uni, level, sem);
    ul.appendChild(li);
  }
  content.appendChild(ul);
}

function displaySubjects(subjects, uni, level, sem) {
  const content = document.getElementById('content');
  content.innerHTML = `<h2>${uni} - ${level} - ${sem}</h2>`;
  const ul = document.createElement('ul');

  for (let subject in subjects) {
    const li = document.createElement('li');
    li.textContent = subject;
    li.onclick = () => displayFiles(subjects[subject]);
    ul.appendChild(li);
  }
  content.appendChild(ul);
}

function displayFiles(files) {
  const content = document.getElementById('content');
  content.innerHTML = `<h2>Available Past Questions</h2>`;
  const ul = document.createElement('ul');

  files.forEach(file => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = file.path;
    a.textContent = file.name;
    a.target = "_blank";
    li.appendChild(a);
    ul.appendChild(li);
  });
  content.appendChild(ul);
}

// 🔍 Search function
document.getElementById('searchBox').addEventListener('input', function (e) {
  const term = e.target.value.toLowerCase();
  const items = document.querySelectorAll('#content li');
  items.forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
});

loadData();
