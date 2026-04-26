let docs = JSON.parse(localStorage.getItem("caseforge_docs")) || [];

window.onload = function () {
  renderAll();
};

function saveDocs() {
  localStorage.setItem("caseforge_docs", JSON.stringify(docs));
}

function addDoc() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value.trim();
  const text = document.getElementById("text").value.trim();
  const fileInput = document.getElementById("fileUpload");

  if (!title || !date || !text) {
    alert("Fill out all fields.");
    return;
  }

  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      docs.push({
        title,
        date,
        text,
        fileName: file.name,
        fileData: e.target.result
      });

      finishAdd();
    };

    reader.readAsDataURL(file);
  } else {
    docs.push({
      title,
      date,
      text,
      fileName: "",
      fileData: ""
    });

    finishAdd();
  }
}

function finishAdd() {
  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("text").value = "";
  document.getElementById("fileUpload").value = "";

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
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

function getConflicts() {
  const conflicts = [];

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const sameText = normalizeText(docs[i].text) === normalizeText(docs[j].text);
      const differentDate = docs[i].date !== docs[j].date;

      if (sameText && differentDate) {
        conflicts.push({
          a: docs[i],
          b: docs[j]
        });
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
  let out = "";

  if (docs.length === 0) {
    out = `<div class="card">No evidence added yet.</div>`;
  }

  docs.forEach((d, i) => {
    out += `
      <div class="card">
        <b>${d.title}</b><br>
        <small>${d.date}</small><br><br>

        ${d.text}

        ${d.fileData 
          ? `<br><br><a href="${d.fileData}" target="_blank" download="${d.fileName}">📎 Open ${d.fileName}</a>` 
          : ""}

        <br><br>
        <button class="remove-btn" onclick="removeDoc(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("docsBox").innerHTML = out;
}

function renderConflicts() {
  const conflicts = getConflicts();
  let out = "";

  if (conflicts.length === 0) {
    out = `<div class="card">No conflicts detected yet.</div>`;
  } else {
    conflicts.forEach(c => {
      out += `
        <div class="white-output score-medium">
          <b>Conflict Detected</b><br><br>
          ${c.a.title} vs ${c.b.title}<br>
          Dates: <b>${c.a.date}</b> vs <b>${c.b.date}</b>
        </div>
      `;
    });
  }

  document.getElementById("conflicts").innerHTML = out;
}

function renderAnalysis() {
  const conflicts = getConflicts();

  let out = `
    <div class="white-output">
      No major contradictions identified yet.
    </div>
  `;

  if (conflicts.length > 0) {
    const c = conflicts[0];

    out = `
      <div class="white-output">
        <b>Investigator View</b><br><br>
        Records reference similar subject matter but list different dates:
        <b>${c.a.date}</b> vs <b>${c.b.date}</b>.<br><br>
        This creates pressure on timeline reliability, documentation accuracy, and credibility.
      </div>
    `;
  }

  document.getElementById("analysis").innerHTML = out;
}

function renderLeverage() {
  const conflicts = getConflicts();

  let out = `
    <div class="white-output">
      No leverage point generated yet. Add matching records with conflicting dates, claims, or source language.
    </div>
  `;

  if (conflicts.length > 0) {
    const c = conflicts[0];

    out = `
      <div class="white-output score-high">
        <b>Primary Leverage Point</b><br><br>
        Two records appear to reference the same underlying event but report different dates:
        <b>${c.a.date}</b> and <b>${c.b.date}</b>.<br><br>

        <b>Usable Argument:</b><br>
        This inconsistency raises questions about the reliability of the reported sequence of events,
        the accuracy of the documentation, and whether later records were created or shaped after the fact.<br><br>

        <b>Suggested Language:</b><br>
        “The record contains inconsistent dates for what appears to be the same alleged event.
        That inconsistency undermines confidence in the timeline and warrants clarification before any conclusion is treated as reliable.”
      </div>
    `;
  }

  document.getElementById("leverageBox").innerHTML = out;
}

function renderPressure() {
  const conflicts = getConflicts();

  let score = 0;
  score += conflicts.length * 35;
  if (docs.length >= 3) score += 10;
  if (docs.length >= 5) score += 15;
  if (conflicts.length >= 2) score += 20;

  if (score > 100) score = 100;

  let level = "Low";
  let className = "score-low";

  if (score >= 75) {
    level = "High";
    className = "score-high";
  } else if (score >= 45) {
    level = "Medium";
    className = "score-medium";
  }

  document.getElementById("pressureBox").innerHTML = `
    <div class="white-output ${className}">
      <b>Legal Pressure Score: ${score} / 100</b><br>
      Risk Level: ${level}<br><br>
      ${conflicts.length} conflict(s) detected.
    </div>
  `;
}

function renderRequests() {
  document.getElementById("requestBox").innerHTML = `
    <div class="white-output">
      <b>Recommended Documents:</b><br><br>
      • Original incident report<br>
      • CAD / dispatch log<br>
      • Bodycam transcript or timestamps<br>
      • Affidavit or charging document<br>
      • Database query records<br>
      • Emails, texts, call logs, or witness statements
    </div>
  `;
}

function renderTimeline() {
  const sorted = [...docs].sort((a, b) => new Date(a.date) - new Date(b.date));
  let out = "";

  if (sorted.length === 0) {
    out = `<div class="card">No timeline yet.</div>`;
  }

  sorted.forEach(d => {
    out += `
      <div class="timeline-card">
        ${d.date}<br>
        <b>${d.title}</b>
      </div>
    `;
  });

  document.getElementById("timeline").innerHTML = out;
}

function exportReport() {
  const conflicts = getConflicts();

  let report = "CASEFORGE REPORT\n";
  report += "====================\n\n";

  report += "EVIDENCE:\n";
  docs.forEach((d, i) => {
    report += `${i + 1}. ${d.title} (${d.date})\n`;
    report += `${d.text}\n`;
    if (d.fileName) report += `Attachment: ${d.fileName}\n`;
    report += "\n";
  });

  report += "CONFLICTS:\n";
  if (conflicts.length === 0) {
    report += "No conflicts detected.\n\n";
  } else {
    conflicts.forEach((c, i) => {
      report += `${i + 1}. ${c.a.title} vs ${c.b.title}\n`;
      report += `${c.a.date} vs ${c.b.date}\n\n`;
    });
  }

  report += "LEVERAGE POINTS:\n";
  if (conflicts.length > 0) {
    report += "The record contains inconsistent dates for what appears to be the same alleged event. ";
    report += "That inconsistency undermines confidence in the timeline and warrants clarification before any conclusion is treated as reliable.\n";
  } else {
    report += "No leverage points generated yet.\n";
  }

  const blob = new Blob([report], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "caseforge_report.txt";
  link.click();
}
