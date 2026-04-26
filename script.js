let docs = JSON.parse(localStorage.getItem("caseforge_docs")) || [];

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/* ===== APP START STATE ===== */
window.onload = () => {
  document.getElementById("startScreen")?.classList.remove("hidden");
  document.getElementById("missionScreen")?.classList.add("hidden");
  document.getElementById("caseApp")?.classList.add("hidden");

  renderAll();
};

/* ===== SCREEN FLOW ===== */
function showMission(type) {
  localStorage.setItem("caseforge_case_type", type);

  document.getElementById("startScreen")?.classList.add("hidden");
  document.getElementById("missionScreen")?.classList.remove("hidden");
  document.getElementById("caseApp")?.classList.add("hidden");

  if (type === "business") {
    document.getElementById("missionTitle").innerText = "Business Case";
    document.getElementById("missionText").innerHTML = `
      CaseForge helps businesses organize disputes, incidents, records, timelines, and internal documentation.
      <br><br>
      When facts are scattered, pressure wins. When the record is organized, leverage changes hands.
    `;
  } else {
    document.getElementById("missionTitle").innerText = "Personal Case";
    document.getElementById("missionText").innerHTML = `
      I created CaseForge because I was once staring into the abyss of the criminal justice system.
      I had to learn procedure, discovery, timelines, contradictions, and documentation on my own —
      and trust me, I learned it the hard way.
      <br><br>
      This tool exists for people buried under paperwork, pressure, confusion, and fear.
      CaseForge helps turn scattered evidence into a clear record.
    `;
  }
}

function enterCaseApp() {
  document.getElementById("startScreen")?.classList.add("hidden");
  document.getElementById("missionScreen")?.classList.add("hidden");
  document.getElementById("caseApp")?.classList.remove("hidden");

  renderAll();
}

/* ===== STORAGE ===== */
function saveDocs() {
  localStorage.setItem("caseforge_docs", JSON.stringify(docs));
}

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, match => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[match]));
}

/* ===== FILE INTELLIGENCE ===== */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    return "";
  }

  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str).join(" ");
    fullText += `\n\n--- Page ${pageNum} ---\n${strings}`;
  }

  return fullText.trim();
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  try {
    if (name.endsWith(".pdf")) {
      return await extractTextFromPDF(file);
    }

    if (
      name.endsWith(".txt") ||
      name.endsWith(".csv") ||
      name.endsWith(".log") ||
      name.endsWith(".md")
    ) {
      return await readFileAsText(file);
    }

    return "";
  } catch (err) {
    console.error("File extraction failed:", err);
    return "";
  }
}

/* ===== ADD EVIDENCE ===== */
async function addDoc() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value.trim();
  const manualText = document.getElementById("text").value.trim();
  const fileInput = document.getElementById("fileUpload");

  const file = fileInput?.files?.[0];

  if (!title || !date || (!manualText && !file)) {
    alert("Add a title, date, and either text or a file.");
    return;
  }

  let fileName = "";
  let fileData = "";
  let extractedText = "";

  if (file) {
    fileName = file.name;
    fileData = await readFileAsDataURL(file);
    extractedText = await extractTextFromFile(file);
  }

  const finalText = [
    manualText,
    extractedText ? `Extracted File Text:\n${extractedText}` : ""
  ].filter(Boolean).join("\n\n");

  const entry = {
    id: Date.now() + Math.random(),
    title,
    date,
    text: finalText || "File uploaded. No readable text could be extracted.",
    fileName,
    fileData,
    extractedText
  };

  docs.push(entry);
  finishAdd();
}

function finishAdd() {
  ["title", "date", "text", "fileUpload"].forEach(id => {
    document.getElementById(id).value = "";
  });

  saveDocs();
  renderAll();
}

function removeDoc(index) {
  docs.splice(index, 1);
  saveDocs();
  renderAll();
}

function clearCase() {
  if (!confirm("Clear all saved evidence?")) return;

  docs = [];
  localStorage.removeItem("caseforge_docs");
  renderAll();
}

