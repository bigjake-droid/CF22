let docs = [];

// Load saved case on startup
window.onload = function () {
  const saved = localStorage.getItem("caseforge_docs");
  if (saved) {
    docs = JSON.parse(saved);
    renderAll();
  }
};

// Save to browser
function saveDocs() {
  localStorage.setItem("caseforge_docs", JSON.stringify(docs));
}

// Add Evidence
function addDoc() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value.trim();
  const text = document.getElementById("text").value.trim();
  const fileInput = document.getElementById("fileUpload");

  if (!title || !date || !text) {
    alert("Fill out all fields.");
    return;
  }

  if (fileInput.files.length > 0) {
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

// Finish add
function finishAdd() {
  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("text").value = "";
  document.getElementById("fileUpload").value = "";

  saveDocs();
  renderAll();
}

// Remove doc
function removeDoc(i) {
  docs.splice(i, 1);
  saveDocs();
  renderAll();
}

// Render everything
function renderAll() {
  renderDocs();
  renderConflicts();
  renderAnalysis();
  renderPressure();
  renderTimeline();
}

// Render documents
function renderDocs() {
  let out = "";

  docs.forEach((d, i) => {
    out += `
      <div class="card">
        <b>${d.title}</b><br>
        <small>${d.date}</small><br><br>

        ${d.text}

        ${d.fileData 
          ? `<br><a href="${d.fileData}" target="_blank" download="${d.fileName}">📎 Open ${d.fileName}</a>` 
          : ""}

        <br><br>
        <button class="remove-btn" onclick="removeDoc(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("analysis").innerHTML = out;
}

// Detect conflicts
function getConflicts() {
  let conflicts = [];

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      if (
        docs[i].text === docs[j].text &&
        docs[i].date !== docs[j].date
      ) {
        conflicts.push({
          a: docs[i],
          b: docs[j]
        });
      }
    }
  }

  return conflicts;
}

// Render conflicts
function renderConflicts() {
  const conflicts = getConflicts();
  let out = "";

  if (conflicts.length === 0) {
    out = "<p>No conflicts detected yet.</p>";
  } else {
    conflicts.forEach(c => {
      out += `
        <div class="white-output">
          Conflict: "${c.a.title}" vs "${c.b.title}"<br>
          Dates: <b>${c.a.date}</b> vs <b>${c.b.date}</b>
        </div>
      `;
    });
  }

  document.getElementById("conflicts").innerHTML = out;
}

// Investigator view
function renderAnalysis() {
  const conflicts = getConflicts();

  let text = "No major contradictions identified yet.";

  if (conflicts.length > 0) {
    let c = conflicts[0];

    text = `
      Records reference similar subject matter but list different dates: 
      <b>${c.a.date}</b> vs <b>${c.b.date}</b>.<br><br>
      This creates pressure on timeline reliability, documentation accuracy, and credibility.
    `;
  }

  document.getElementById("analysis").innerHTML = `
    <div class="white-output">${text}</div>
  `;
}

// Pressure score
function renderPressure() {
  const conflicts = getConflicts();
  let score = conflicts.length * 25;

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
      ${conflicts.length} timeline conflict(s) detected.
    </div>
  `;
}

// Timeline
function renderTimeline() {
  let sorted = [...docs].sort((a, b) => new Date(a.date) - new Date(b.date));

  let out = "";

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

// Export report
function exportReport() {
  let report = "CASEFORGE REPORT\n\n";

  docs.forEach(d => {
    report += `${d.date} - ${d.title}\n${d.text}\n\n`;
  });

  const blob = new Blob([report], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "case_report.txt";
  link.click();
}

// Clear everything
function clearCase() {
  if (confirm("Delete entire case?")) {
    docs = [];
    localStorage.removeItem("caseforge_docs");
    renderAll();
  }
}
