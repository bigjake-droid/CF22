let docs = JSON.parse(localStorage.getItem("caseforge_docs")) || [];

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

/* ===== CORE APP ===== */
function saveDocs() {
  localStorage.setItem("caseforge_docs", JSON.stringify(docs));
}

function escapeHTML(str = "") {
  return str.replace(/[&<>"']/g, match => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[match]));
}

function addDoc() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value.trim();
  const text = document.getElementById("text").value.trim();
  const fileInput = document.getElementById("fileUpload");

  if (!title || !date || !text) {
    alert("Fill out title, date, and excerpt.");
    return;
  }

  const entry = {
    id: Date.now(),
    title,
    date,
    text,
    fileName: "",
    fileData: ""
  };

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = e => {
      entry.fileName = file.name;
      entry.fileData = e.target.result;
      docs.push(entry);
      finishAdd();
    };

    reader.readAsDataURL(file);
  } else {
    docs.push(entry);
    finishAdd();
  }
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

function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

function getConflicts() {
  const conflicts = [];

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const a = docs[i];
      const b = docs[j];

      const sameText = normalizeText(a.text) === normalizeText(b.text);
      const sameTitle = normalizeText(a.title) === normalizeText(b.title);
      const differentDate = a.date !== b.date;

      if ((sameText || sameTitle) && differentDate) {
        conflicts.push({ a, b });
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

      ${escapeHTML(d.text)}

      ${d.fileData ? `<br><br><a href="${d.fileData}" target="_blank">📎 Open File</a>` : ""}

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
          ${c.a.title} vs ${c.b.title}<br>
          Dates: <b>${c.a.date}</b> vs <b>${c.b.date}</b>
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
        Timeline inconsistency detected: ${conflicts[0].a.date} vs ${conflicts[0].b.date}.
      </div>`;
}

function renderLeverage() {
  const box = document.getElementById("leverageBox");
  if (!box) return;

  const conflicts = getConflicts();

  box.innerHTML = conflicts.length === 0
    ? `<div class="white-output">No leverage yet.</div>`
    : `<div class="white-output score-high">
        Conflicting dates undermine timeline reliability and credibility.
      </div>`;
}

function renderPressure() {
  const box = document.getElementById("pressureBox");
  if (!box) return;

  const conflicts = getConflicts();

  let score = Math.min(conflicts.length * 40, 100);

  box.innerHTML = `
    <div class="white-output">
      Pressure Score: ${score}/100
    </div>
  `;
}

function renderRequests() {
  const box = document.getElementById("requestBox");
  if (!box) return;

  box.innerHTML = `
    <div class="white-output">
      • Incident report<br>
      • CAD logs<br>
      • Bodycam<br>
      • Affidavit<br>
      • Metadata logs
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
      ${d.date}<br><b>${d.title}</b>
    </div>
  `).join("");
}

function exportReport() {
  alert("Export coming next step.");
}function exportReport() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const conflicts = getConflicts();
  const caseType = localStorage.getItem("caseforge_case_type") || "Unspecified";

  let y = 20;
  const left = 15;
  const pageWidth = 180;
  const lineHeight = 7;

  function addText(text, size = 11, bold = false) {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);

    const lines = pdf.splitTextToSize(text, pageWidth);

    lines.forEach(line => {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line, left, y);
      y += lineHeight;
    });
  }

  function divider() {
    y += 3;
    pdf.line(left, y, 195, y);
    y += 8;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("CaseForge Report", left, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Case Type: ${caseType}`, left, y);
  y += 6;
  pdf.text(`Generated: ${new Date().toLocaleString()}`, left, y);
  y += 8;

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