/* ===== ANALYSIS ===== */
function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getConflicts() {
  const conflicts = [];
  const seen = new Set();

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const a = docs[i];
      const b = docs[j];

      const aText = normalizeText(a.text);
      const bText = normalizeText(b.text);
      const aTitle = normalizeText(a.title);
      const bTitle = normalizeText(b.title);

      if (aText === bText && a.date === b.date) continue;

      const sameText = aText === bText;
      const sameTitle = aTitle === bTitle;
      const differentDate = a.date !== b.date;

      if ((sameText || sameTitle) && differentDate) {
        const keyBase = sameText ? aText : aTitle;
        const key = `${keyBase}|${[a.date, b.date].sort().join("-")}`;

        if (!seen.has(key)) {
          seen.add(key);
          conflicts.push({ a, b });
        }
      }
    }
  }

  return conflicts;
}

function renderAll() {
  renderDocs();
  renderConflicts();
  renderAnalysis();
  renderLeverage();
  renderPressure();
  renderRequests();
  renderTimeline();
}

function renderDocs() {
  const box = document.getElementById("docsBox");
  if (!box) return;

  if (docs.length === 0) {
    box.innerHTML = `<div class="card empty">No evidence added yet.</div>`;
    return;
  }

  box.innerHTML = docs.map((d, i) => `
    <div class="card">
      <b>${escapeHTML(d.title)}</b><br>
      <small>${escapeHTML(d.date)}</small><br><br>

      ${escapeHTML(d.text).slice(0, 1200)}
      ${d.text.length > 1200 ? "<br><br><i>Text shortened in dashboard. Full text included in PDF export.</i>" : ""}

      ${d.fileData ? `<br><br><a href="${d.fileData}" target="_blank" download="${escapeHTML(d.fileName)}">📎 Open ${escapeHTML(d.fileName)}</a>` : ""}

      <br><br>
      <button onclick="removeDoc(${i})">Remove</button>
    </div>
  `).join("");
}

function renderConflicts() {
  const box = document.getElementById("conflicts");
  if (!box) return;

  const conflicts = getConflicts();

  box.innerHTML = conflicts.length === 0
    ? `<div class="white-output">No conflicts detected yet.</div>`
    : conflicts.map(c => `
        <div class="white-output score-medium">
          <b>Conflict Detected</b><br><br>
          ${escapeHTML(c.a.title)} vs ${escapeHTML(c.b.title)}<br>
          Dates: <b>${escapeHTML(c.a.date)}</b> vs <b>${escapeHTML(c.b.date)}</b>
        </div>
      `).join("");
}

function renderAnalysis() {
  const box = document.getElementById("analysis");
  if (!box) return;

  const conflicts = getConflicts();

  box.innerHTML = conflicts.length === 0
    ? `<div class="white-output">No contradictions yet.</div>`
    : `<div class="white-output">
        <b>Investigator View</b><br><br>
        CaseForge detected <b>${conflicts.length}</b> timeline conflict(s).<br><br>
        Strongest issue: <b>${escapeHTML(conflicts[0].a.date)}</b> vs <b>${escapeHTML(conflicts[0].b.date)}</b>.
      </div>`;
}

function renderLeverage() {
  const box = document.getElementById("leverageBox");
  if (!box) return;

  const conflicts = getConflicts();

  box.innerHTML = conflicts.length === 0
    ? `<div class="white-output">No leverage yet.</div>`
    : `<div class="white-output score-high">
        <b>Primary Leverage Point</b><br><br>
        Conflicting dates undermine timeline reliability, credibility, and documentation accuracy.
      </div>`;
}

function renderPressure() {
  const box = document.getElementById("pressureBox");
  if (!box) return;

  const conflicts = getConflicts();

  let score = conflicts.length * 40;
  if (docs.length >= 3) score += 10;
  if (docs.length >= 5) score += 15;
  score = Math.min(score, 100);

  box.innerHTML = `
    <div class="white-output">
      <b>Pressure Score: ${score}/100</b><br><br>
      Evidence Items: ${docs.length}<br>
      Conflicts Detected: ${conflicts.length}
    </div>
  `;
}

function renderRequests() {
  const box = document.getElementById("requestBox");
  if (!box) return;

  box.innerHTML = `
    <div class="white-output">
      • Original incident report<br>
      • CAD / dispatch logs<br>
      • Bodycam footage and timestamps<br>
      • Affidavit or charging document<br>
      • Database query records<br>
      • Metadata / audit logs<br>
      • Emails, texts, call logs, or witness statements
    </div>
  `;
}

