// SCode Portal — Auto PDF Loader
const folderURL =
  "https://api.github.com/repos/SCodeGit/trial/contents/university%20of%20Ghana(UG)/level%20100/sem%201";
const pdfList = document.getElementById("pdfList");
const pdfViewer = document.getElementById("pdfViewer");

async function loadPDFs() {
  try {
    const response = await fetch(folderURL);
    const files = await response.json();

    const pdfFiles = files.filter((f) => f.name.endsWith(".pdf"));
    if (pdfFiles.length === 0) {
      pdfList.innerHTML = "<p>No PDFs found in this folder.</p>";
      return;
    }

    pdfFiles.forEach((file) => {
      const item = document.createElement("div");
      item.className = "pdf-item";
      item.textContent = file.name.replace(".pdf", "");
      item.onclick = () => {
        pdfViewer.src = file.download_url;
        window.scrollTo({ top: pdfViewer.offsetTop, behavior: "smooth" });
      };
      pdfList.appendChild(item);
    });
  } catch (err) {
    pdfList.innerHTML = `<p style="color:red;">⚠️ Error loading PDFs: ${err}</p>`;
  }
}

loadPDFs();
