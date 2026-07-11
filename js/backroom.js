const backroomTokenKey = "afd_backroom_token";

const gradeNames = [
  "Rat des Rues",
  "Passeur",
  "Receleur",
  "Contrebandier",
  "Corbeau",
  "Main Cachee",
  "Capitaine",
  "Emissaire d'Hector",
  "Bras d'Hector",
  "Maitre de l'Arriere-salle"
];

const gradeIcons = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const loginSection = document.querySelector("#backroom-login");
const registerSection = document.querySelector("#backroom-register");
const loginForm = document.querySelector("#backroom-login-form");
const loginError = document.querySelector("#backroom-login-error");
const backroomList = document.querySelector("#backroom-list");
const backroomStatus = document.querySelector("#backroom-status");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button[type=submit]");
  const password = String(new FormData(loginForm).get("password") || "");
  try {
    if (button) button.disabled = true;
    const response = await fetch("/.netlify/functions/backroom-login", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ password })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.token) throw new Error(result.error || "Acces refuse.");
    sessionStorage.setItem(backroomTokenKey, result.token);
    if (loginError) loginError.hidden = true;
    await loadBackroom(result.token);
  } catch (error) {
    if (loginError) {
      loginError.textContent = error.message || "Le mot ne fait pas tourner la clef.";
      loginError.hidden = false;
    }
  } finally {
    if (button) button.disabled = false;
  }
});

async function loadBackroom(token = sessionStorage.getItem(backroomTokenKey)) {
  if (!token) return;
  const response = await fetch("/.netlify/functions/backroom-data", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    sessionStorage.removeItem(backroomTokenKey);
    return;
  }
  const state = await response.json();
  renderBackroom(Array.isArray(state.characters) ? state.characters : []);
  if (loginSection) loginSection.hidden = true;
  if (registerSection) registerSection.hidden = false;
}

function renderBackroom(characters) {
  if (!backroomList) return;
  backroomList.innerHTML = characters.map(renderCharacter).join("") || `<p class="empty-state">Aucun nom n'est encore inscrit dans l'Arriere-salle.</p>`;
  if (backroomStatus) backroomStatus.textContent = `${characters.length} nom(s) visibles dans le registre.`;
}

function renderCharacter(character) {
  const gradeIndex = clamp(Number(character.grade || 1), 1, 10);
  const xp = Math.max(0, Number(character.xp || 0));
  const nextXp = Math.max(1, Number(character.nextXp || 100));
  const percent = Math.min(100, Math.round((xp / nextXp) * 100));
  return `
    <article class="backroom-card">
      ${character.portrait ? `<img class="traveler-portrait" src="${escapeHtml(character.portrait)}" alt="Portrait de ${escapeHtml(character.name)}">` : `<div class="traveler-portrait placeholder">${initials(character.name)}</div>`}
      <div class="backroom-card-body">
        <p class="grade-seal"><span>${gradeIcons[gradeIndex - 1]}</span> ${escapeHtml(gradeNames[gradeIndex - 1])}</p>
        <h2>${escapeHtml(character.name || "Nom inconnu")}</h2>
        <div class="xp-panel">
          <div class="rep-head">
            <span class="rep-title">Experience</span>
            <span class="rep-rank">${xp} / ${nextXp} XP</span>
            <span class="rep-percent">${percent} %</span>
          </div>
          <div class="rep-bar xp-bar"><span style="width:${percent}%"></span></div>
        </div>
        <div class="backroom-stats">
          ${statBlock("Reputation aupres d'Hector", character.hectorReputation)}
          ${statBlock("Notoriete", character.notoriety)}
          ${statBlock("Dernier gain d'experience", character.lastXpGain)}
          ${statBlock("Derniere activite RP visible", character.lastActivity)}
        </div>
        ${listBlock("Missions accomplies", character.completedMissions)}
        ${listBlock("Recompenses visibles", character.rewards)}
        ${listBlock("Objets remis a Hector", character.itemsGiven)}
        ${character.publicNote ? `<div class="sheet-block"><h3>Note visible</h3><p>${escapeHtml(character.publicNote)}</p></div>` : ""}
      </div>
    </article>
  `;
}

function statBlock(label, value) {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "Non renseigne")}</dd></div>`;
}

function listBlock(label, value) {
  const lines = String(value || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return `<div class="sheet-block"><h3>${escapeHtml(label)}</h3><p>Non renseigne.</p></div>`;
  return `<div class="sheet-block"><h3>${escapeHtml(label)}</h3><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></div>`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function initials(name) {
  return String(name || "?").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

loadBackroom();
