const storageKey = "afd_mj_data_v1";

const starterData = {
  quests: [
    {
      id: "q-tonneau",
      title: "Le tonneau qui murmure",
      summary: "Une livraison venue du port émet des coups depuis l'intérieur. Hector veut des volontaires avant de l'ouvrir.",
      status: "disponible",
      difficulty: "Débutant",
      reputation: "Étranger accepté",
      participants: "1 à 4",
      reward: "Rumeur + faveur d'Hector",
      motif: "barrel",
      image: ""
    },
    {
      id: "q-marin",
      title: "La dette du marin rouge",
      summary: "Un ancien compagnon d'Hector cherche un nom effacé de son carnet. Trois voyageurs l'ont déjà vu.",
      status: "encours",
      difficulty: "Intermédiaire",
      reputation: "Visage connu",
      participants: "2 inscrits",
      reward: "Accès à une chronique",
      motif: "map",
      image: ""
    }
  ],
  travelers: [
    {
      id: "t-maelys",
      name: "Maëlys Cornebrume",
      portrait: "",
      faction: "Alliance",
      people: "Humaine",
      situation: "Exploratrice",
      guild: "",
      reputation: "Respecté",
      reputationScore: 62,
      notoriety: "Visage aperçu",
      notorietyScore: 28,
      rumor: "Elle paie toujours ses dettes, mais jamais avec la même monnaie.",
      description: "Une exploratrice prudente, connue pour écouter avant de promettre.",
      lodgingDescription: "",
      recentHistory: "+2 réputation après avoir ramené une carte humide au comptoir.",
      completedQuests: "Le tonneau qui murmure",
      chronicles: "Chronique des cartes salées",
      lastActivity: "Vue près de la table du fond."
    },
    {
      id: "t-gorvak",
      name: "Gorvak Brise-Amarre",
      portrait: "",
      faction: "Horde",
      people: "Orc",
      situation: "Marin",
      guild: "",
      reputation: "Toléré",
      reputationScore: 46,
      notoriety: "Connu",
      notorietyScore: 52,
      rumor: "On dit qu'il connaît trois routes maritimes qui n'existent sur aucune carte.",
      description: "Un marin rugueux dont les silences valent parfois plus que ses récits.",
      lodgingDescription: "",
      recentHistory: "A été cité dans une rumeur de port.",
      completedQuests: "La dette du marin rouge",
      chronicles: "Le carnet mouillé",
      lastActivity: "A quitté l'auberge avant l'aube."
    }
  ],
  rumors: [
    {
      id: "r-carte",
      text: "Une carte humide aurait été payée trois fois trop cher.",
      status: "visible",
      source: "Une table du fond"
    },
    {
      id: "r-client",
      text: "Hector refuse de servir un client que personne ne voit.",
      status: "visible",
      source: "Hector"
    },
    {
      id: "r-lanterne",
      text: "La lanterne du perron ne s'éteint plus depuis trois nuits.",
      status: "visible",
      source: "Le perron"
    }
  ],
  history: [
    {
      id: "h-start",
      date: new Date().toLocaleDateString("fr-FR"),
      type: "Rumeur",
      description: "La console MJ locale a été ouverte pour la première fois."
    }
  ]
};

let data = normalizeData(loadData());
let backroomData = normalizeBackroomData(loadBackroomLocalData());
let adminShowAllQuests = false;
let adminShowAllTravelers = false;
let adminShowAllRumors = false;
let onlineSaveTimer = null;
let backroomSaveTimer = null;

const backroomGrades = [
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

function loadData() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : structuredClone(starterData);
  } catch {
    return structuredClone(starterData);
  }
}

function normalizeData(value) {
  return {
    quests: Array.isArray(value.quests) ? value.quests : [],
    travelers: Array.isArray(value.travelers) ? value.travelers : [],
    rumors: Array.isArray(value.rumors) ? value.rumors : structuredClone(starterData.rumors),
    history: Array.isArray(value.history) ? value.history : []
  };
}

function loadBackroomLocalData() {
  try {
    return JSON.parse(localStorage.getItem("afd_backroom_data_v1") || "null") || starterBackroomData();
  } catch {
    return starterBackroomData();
  }
}

