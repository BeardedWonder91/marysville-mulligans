// -------------------------------
// CSV LOADER
// -------------------------------
async function loadCSV(path) {
  const response = await fetch(path);
  const text = await response.text();
  return parseCSV(text);
}

// Convert CSV text → array of objects
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const values = line.split(",");
    let row = {};
    headers.forEach((h, i) => row[h.trim()] = values[i]?.trim());
    return row;
  });
}

// -------------------------------
// TABLE BUILDER
// -------------------------------
function buildTable(elementId, data) {
  const table = document.getElementById(elementId);
  if (!table) return;

  let html = "<tr>";

  // Headers
  Object.keys(data[0]).forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += "</tr>";

  // Rows
  data.forEach(row => {
    html += "<tr>";
    Object.values(row).forEach(v => {
      html += `<td>${v}</td>`;
    });
    html += "</tr>";
  });

  table.innerHTML = html;
}

// -------------------------------
// PLAYER CARDS
// -------------------------------
function buildPlayerCards(data) {
  const container = document.getElementById("players-grid");
  if (!container) return;

  container.innerHTML = data.map(player => `
    <div class="player-card">
      <h3>${player.Name}</h3>
      <div class="player-meta">
        Handicap: ${player.Handicap}<br>
        Avg: ${player.Average}<br>
        Last Score: ${player.LastScore}
      </div>
    </div>
  `).join("");
}

// -------------------------------
// SUB CARDS
// -------------------------------
function buildSubCards(data) {
  const container = document.getElementById("subs-grid");
  if (!container) return;

  container.innerHTML = data.map(sub => `
    <div class="sub-card">
      <h3>${sub.Name}</h3>
      <div class="sub-meta">
        Handicap: ${sub.Handicap}<br>
        Avg: ${sub.Average}<br>
        Can Sub For: ${sub.AllowedTeams}
      </div>
    </div>
  `).join("");
}

// -------------------------------
// HOMEPAGE STATS
// -------------------------------
function updateHomepageStats(players, scores) {
  const playerCount = document.getElementById("player-count");
  const teamCount = document.getElementById("team-count");
  const currentLeader = document.getElementById("current-leader");
  const nextRound = document.getElementById("next-round");

  if (playerCount) playerCount.textContent = players.length;
  if (teamCount) teamCount.textContent = new Set(scores.map(s => s.Team)).size;

  if (currentLeader) {
    const sorted = [...scores].sort((a, b) => Number(b.Total) - Number(a.Total));
    currentLeader.textContent = sorted[0]?.Team || "TBD";
  }

  if (nextRound) nextRound.textContent = "Coming Soon";
}

// -------------------------------
// PAGE ROUTER
// -------------------------------
async function initPage() {
  const path = window.location.pathname;

  // Homepage
  if (path.endsWith("index.html") || path.endsWith("/")) {
    const players = await loadCSV("data/players.csv");
    const scores = await loadCSV("data/team_scores.csv");
    updateHomepageStats(players, scores);
  }

  // Scores
  if (path.endsWith("scores.html")) {
    const data = await loadCSV("data/team_scores.csv");
    buildTable("scores-table", data);
  }

  // Standings
  if (path.endsWith("standings.html")) {
    const data = await loadCSV("data/true_avg.csv");
    buildTable("standings-table", data);
  }

  // Players
  if (path.endsWith("players.html")) {
    const data = await loadCSV("data/players.csv");
    buildPlayerCards(data);
  }

  // Matchups
  if (path.endsWith("matchups.html")) {
    const data = await loadCSV("data/matchups.csv");
    buildTable("matchups-table", data);
  }

  // Subs
  if (path.endsWith("subs.html")) {
    const data = await loadCSV("data/subs.csv");
    buildSubCards(data);
  }
}

initPage();
