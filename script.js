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