function starterBackroomData() {
  return { characters: [], history: [] };
}

function normalizeBackroomData(value) {
  return {
    characters: Array.isArray(value?.characters) ? value.characters : [],
    history: Array.isArray(value?.history) ? value.history : []
  };
}

function saveData() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new Event("afd-data-updated"));
    queueOnlineSave();
    return true;
  } catch (error) {
    console.error("Sauvegarde MJ impossible", error);
    showSuccess("Sauvegarde impossible : image trop lourde ou stockage navigateur plein.");
    return false;
  }
}

function queueOnlineSave() {
  if (!window.afdSupabase) return;
  clearTimeout(onlineSaveTimer);
  onlineSaveTimer = setTimeout(async () => {
    try {
      await window.afdSupabase.saveState(data);
      showSuccess("Registre publie en ligne");
    } catch (error) {
      console.warn("Publication Supabase impossible", error);
      showSuccess("Sauvegarde locale faite, publication en ligne refusee.");
    }
  }, 350);
}

async function loadOnlineAdminData() {
  if (!window.afdSupabase) return;
  try {
    const onlineData = await window.afdSupabase.loadState(data);
    data = normalizeData(onlineData);
    await loadOnlineBackroomData();
    localStorage.setItem(storageKey, JSON.stringify(data));
    renderAllAdmin();
    renderQuestPreview();
    renderTravelerPreview();
    renderBackroomPreview();
    showSuccess("Registre en ligne charge");
  } catch (error) {
    console.warn("Chargement Supabase impossible", error);
    showSuccess("Registre en ligne indisponible, copie locale ouverte.");
  }
}

async function loadOnlineBackroomData() {
  if (!window.afdSupabase?.client) return;
  try {
    const { data: row, error } = await window.afdSupabase.client
      .from("backroom_state")
      .select("data")
      .eq("id", "main")
      .maybeSingle();
    if (error) throw error;
    backroomData = normalizeBackroomData(row?.data || backroomData);
    localStorage.setItem("afd_backroom_data_v1", JSON.stringify(backroomData));
  } catch (error) {
    console.warn("Chargement Arriere-salle impossible", error);
    showSuccess("Arriere-salle indisponible, copie locale ouverte.");
  }
}

function saveBackroomData() {
  try {
    localStorage.setItem("afd_backroom_data_v1", JSON.stringify(backroomData));
    queueBackroomOnlineSave();
    return true;
  } catch (error) {
    console.error("Sauvegarde Arriere-salle impossible", error);
    showSuccess("Sauvegarde Arriere-salle impossible.");
    return false;
  }
}

function queueBackroomOnlineSave() {
  if (!window.afdSupabase?.client) return;
  clearTimeout(backroomSaveTimer);
  backroomSaveTimer = setTimeout(async () => {
    try {
      const { error } = await window.afdSupabase.client
        .from("backroom_state")
        .upsert({
          id: "main",
          data: backroomData,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      showSuccess("Arriere-salle publiee");
    } catch (error) {
      console.warn("Publication Arriere-salle refusee", error);
      showSuccess("Sauvegarde locale faite, publication Arriere-salle refusee.");
    }
  }, 350);
}

function showSuccess(message) {
  const notice = document.createElement("div");
  notice.className = "toast";
  notice.textContent = message;
  document.body.append(notice);
  setTimeout(() => notice.remove(), 2200);
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function switchTab(tab) {
  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminTab === tab);
  });
  document.querySelectorAll(".admin-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `admin-${tab}`);
  });
}

document.querySelectorAll("[data-admin-tab]").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.adminTab));
});

function renderAllAdmin() {
  renderQuestAdmin();
  renderTravelerAdmin();
  renderRumorAdmin();
  renderHistoryAdmin();
  renderBackroomAdmin();
}

function bindImageInput(formSelector, fileName, targetName, previewCallback) {
  const form = document.querySelector(formSelector);
  const fileInput = form?.elements[fileName];
  const targetInput = form?.elements[targetName];
  if (!fileInput || !targetInput) return;
  fileInput.addEventListener("change", async () => {
    const value = await imageFromForm(form, fileName, targetInput.value);
    targetInput.value = value;
    previewCallback();
  });
}

