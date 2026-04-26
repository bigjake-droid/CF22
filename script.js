let docs = [];
const STORAGE_KEY = "caseforge_docs";

/* LOAD SAVED CASE */
function loadDocs() {
  const saved = localStorage.getItem(STORAGE_KEY);
  docs = saved ? JSON.parse(saved) : [];
}

/* SAVE CASE */
function saveDocs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

/* ADD DOCUMENT */
function addDoc() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value.trim();
  const text = document.getElementById("text").value.trim();

  if (!title || !date || !text) {
    alert("Fill out all fields.");
    return;
  }

  docs.push({ title, date, text });

  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("text").value = "";
const fileInput = document.getElementById("fileUpload");
let fileName = "";

if (fileInput.files.length > 0) {
  fileName = fileInput.files[0].name;
}
  saveDocs();
  renderAll();
}

/* REMOVE DOCUMENT */
function removeDoc(index) {
  docs.splice(index, 1);
  saveDocs();
  renderAll();
}

/* CLEAR CASE */
function clearCase() {
  if (!confirm("Clear all saved exhibits?")) return;
  docs = [];
  saveDocs();
  renderAll();
}

/* SHARED WORD DETECTION */
function getSharedWords(a, b) {
  const ignore = ["the","and","was","with","for","that","this","from","were","are","his","her","you","your","into","vehicle"];

  const w1 = a.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !ignore.includes(w));
  const w2 = b.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !ignore.includes(w));

  return [...new Set(w1.filter(w => w2.includes(w)))];
}

/* CONFLICT ENGINE */
function getConflicts() {
  let conflicts = [];

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const words = getSharedWords(docs[i].text, docs[j].text);

      if (words.length >= 2 && docs[i].date !== docs[j].date) {
        conflicts.push({
          a: docs[i],
          b: docs[j],
          words
        });
      }
    }
  }

  return conflicts;
}

/* RENDER ALL */
function renderAll() {
  const conflicts = getConflicts();

  renderDocs();
  renderConflicts(conflicts);
  renderAnalysis(conflicts);
  renderPressure(conflicts);
  renderRequests(conflicts);
  renderTimeline();
}

/* SHOW EXHIBITS */
function renderDocs() {
  let out = "";

  docs.forEach((d, i) => {
    out += `
      <div class="card">
        <b>${d.title}</b><br>
        <small>${d.date}</small><br><br>
        ${d.text}
        <button class="remove-btn" onclick="removeDoc(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("analysis").innerHTML = out;
}

/* CONFLICTS */
function renderConflicts(conflicts) {
  let out = "";

  if (conflicts.length === 0) {
    out = "<div class='card'>No conflicts detected yet.</div>";
  } else {
    conflicts.forEach(c => {
      out += `
        <div class="card">
          <b>${c.a.title}</b> vs <b>${c.b.title}</b><br>
          Dates: ${c.a.date} vs ${c.b.date}<br><br>
          Shared Terms: ${c.words.join(", ")}
        </div>
      `;
    });
  }

  document.getElementById("conflicts").innerHTML = out;
}

/* INVESTIGATOR VIEW */
function renderAnalysis(conflicts) {
  let out = "";

  if (docs.length === 0) {
    out = "<div class='white-output'>Add exhibits to begin analysis.</div>";
  } else if (conflicts.length === 0) {
    out = "<div class='white-output'>No major contradiction identified yet.</div>";
  } else {
    const c = conflicts[0];

    out = `
      <div class="white-output">
        <b>Investigator View:</b><br><br>
        Records reference similar subject matter but list different dates:
        <b>${c.a.date}</b> vs <b>${c.b.date}</b>.<br><br>
        This creates pressure on timeline reliability, documentation accuracy,
        and the credibility of the record.
      </div>
    `;
  }

  document.getElementById("analysis").innerHTML += out;
}

/* PRESSURE SCORE */
function renderPressure(conflicts) {
  let score = 0;

  score += conflicts.length * 25;
  score += docs.length >= 3 ? 15 : 0;
  score += docs.length >= 5 ? 15 : 0;

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

/* RECOMMENDED DOCS */
function renderRequests(conflicts) {
  let out = `
    <div class="white-output">
      <b>CaseForge recommends adding:</b><br><br>
      - Original incident report<br>
      - CAD / dispatch logs<br>
      - Bodycam timestamps or transcript<br>
      - Affidavit or charging document<br>
      - Database query records<br>
      - Emails, texts, call logs, or witness statements<br>
    </div>
  `;

  document.getElementById("requestBox").innerHTML = out;
}

/* TIMELINE */
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

/* EXPORT REPORT */
function exportReport() {
  const conflicts = getConflicts();

  let text = "CASEFORGE REPORT\n";
  text += "====================\n\n";

  text += "EXHIBITS:\n";
  docs.forEach((d, i) => {
    text += `${i + 1}. ${d.title} (${d.date})\n${d.text}\n\n`;
  });

  text += "CONFLICTS:\n";
  if (conflicts.length === 0) {
    text += "No conflicts detected.\n\n";
  } else {
    conflicts.forEach((c, i) => {
      text += `${i + 1}. ${c.a.title} vs ${c.b.title}\n`;
      text += `Dates: ${c.a.date} vs ${c.b.date}\n`;
      text += `Shared Terms: ${c.words.join(", ")}\n\n`;
    });
  }

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "caseforge_report.txt";
  link.click();
}

/* START APP */
loadDocs();
renderAll();
