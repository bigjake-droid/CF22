let docs = [];

/* ADD DOCUMENT */
function addDoc() {
  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;
  const text = document.getElementById("text").value;

  if (!title || !date || !text) {
    alert("Fill out all fields");
    return;
  }

  docs.push({ title, date, text });

  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("text").value = "";

  renderAll();
}

/* REMOVE DOCUMENT */
function removeDoc(index) {
  docs.splice(index, 1);
  renderAll();
}

/* FIND SHARED WORDS */
function getSharedWords(a, b) {
  const ignore = ["the","and","was","with","for","that","this","from","were","are","his","her","you","your","into"];

  const w1 = a.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !ignore.includes(w));
  const w2 = b.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !ignore.includes(w));

  return [...new Set(w1.filter(w => w2.includes(w)))];
}

/* DETECT CONFLICTS */
function getConflicts() {
  let conflicts = [];

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {

      const words = getSharedWords(docs[i].text, docs[j].text);

      if (words.length > 2 && docs[i].date !== docs[j].date) {
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

/* RENDER DOCS */
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

/* RENDER CONFLICTS */
function renderConflicts(conflicts) {
  let out = "";

  if (conflicts.length === 0) {
    out = "<div>No conflicts detected yet.</div>";
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

/* ANALYSIS TEXT */
function renderAnalysis(conflicts) {
  let text = "No major contradiction identified.";

  if (conflicts.length > 0) {
    let c = conflicts[0];
    text = `Records reference similar events but list different dates (${c.a.date} vs ${c.b.date}). This creates a timeline inconsistency.`;
  }

  document.getElementById("analysis").innerHTML += `
    <div class="white-output">${text}</div>
  `;
}

/* PRESSURE SCORE */
function renderPressure(conflicts) {
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
      Risk Level: ${level}
    </div>
  `;
}

/* DOCUMENT REQUESTS */
function renderRequests() {
  let list = [
    "Add specific dates to every piece of evidence",
    "Gather at least 5 independent documents",
    "Request certified copies",
    "Identify witnesses tied to each document"
  ];

  let out = "<div class='white-output'><b>Recommended:</b><ul>";

  list.forEach(item => {
    out += `<li>${item}</li>`;
  });

  out += "</ul></div>";

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
  let text = "CASEFORGE REPORT\n\n";

  docs.forEach(d => {
    text += `${d.title} (${d.date})\n${d.text}\n\n`;
  });

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "caseforge_report.txt";
  link.click();
}

/* MASTER RENDER */
function renderAll() {
  const conflicts = getConflicts();

  renderDocs();
  renderConflicts(conflicts);
  renderAnalysis(conflicts);
  renderPressure(conflicts);
  renderRequests();
  renderTimeline();
}