function renderQuestAdmin() {
  const list = document.querySelector("#admin-quest-list");
  const items = adminShowAllQuests ? data.quests : data.quests.slice(0, 5);
  list.innerHTML = items.map((quest) => `
    <article class="admin-row">
      <div>
        <p class="eyebrow">${labelStatus(quest.status)}</p>
        <h3>${escapeHtml(quest.title)}</h3>
        <p>${escapeHtml(quest.summary)}</p>
        <small>${escapeHtml(quest.difficulty || "Sans difficulté")} · ${escapeHtml(quest.participants || "Participants libres")}</small>
      </div>
      <div class="row-actions">
        <button class="button secondary" type="button" data-edit-quest="${quest.id}">Modifier</button>
        <button class="button secondary" type="button" data-delete-quest="${quest.id}">Supprimer</button>
      </div>
    </article>
  `).join("") || `<p class="empty-state">Aucun contrat accroché au tableau.</p>`;
  updateAdminReveal("#admin-toggle-quests", data.quests.length, adminShowAllQuests, "contrats");
}

function renderTravelerAdmin() {
  const list = document.querySelector("#admin-traveler-list");
  const query = normalizeSearch(document.querySelector("#admin-traveler-search")?.value || "");
  const filtered = data.travelers.filter((traveler) => {
    if (!query) return true;
    return normalizeSearch([
      traveler.name,
      traveler.faction,
      traveler.people,
      traveler.situation,
      traveler.guild,
      traveler.reputation,
      traveler.notoriety,
      traveler.rumor,
      traveler.lodgingDescription
    ].join(" ")).includes(query);
  });
  const items = adminShowAllTravelers ? filtered : filtered.slice(0, 5);
  list.innerHTML = items.map((traveler) => `
    <article class="admin-row">
      <div>
        <p class="eyebrow">${escapeHtml(traveler.faction)} · ${escapeHtml(traveler.people || "Peuple inconnu")}</p>
        <h3>${escapeHtml(traveler.name)}</h3>
        <p>${escapeHtml(traveler.situation || "Situation inconnue")} ${traveler.guild ? `· ${escapeHtml(traveler.guild)}` : ""} · ${escapeHtml(traveler.reputation || "Toléré")} · ${escapeHtml(traveler.notoriety || "Inconnu")}</p>
        <small>${escapeHtml(traveler.rumor || "Aucune rumeur.")}</small>
      </div>
      <div class="row-actions">
        <button class="button secondary" type="button" data-edit-traveler="${traveler.id}">Modifier</button>
        <button class="button secondary" type="button" data-delete-traveler="${traveler.id}">Supprimer</button>
      </div>
    </article>
  `).join("") || `<p class="empty-state">Aucun voyageur trouvé.</p>`;
  updateAdminReveal("#admin-toggle-travelers", filtered.length, adminShowAllTravelers, "voyageurs");
}

function renderRumorAdmin() {
  const list = document.querySelector("#admin-rumor-list");
  const items = adminShowAllRumors ? data.rumors : data.rumors.slice(0, 5);
  list.innerHTML = items.map((rumor) => `
    <article class="admin-row">
      <div>
        <p class="eyebrow">${labelRumorStatus(rumor.status)} · ${escapeHtml(rumor.source || "Source inconnue")}</p>
        <p class="rumor">“${escapeHtml(rumor.text)}”</p>
      </div>
      <div class="row-actions">
        <button class="button secondary" type="button" data-edit-rumor="${rumor.id}">Modifier</button>
        <button class="button secondary" type="button" data-delete-rumor="${rumor.id}">Supprimer</button>
      </div>
    </article>
  `).join("") || `<p class="empty-state">Aucun murmure accroché près du feu.</p>`;
  updateAdminReveal("#admin-toggle-rumors", data.rumors.length, adminShowAllRumors, "murmures");
}