function renderTimeline() {
  const box = document.getElementById("timeline");
  if (!box) return;

  if (docs.length === 0) {
    box.innerHTML = `<div class="card">No timeline yet.</div>`;
    return;
  }

  const sorted = [...docs].sort((a, b) => new Date(a.date) - new Date(b.date));

  box.innerHTML = sorted.map(d => `
    <div class="timeline-card">
      ${escapeHTML(d.date)}<br><b>${escapeHTML(d.title)}</b>
    </div>
  `).join("");
}

/* ===== PDF EXPORT ===== */
function loadLogo() {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://i.postimg.cc/HkF97bcq/file-0000000056b071f5ab04f4cd5b8d3ab5.png";

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

async function exportReport() {
  if (!window.jspdf) {
    alert("PDF library did not load. Check index.html.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const logo = await loadLogo();
  const conflicts = getConflicts();
  const caseType = localStorage.getItem("caseforge_case_type") || "Unspecified";

  let y = 18;
  const left = 15;
  const pageWidth = 180;
  const lineHeight = 7;

  function checkPage() {
    if (y > 275) {
      pdf.addPage();
      y = 20;
    }
  }

  function addText(text, size = 11, bold = false) {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(0);

    const lines = pdf.splitTextToSize(String(text), pageWidth);

    lines.forEach(line => {
      checkPage();
      pdf.text(line, left, y);
      y += lineHeight;
    });
  }

  function divider() {
    y += 3;
    checkPage();
    pdf.setDrawColor(160);
    pdf.line(left, y, 195, y);
    y += 8;
  }

  if (logo) {
    try {
      pdf.addImage(logo, "PNG", 55, y, 100, 45);
      y += 52;
    } catch (e) {
      y += 5;
    }
  }

  addText("CaseForge Report", 22, true);
  addText(`Case Type: ${caseType}`, 10);
  addText(`Generated: ${new Date().toLocaleString()}`, 10);

  divider();

  addText("Evidence Summary", 16, true);

  if (docs.length === 0) {
    addText("No evidence added.");
  } else {
    docs.forEach((d, i) => {
      y += 3;
      addText(`${i + 1}. ${d.title}`, 12, true);
      addText(`Date: ${d.date}`, 10);
      addText(d.text, 10);

      if (d.fileName) {
        addText(`Attachment: ${d.fileName}`, 10);
      }
    });
  }

  divider();

  addText("Detected Conflicts", 16, true);

  if (conflicts.length === 0) {
    addText("No conflicts detected.");
  } else {
    conflicts.forEach((c, i) => {
      y += 3;
      addText(`${i + 1}. ${c.a.title} vs ${c.b.title}`, 12, true);
      addText(`Date Conflict: ${c.a.date} vs ${c.b.date}`, 10);
      addText(
        "This inconsistency may undermine confidence in the timeline and should be clarified with original records, metadata, or source documentation.",
        10
      );
    });
  }

  divider();

  addText("Leverage Analysis", 16, true);

  if (conflicts.length > 0) {
    addText(
      "The record contains inconsistent dates or matching records with conflicting timeline information. This creates pressure on reliability, credibility, and documentation accuracy.",
      10
    );

    addText(
      "Suggested Language: The record contains inconsistent dates for what appears to be the same underlying event. That inconsistency undermines confidence in the timeline and warrants production of original source records, metadata, and audit logs.",
      10
    );
  } else {
    addText(
      "No leverage point generated yet. Add matching records with conflicting dates, source contradictions, altered language, or disputed timeline claims.",
      10
    );
  }

  divider();

  addText("Recommended Requests", 16, true);
  addText("• Original incident report");
  addText("• CAD / dispatch logs");
  addText("• Bodycam footage and timestamps");
  addText("• Affidavit or charging document");
  addText("• Database query records");
  addText("• Metadata / audit logs");
  addText("• Emails, texts, call logs, or witness statements");

  divider();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text(
    "Disclaimer: CaseForge is an evidence organization tool. It does not provide legal advice, create an attorney-client relationship, or replace review by a licensed attorney.",
    left,
    287,
    { maxWidth: 180 }
  );

  pdf.save("caseforge_report.pdf");
        }
