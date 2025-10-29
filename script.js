document.addEventListener("DOMContentLoaded", () => {
  const uniSelect = document.getElementById("universitySelect");
  const levelSelect = document.getElementById("levelSelect");
  const semSelect = document.getElementById("semesterSelect");
  const programSelect = document.getElementById("programSelect");
  const pdfList = document.getElementById("pdfList");

  let data = {};

  fetch("data.json")
    .then((res) => res.json())
    .then((json) => {
      data = json;
      populateUniversities(Object.keys(data));
    });

  function populateUniversities(universities) {
    universities.forEach((uni) => {
      const opt = document.createElement("option");
      opt.value = uni;
      opt.textContent = uni;
      uniSelect.appendChild(opt);
    });
  }

  uniSelect.addEventListener("change", () => {
    clearSelect(levelSelect, "-- Select Level --");
    clearSelect(semSelect, "-- Select Semester --");
    clearSelect(programSelect, "-- Select Program --");
    pdfList.innerHTML = "";

    if (uniSelect.value) {
      const levels = Object.keys(data[uniSelect.value]);
      levelSelect.disabled = false;
      levels.forEach((lvl) => {
        const opt = document.createElement("option");
        opt.value = lvl;
        opt.textContent = lvl;
        levelSelect.appendChild(opt);
      });
    } else {
      levelSelect.disabled = true;
    }
  });

  levelSelect.addEventListener("change", () => {
    clearSelect(semSelect, "-- Select Semester --");
    clearSelect(programSelect, "-- Select Program --");
    pdfList.innerHTML = "";

    if (levelSelect.value) {
      const semesters = Object.keys(data[uniSelect.value][levelSelect.value]);
      semSelect.disabled = false;
      semesters.forEach((sem) => {
        const opt = document.createElement("option");
        opt.value = sem;
        opt.textContent = sem;
        semSelect.appendChild(opt);
      });
    } else {
      semSelect.disabled = true;
    }
  });

  semSelect.addEventListener("change", () => {
    clearSelect(programSelect, "-- Select Program --");
    pdfList.innerHTML = "";

    if (semSelect.value) {
      const programs = Object.keys(
        data[uniSelect.value][levelSelect.value][semSelect.value]
      );
      programSelect.disabled = false;
      programs.forEach((prog) => {
        const opt = document.createElement("option");
        opt.value = prog;
        opt.textContent = prog;
        programSelect.appendChild(opt);
      });
    } else {
      programSelect.disabled = true;
    }
  });

  programSelect.addEventListener("change", () => {
    pdfList.innerHTML = "";
    if (programSelect.value) {
      const pdfs =
        data[uniSelect.value][levelSelect.value][semSelect.value][
          programSelect.value
        ];
      pdfs.forEach((pdf) => {
        const div = document.createElement("div");
        div.className = "pdf-item";
        div.innerHTML = `<a href="https://github.com/SCodeGit/trial/blob/main/${pdf.path}?raw=true" target="_blank">${pdf.name}</a>`;
        pdfList.appendChild(div);
      });
    }
  });

  function clearSelect(select, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    select.disabled = true;
  }
});