function updateAdminReveal(selector, total, expanded, label) {
  const button = document.querySelector(selector);
  if (!button) return;
  const hiddenCount = Math.max(0, total - 5);
  button.hidden = total <= 5;
  const labels = {
    contrats: ["Réduire le tableau", `Dérouler ${hiddenCount} contrats de plus`],
    voyageurs: ["Refermer le registre", `Dérouler ${hiddenCount} voyageurs de plus`],
    murmures: ["Baisser la voix", `Écouter ${hiddenCount} murmures de plus`]
  };
  const [closeLabel, openLabel] = labels[label] || [`Réduire les ${label}`, `Afficher ${hiddenCount} ${label} de plus`];
  button.textContent = expanded ? closeLabel : openLabel;
}

function renderHistoryAdmin() {
  const list = document.querySelector("#admin-history-list");
  list.innerHTML = data.history.slice().reverse().map((entry) => `
    <article class="admin-row compact">
      <div>
        <p class="eyebrow">${escapeHtml(entry.type)} · ${escapeHtml(entry.date)}</p>
        <p>${escapeHtml(entry.description)}</p>
      </div>
      <button class="button secondary" type="button" data-delete-history="${entry.id}">Supprimer</button>
    </article>
  `).join("");
}

function renderBackroomAdmin() {
  const list = document.querySelector("#admin-backroom-list");
  if (!list) return;
  list.innerHTML = backroomData.characters.map((character) => `
    <article class="admin-row">
      <div>
        <p class="eyebrow">${escapeHtml(backroomGrades[(Number(character.grade || 1) - 1)] || backroomGrades[0])} · ${escapeHtml(character.xp || 0)} XP</p>
        <h3>${escapeHtml(character.name || "Nom inconnu")}</h3>
        <p>${escapeHtml(character.hectorReputation || "Reputation non renseignee")} · ${escapeHtml(character.notoriety || "Notoriete non renseignee")}</p>
        <small>${escapeHtml(character.lastActivity || "Aucune activite visible.")}</small>
      </div>
      <div class="row-actions">
        <button class="button secondary" type="button" data-edit-backroom="${character.id}">Modifier</button>
        <button class="button secondary" type="button" data-delete-backroom="${character.id}">Supprimer</button>
      </div>
    </article>
  `).join("") || `<p class="empty-state">Aucun nom dans l'Arriere-salle.</p>`;
  renderBackroomHistory();
}

function renderBackroomHistory() {
  const history = document.querySelector("#admin-backroom-history");
  if (!history) return;
  history.innerHTML = (backroomData.history || []).slice().reverse().map((entry) => `
    <article class="admin-row">
      <div>
        <p class="eyebrow">${escapeHtml(entry.date || "")}</p>
        <p>${escapeHtml(entry.description || "Entree sans detail.")}</p>
      </div>
    </article>
  `).join("") || `<p class="empty-state">Le carnet est encore vide.</p>`;
}

function renderBackroomPreview() {
  const form = document.querySelector("#backroom-form");
  const preview = document.querySelector("#backroom-preview");
  if (!form || !preview) return;
  const item = Object.fromEntries(new FormData(form).entries());
  const grade = backroomGrades[(Number(item.grade || 1) - 1)] || backroomGrades[0];
  const xp = Math.max(0, Number(item.xp || 0));
  const nextXp = Math.max(1, Number(item.nextXp || 100));
  preview.innerHTML = `
    <p class="eyebrow">Apercu Arriere-salle</p>
    <article class="backroom-card compact">
      ${item.portrait ? `<img class="traveler-portrait" src="${item.portrait}" alt="">` : `<div class="traveler-portrait placeholder">${initials(item.name || "Ombre")}</div>`}
      <div class="backroom-card-body">
        <p class="grade-seal"><span>${escapeHtml(item.grade || "1")}</span> ${escapeHtml(grade)}</p>
        <h3>${escapeHtml(item.name || "Nouveau nom")}</h3>
        ${bar("Experience", `${xp} / ${nextXp} XP`, Math.round((xp / nextXp) * 100))}
        <p>${escapeHtml(item.publicNote || "Aucune note visible.")}</p>
      </div>
    </article>
  `;
}

