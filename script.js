let docs = JSON.parse(localStorage.getItem("caseforge_docs")) || [];

window.onload = () => {
  document.getElementById("startScreen")?.classList.remove("hidden");
  document.getElementById("missionScreen")?.classList.add("hidden");
  document.getElementById("caseApp")?.classList.add("hidden");

  renderAll();
};

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
let docs = JSON.parse(localStorage.getItem("caseforge_docs")) || [];

window.onload = () => {
  const savedType = localStorage.getItem("caseforge_case_type");

  if (savedType) {
    document.getElementById("startScreen")?.classList.add("hidden");
    document.getElementById("caseApp")?.classList.remove("hidden");
  } else {
    document.getElementById("startScreen")?.classList.remove("hidden");
    document.getElementById("caseApp")?.classList.add("hidden");
  }

  renderAll();
};

function startCase(type) {
  localStorage.setItem("caseforge_case_type", type);

  document.getElementById("startScreen")?.classList.add("hidden");
  document.getElementById("caseApp")?.classList.remove("hidden");

  renderAll();
}

function backToStart() {
  localStorage.removeItem("caseforge_case_type");

  document.getElementById("caseApp")?.classList.add("hidden");
  document.getElementById("startScreen")?.classList.remove("hidden");
}

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
  if (!confirm("Clear all saved evidence? This cannot be undone.")) return;

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

      const dateWords = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}\/\d{1,2}\/\d{2,4})\b/i;
      const bothMentionDates = dateWords.test(a.text) && dateWords.test(b.text);

      if ((sameText || sameTitle || bothMentionDates) && differentDate) {
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
    <div class="card evidence-card">
      <div class="card-top">
        <div>
          <b>${escapeHTML(d.title)}</b><br>
          <small>${escapeHTML(d.date)}</small>
        </div>
        <button class="remove-btn" onclick="removeDoc(${i})">Remove</button>
      </div>

      <p>${escapeHTML(d.text)}</p>

      ${d.fileData ? `
        <a class="file-link" href="${d.fileData}" target="_blank" download="${escapeHTML(d.fileName)}">
          📎 Open ${escapeHTML(d.fileName)}
        </a>
      ` : ""}
    </div>
  `).join("");
}

function renderConflicts() {
  const box = document.getElementById("conflicts");
  if (!box) return;

  const conflicts = getConflicts();

  if (conflicts.length === 0) {
    box.innerHTML = `<div class="white-output">No conflicts detected yet.</div>`;
    return;
  }

  box.innerHTML = conflicts.map(c => `
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

  if (conflicts.length === 0) {
    box.innerHTML = `
      <div class="white-output">
        No major contradictions identified yet. Add multiple records and CaseForge will start hunting for timeline cracks.
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="white-output">
      <b>Investigator View</b><br><br>
      CaseForge detected <b>${conflicts.length}</b> timeline conflict(s).<br><br>
      The strongest issue appears to be a mismatch between:
      <b>${escapeHTML(conflicts[0].a.date)}</b> and <b>${escapeHTML(conflicts[0].b.date)}</b>.<br><br>
      That pressures credibility, sequence accuracy, and whether later records were shaped after the fact.
    </div>
  `;
}

function renderLeverage() {
  const box = document.getElementById("leverageBox");
  if (!box) return;

  const conflicts = getConflicts();

  if (conflicts.length === 0) {
    box.innerHTML = `
      <div class="white-output">
        No leverage generated yet. Add records with matching events, conflicting dates, source contradictions, or altered language.
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="white-output score-high">
      <b>Primary Leverage Point</b><br><br>
      The record contains inconsistent dates for what appears to be the same or related event:
      <b>${escapeHTML(conflicts[0].a.date)}</b> and <b>${escapeHTML(conflicts[0].b.date)}</b>.<br><br>

      <b>Usable Argument:</b><br>
      This inconsistency undermines confidence in the official timeline and requires clarification before the record can be treated as reliable.<br><br>

      <b>Suggested Language:</b><br>
      “The record contains inconsistent dates for what appears to be the same underlying event. That inconsistency undermines confidence in the timeline, creates credibility concerns, and warrants production of the original source records, metadata, and audit trail.”
    </div>
  `;
}

function renderPressure() {
  const box = document.getElementById("pressureBox");
  if (!box) return;

  const conflicts = getConflicts();

  let score = conflicts.length * 35;

  if (docs.length >= 3) score += 10;
  if (docs.length >= 5) score += 15;
  if (conflicts.length >= 2) score += 20;

  score = Math.min(score, 100);

  let level = "Low";
  let className = "score-low";

  if (score >= 75) {
    level = "High";
    className = "score-high";
  } else if (score >= 45) {
    level = "Medium";
    className = "score-medium";
  }

  box.innerHTML = `
    <div class="white-output ${className}">
      <b>Legal Pressure Score: ${score} / 100</b><br>
      Risk Level: ${level}<br><br>
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
      <b>Recommended Documents:</b><br><br>
      • Original incident report<br>
      • CAD / dispatch log<br>
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
    box.innerHTML = `<div class="card empty">No timeline yet.</div>`;
    return;
  }

  const sorted = [...docs].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;

    return dateA - dateB;
  });

  box.innerHTML = sorted.map(d => `
    <div class="timeline-card">
      <span>${escapeHTML(d.date)}</span><br>
      <b>${escapeHTML(d.title)}</b>
    </div>
  `).join("");
}

function exportReport() {
  const conflicts = getConflicts();

  let report = "CASEFORGE REPORT\n";
  report += "====================\n\n";

  report += "EVIDENCE\n";
  report += "--------------------\n";

  docs.forEach((d, i) => {
    report += `${i + 1}. ${d.title} (${d.date})\n`;
    report += `${d.text}\n`;
    if (d.fileName) report += `Attachment: ${d.fileName}\n`;
    report += "\n";
  });

  report += "\nCONFLICTS\n";
  report += "--------------------\n";

  if (conflicts.length === 0) {
    report += "No conflicts detected.\n";
  } else {
    conflicts.forEach((c, i) => {
      report += `${i + 1}. ${c.a.title} vs ${c.b.title}\n`;
      report += `Dates: ${c.a.date} vs ${c.b.date}\n\n`;
    });
  }

  report += "\nLEVERAGE POINTS\n";
  report += "--------------------\n";

  if (conflicts.length > 0) {
    report += "The record contains inconsistent dates for what appears to be the same underlying event. ";
    report += "That inconsistency undermines confidence in the timeline and warrants production of original source records, metadata, and audit logs.\n";
  } else {
    report += "No leverage points generated yet.\n";
  }

  const blob = new Blob([report], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "caseforge_report.txt";
  link.click();

  URL.revokeObjectURL(link.href);
}