document.querySelector("#quest-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const item = Object.fromEntries(new FormData(form).entries());
  item.image = await imageFromForm(form, "imageFile", item.image);
  delete item.imageFile;
  item.id = item.id || uid("q");
  item.motif = item.motif || "scroll";
  const existing = data.quests.findIndex((quest) => quest.id === item.id);
  if (existing >= 0) data.quests[existing] = item;
  else data.quests.unshift(item);
  addHistory("Contrat", `Contrat accroché au tableau : ${item.title}`);
  form.reset();
  form.querySelector("[name=id]").value = "";
  saveData();
  renderAllAdmin();
  renderQuestPreview();
  showSuccess(existing >= 0 ? "Contrat corrigé" : "Contrat accroché au tableau");
});

document.querySelector("[data-reset-quest]").addEventListener("click", () => {
  document.querySelector("#quest-form").reset();
  document.querySelector("#quest-form [name=id]").value = "";
  renderQuestPreview();
});

document.querySelector("#traveler-admin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const item = Object.fromEntries(new FormData(form).entries());
  item.portrait = await imageFromForm(form, "portraitFile", item.portrait);
  delete item.portraitFile;
  item.id = item.id || uid("t");
  item.reputationScore = Number(item.reputationScore || 0);
  item.notorietyScore = Number(item.notorietyScore || 0);
  const existing = data.travelers.findIndex((traveler) => traveler.id === item.id);
  if (existing >= 0) data.travelers[existing] = item;
  else data.travelers.unshift(item);
  addHistory("Voyageur", `Nom ajouté au registre : ${item.name}`);
  form.reset();
  form.querySelector("[name=id]").value = "";
  saveData();
  renderAllAdmin();
  renderTravelerPreview();
  showSuccess(existing >= 0 ? "Page du registre corrigée" : "Voyageur inscrit au registre");
});

document.querySelector("[data-reset-traveler]").addEventListener("click", () => {
  document.querySelector("#traveler-admin-form").reset();
  document.querySelector("#traveler-admin-form [name=id]").value = "";
  renderTravelerPreview();
});

document.querySelector("#history-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const item = Object.fromEntries(new FormData(event.currentTarget).entries());
  addHistory(item.type, item.description);
  event.currentTarget.reset();
  saveData();
  renderAllAdmin();
  showSuccess("Chronique ajoutée");
});

document.querySelector("#rumor-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const item = Object.fromEntries(new FormData(form).entries());
  item.id = item.id || uid("r");
  const existing = data.rumors.findIndex((rumor) => rumor.id === item.id);
  if (existing >= 0) data.rumors[existing] = item;
  else data.rumors.unshift(item);
  addHistory("Murmure", `Murmure accroché près du feu : ${item.text}`);
  form.reset();
  form.querySelector("[name=id]").value = "";
  saveData();
  renderAllAdmin();
  showSuccess(existing >= 0 ? "Murmure corrigé" : "Murmure accroché près du feu");
});

document.querySelector("#backroom-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const item = Object.fromEntries(new FormData(form).entries());
  item.portrait = await imageFromForm(form, "portraitFile", item.portrait);
  delete item.portraitFile;
  item.id = item.id || uid("b");
  item.grade = Math.max(1, Math.min(10, Number(item.grade || 1)));
  item.xp = Math.max(0, Number(item.xp || 0));
  item.nextXp = Math.max(1, Number(item.nextXp || 100));
  delete item.xpDelta;
  const existing = backroomData.characters.findIndex((character) => character.id === item.id);
  if (existing >= 0) backroomData.characters[existing] = item;
  else backroomData.characters.unshift(item);
  backroomData.history.push({
    id: uid("bh"),
    date: new Date().toLocaleDateString("fr-FR"),
    description: `Arriere-salle mise a jour : ${item.name}`
  });
  form.reset();
  form.querySelector("[name=id]").value = "";
  saveBackroomData();
  renderBackroomAdmin();
  renderBackroomPreview();
  showSuccess(existing >= 0 ? "Nom corrige dans l'Arriere-salle" : "Nom inscrit dans l'Arriere-salle");
});

document.querySelector("[data-reset-backroom]")?.addEventListener("click", () => {
  document.querySelector("#backroom-form").reset();
  document.querySelector("#backroom-form [name=id]").value = "";
  renderBackroomPreview();
});

document.querySelector("[data-apply-xp]")?.addEventListener("click", () => {
  const form = document.querySelector("#backroom-form");
  const xp = Math.max(0, Number(form.elements.xp.value || 0));
  const delta = Number(form.elements.xpDelta.value || 0);
  form.elements.xp.value = Math.max(0, xp + delta);
  form.elements.lastXpGain.value = `${delta >= 0 ? "+" : ""}${delta} XP`;
  form.elements.xpDelta.value = 0;
  renderBackroomPreview();
});

document.querySelector("#save-backroom-password")?.addEventListener("click", async () => {
  const field = document.querySelector("#backroom-password");
  const password = String(field?.value || "");
  if (password.length < 4) {
    showSuccess("Mot trop court.");
    return;
  }
  if (!window.afdSupabase?.client) {
    showSuccess("Supabase indisponible.");
    return;
  }
  const passwordHash = await sha256Hex(password);
  const { error } = await window.afdSupabase.client
    .from("backroom_settings")
    .upsert({
      id: "main",
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    });
  if (error) {
    console.warn("Mot Arriere-salle refuse", error);
    showSuccess("Changement du mot refuse par Supabase.");
    return;
  }
  backroomData.history.push({
    id: uid("bh"),
    date: new Date().toLocaleDateString("fr-FR"),
    description: "Le mot de passe joueur de l'Arriere-salle a ete change."
  });
  saveBackroomData();
  renderBackroomAdmin();
  field.value = "";
  showSuccess("Mot de l'Arriere-salle change.");
});

document.querySelector("[data-reset-rumor]").addEventListener("click", () => {
  document.querySelector("#rumor-form").reset();
  document.querySelector("#rumor-form [name=id]").value = "";
});

document.querySelector("#admin-traveler-search")?.addEventListener("input", () => {
  adminShowAllTravelers = false;
  renderTravelerAdmin();
});

document.querySelector("#admin-toggle-quests")?.addEventListener("click", () => {
  adminShowAllQuests = !adminShowAllQuests;
  renderQuestAdmin();
});

document.querySelector("#admin-toggle-travelers")?.addEventListener("click", () => {
  adminShowAllTravelers = !adminShowAllTravelers;
  renderTravelerAdmin();
});

document.querySelector("#admin-toggle-rumors")?.addEventListener("click", () => {
  adminShowAllRumors = !adminShowAllRumors;
  renderRumorAdmin();
});

document.addEventListener("click", (event) => {
  const editQuest = event.target.closest("[data-edit-quest]");
  const deleteQuest = event.target.closest("[data-delete-quest]");
  const editTraveler = event.target.closest("[data-edit-traveler]");
  const deleteTraveler = event.target.closest("[data-delete-traveler]");
  const editRumor = event.target.closest("[data-edit-rumor]");
  const deleteRumor = event.target.closest("[data-delete-rumor]");
  const editBackroom = event.target.closest("[data-edit-backroom]");
  const deleteBackroom = event.target.closest("[data-delete-backroom]");
  const deleteHistory = event.target.closest("[data-delete-history]");

  if (editQuest) fillForm("#quest-form", data.quests.find((quest) => quest.id === editQuest.dataset.editQuest));
  if (deleteQuest && confirm("Supprimer cette quête ?")) {
    data.quests = data.quests.filter((quest) => quest.id !== deleteQuest.dataset.deleteQuest);
    addHistory("Contrat", "Un contrat a été retiré du tableau.");
    saveData();
    renderAllAdmin();
    showSuccess("Contrat retiré");
  }
  if (editTraveler) fillForm("#traveler-admin-form", data.travelers.find((traveler) => traveler.id === editTraveler.dataset.editTraveler));
  if (deleteTraveler && confirm("Supprimer ce voyageur ?")) {
    data.travelers = data.travelers.filter((traveler) => traveler.id !== deleteTraveler.dataset.deleteTraveler);
    addHistory("Voyageur", "Un nom a été retiré du registre.");
    saveData();
    renderAllAdmin();
    showSuccess("Nom retiré du registre");
  }
  if (editRumor) fillForm("#rumor-form", data.rumors.find((rumor) => rumor.id === editRumor.dataset.editRumor));
  if (deleteRumor && confirm("Supprimer cette rumeur ?")) {
    data.rumors = data.rumors.filter((rumor) => rumor.id !== deleteRumor.dataset.deleteRumor);
    addHistory("Murmure", "Un murmure a été retiré de la salle commune.");
    saveData();
    renderAllAdmin();
    showSuccess("Murmure retiré");
  }
  if (editBackroom) fillForm("#backroom-form", backroomData.characters.find((character) => character.id === editBackroom.dataset.editBackroom));
  if (deleteBackroom && confirm("Supprimer ce nom de l'Arriere-salle ?")) {
    backroomData.characters = backroomData.characters.filter((character) => character.id !== deleteBackroom.dataset.deleteBackroom);
    backroomData.history.push({
      id: uid("bh"),
      date: new Date().toLocaleDateString("fr-FR"),
      description: "Un nom a ete retire de l'Arriere-salle."
    });
    saveBackroomData();
    renderBackroomAdmin();
    renderBackroomPreview();
    showSuccess("Nom retire de l'Arriere-salle");
  }
  if (deleteHistory) {
    data.history = data.history.filter((entry) => entry.id !== deleteHistory.dataset.deleteHistory);
    saveData();
    renderAllAdmin();
    showSuccess("Chronique retirée");
  }
});

document.querySelector("#export-data").addEventListener("click", () => {
  document.querySelector("#data-box").value = JSON.stringify(data, null, 2);
});

document.querySelector("#import-data").addEventListener("click", () => {
  try {
    const imported = JSON.parse(document.querySelector("#data-box").value);
    if (!Array.isArray(imported.quests) || !Array.isArray(imported.travelers) || !Array.isArray(imported.history)) {
      throw new Error("Format invalide");
    }
    if (!Array.isArray(imported.rumors)) imported.rumors = [];
    data = normalizeData(imported);
    saveData();
    renderAllAdmin();
    alert("Registre restauré.");
    showSuccess("Registre restauré");
  } catch {
    alert("Import impossible : JSON invalide.");
  }
});

document.querySelector("#reset-data").addEventListener("click", () => {
  if (!confirm("Réinitialiser toutes les données locales ?")) return;
  data = normalizeData(structuredClone(starterData));
  saveData();
  renderAllAdmin();
  showSuccess("Registre vidé");
});

function fillForm(selector, item) {
  if (!item) return;
  const form = document.querySelector(selector);
  Object.entries(item).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) field.value = value;
  });
  form.scrollIntoView({ behavior: "smooth", block: "center" });
  updateRangeOutputs();
  renderQuestPreview();
  renderTravelerPreview();
  renderBackroomPreview();
}

function updateRangeOutputs() {
  document.querySelectorAll('input[type="range"]').forEach((input) => {
    const output = document.querySelector(`[data-range-output="${input.name}"]`);
    if (output) output.textContent = `${input.value} %`;
  });
}

async function imageFromForm(form, fieldName, currentValue) {
  const file = form.elements[fieldName]?.files?.[0];
  if (!file) return currentValue || "";
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    alert("Format image refusé. Utilisez PNG, JPEG ou WEBP.");
    return currentValue || "";
  }
  try {
    return await compressImage(file);
  } catch (error) {
    console.warn("Compression image impossible, lecture directe utilisee.", error);
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(currentValue || "");
    reader.readAsDataURL(file);
  });
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxSize = 1100;
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas indisponible"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/webp", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image illisible"));
    };
    image.src = objectUrl;
  });
}

function renderQuestPreview() {
  const form = document.querySelector("#quest-form");
  const preview = document.querySelector("#quest-preview");
  if (!form || !preview) return;
  const item = Object.fromEntries(new FormData(form).entries());
  preview.innerHTML = `
    <p class="eyebrow">Aperçu quête</p>
    <article class="quest-card">
      ${item.image ? `<img class="quest-upload-preview" src="${item.image}" alt="">` : `<div class="quest-image scroll"></div>`}
      <p class="quest-status">${labelStatus(item.status || "disponible")}</p>
      <h3>${escapeHtml(item.title || "Nouvelle quête")}</h3>
      <p>${escapeHtml(item.summary || "Résumé de quête à compléter.")}</p>
    </article>
  `;
}

function renderTravelerPreview() {
  const form = document.querySelector("#traveler-admin-form");
  const preview = document.querySelector("#traveler-preview");
  if (!form || !preview) return;
  const item = Object.fromEntries(new FormData(form).entries());
  preview.innerHTML = `
    <p class="eyebrow">Aperçu voyageur</p>
    <article class="traveler-card portrait-card">
      ${renderPortrait(item)}
      <div class="card-body">
        <p class="eyebrow">${escapeHtml(item.faction || "Faction")} · ${escapeHtml(item.people || "Race")}</p>
        <h3>${escapeHtml(item.name || "Nouveau voyageur")}</h3>
        <p>${escapeHtml(item.situation || "Métier")}</p>
        ${item.guild ? `<p>${escapeHtml(item.guild)}</p>` : ""}
        ${bar("Réputation", item.reputation || "Toléré", item.reputationScore || 45)}
        ${bar("Notoriété", item.notoriety || "Inconnu", item.notorietyScore || 25)}
      </div>
    </article>
  `;
}

function renderPortrait(item) {
  if (item.portrait) return `<img class="traveler-portrait" src="${item.portrait}" alt="">`;
  return `<div class="traveler-portrait placeholder">${initials(item.name || "Voyageur")}</div>`;
}

function bar(title, label, score) {
  const percent = Math.max(0, Math.min(100, Number(score || 0)));
  return `
    <div class="reputation">
      <div class="rep-head">
        <span class="rep-title">${escapeHtml(title)}</span>
        <span class="rep-rank">${escapeHtml(label)}</span>
        <span class="rep-percent">${percent} %</span>
      </div>
      <div class="rep-bar"><span style="width:${percent}%"></span></div>
    </div>
  `;
}

function initials(name) {
  return String(name || "?").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function addHistory(type, description) {
  data.history.push({
    id: uid("h"),
    date: new Date().toLocaleDateString("fr-FR"),
    type,
    description
  });
}

function labelStatus(status) {
  return {
    disponible: "Disponible",
    encours: "En cours",
    terminee: "Terminée",
    archivee: "Archivée"
  }[status] || status;
}

function labelRumorStatus(status) {
  return {
    visible: "Visible",
    cachee: "Cachée",
    archivee: "Archivée"
  }[status] || status;
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

function normalizeSearch(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function sha256Hex(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

renderAllAdmin();
renderQuestPreview();
renderTravelerPreview();
renderBackroomPreview();
updateRangeOutputs();
document.querySelector("#quest-form").addEventListener("input", renderQuestPreview);
document.querySelector("#traveler-admin-form").addEventListener("input", (event) => {
  if (event.target.matches('input[type="range"]')) updateRangeOutputs();
  renderTravelerPreview();
});
document.querySelector("#backroom-form")?.addEventListener("input", renderBackroomPreview);
bindImageInput("#quest-form", "imageFile", "image", renderQuestPreview);
bindImageInput("#traveler-admin-form", "portraitFile", "portrait", renderTravelerPreview);
bindImageInput("#backroom-form", "portraitFile", "portrait", renderBackroomPreview);

const loginForm = document.querySelector("#login-form");
loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = document.querySelector("#login-error");
  const submit = loginForm.querySelector("button[type=submit]");
  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!window.afdSupabase) {
    if (error) {
      error.textContent = "Supabase n'est pas configure pour cette console.";
      error.hidden = false;
    }
    return;
  }

  try {
    if (submit) submit.disabled = true;
    await window.afdSupabase.signIn(email, password);
    if (error) error.hidden = true;
    await loadOnlineAdminData();
    window.afdUnlock?.();
  } catch (authError) {
    console.warn("Connexion MJ refusee", authError);
    if (error) {
      error.textContent = "Connexion refusee. Verifiez le compte MJ cree dans Supabase Auth.";
      error.hidden = false;
    }
  } finally {
    if (submit) submit.disabled = false;
  }
});

(async () => {
  if (!window.afdSupabase) return;
  const session = await window.afdSupabase.getSession();
  if (session) {
    await loadOnlineAdminData();
    window.afdUnlock?.();
  }
})();
