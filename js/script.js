let travelers = [
  {
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
  },
  {
    name: "Sila des Lanternes",
    portrait: "",
    faction: "Neutre",
    people: "Pandaren",
    situation: "Soigneuse",
    guild: "",
    reputation: "Admiré",
    reputationScore: 71,
    notoriety: "Fiable",
    notorietyScore: 44,
    rumor: "Elle soigne les blessures, mais pose toujours une question de trop.",
    description: "Soigneuse chaleureuse, mais rarement dupe des mensonges trop bien emballés.",
    lodgingDescription: "",
    recentHistory: "A aidé un voyageur blessé avant de disparaître en cuisine.",
    completedQuests: "",
    chronicles: "",
    lastActivity: "Présente lors de la dernière soirée de contes."
  }
];

let quests = [
  {
    status: "disponible",
    title: "Le tonneau qui murmure",
    summary: "Une livraison venue du port émet des coups depuis l'intérieur. Hector veut des volontaires avant de l'ouvrir.",
    difficulty: "Débutant",
    reputation: "Étranger accepté",
    participants: "1 à 4",
    reward: "Rumeur + faveur d'Hector",
    motif: "barrel",
    image: ""
  },
  {
    status: "encours",
    title: "La dette du marin rouge",
    summary: "Un ancien compagnon d'Hector cherche un nom effacé de son carnet. Trois voyageurs l'ont déjà vu.",
    difficulty: "Intermédiaire",
    reputation: "Visage connu",
    participants: "2 inscrits",
    reward: "Accès à une chronique",
    motif: "map",
    image: ""
  },
  {
    status: "disponible",
    title: "La table du fond",
    summary: "Chaque soir, une place reste libre et personne n'ose s'y asseoir. Ce soir, elle porte votre nom.",
    difficulty: "Tous niveaux",
    reputation: "Aucune",
    participants: "Solo ou duo",
    reward: "Rencontre RP spéciale",
    motif: "lantern"
  },
  {
    status: "terminee",
    title: "Le sceau violet",
    summary: "Une lettre cachetée a été remise au bon destinataire. Personne ne sait encore si c'était une bonne idée.",
    difficulty: "Court",
    reputation: "Habitué",
    participants: "Terminée",
    reward: "Notoriété : Mystérieux",
    motif: "seal"
  },
  {
    status: "archivee",
    title: "Les trois verres vides",
    summary: "Ancienne piste résolue lors d'une soirée de contes. Il n'en reste qu'une chanson mal accordée.",
    difficulty: "Archive",
    reputation: "Compagnon du Feu",
    participants: "Archivés",
    reward: "Chronique classée",
    motif: "scroll"
  }
];

try {
  const mjData = JSON.parse(localStorage.getItem("afd_mj_data_v1") || "null");
  if (mjData && Array.isArray(mjData.travelers)) travelers = mjData.travelers;
  if (mjData && Array.isArray(mjData.quests)) quests = mjData.quests;
  if (mjData && Array.isArray(mjData.rumors)) {
    window.afdRumors = mjData.rumors;
  }
} catch {
  // La console MJ locale est optionnelle. Les données de démonstration restent disponibles.
}

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const travelerGrid = document.querySelector("#traveler-grid");
const questGrid = document.querySelector("#quest-grid");
const form = document.querySelector("#traveler-form");
const generatedCard = document.querySelector("#generated-card");
const travelerSearch = document.querySelector("#traveler-search");
const toggleTravelers = document.querySelector("#toggle-travelers");
const toggleQuests = document.querySelector("#toggle-quests");
const toggleRumors = document.querySelector("#toggle-rumors");
const reservationForm = document.querySelector("#reservation-form");
const reservationTotal = document.querySelector("#reservation-total");
const reservationDetail = document.querySelector("#reservation-detail");
const reservationStatus = document.querySelector("#reservation-status");
const roomAccessFields = document.querySelector("#room-access-fields");
let currentQuestFilter = "all";
let showAllTravelers = false;
let showAllQuests = false;
let showAllRumors = false;

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

function renderTravelers() {
  const query = normalizeSearch(travelerSearch?.value || "");
  const visibleTravelers = travelers.filter((traveler) => {
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

  const displayedTravelers = showAllTravelers ? visibleTravelers : visibleTravelers.slice(0, 5);

  travelerGrid.innerHTML = displayedTravelers.map((traveler) => `
    <article class="traveler-card portrait-card">
      ${renderPortrait(traveler)}
      <div class="card-body">
        <p class="eyebrow">${traveler.faction} · ${traveler.people}</p>
        <h3>${traveler.name}</h3>
        <p>${traveler.situation}</p>
        ${traveler.guild ? `<p><strong>Guilde :</strong> ${escapeHtml(traveler.guild)}</p>` : ""}
        ${bar("Réputation", traveler.reputation, traveler.reputationScore ?? traveler.progress ?? 30)}
        ${bar("Notoriété", traveler.notority || traveler.notoriety, traveler.notorietyScore ?? 25)}
        <p class="rumor">“${traveler.rumor}”</p>
        <a class="button secondary" href="#voyageur-${slugify(traveler.name)}" data-traveler="${slugify(traveler.name)}">Voir la fiche</a>
      </div>
    </article>
  `).join("") || `<p class="empty-state">Aucun voyageur ne correspond à cette recherche.</p>`;
  updateRevealButton(toggleTravelers, visibleTravelers.length, showAllTravelers, "voyageurs");
}

function renderQuests(filter = "all") {
  currentQuestFilter = filter;
  const filtered = quests.filter((quest) => filter === "all" || quest.status === filter);
  const visible = showAllQuests ? filtered : filtered.slice(0, 5);
  questGrid.innerHTML = visible.map((quest) => `
    <article class="quest-card" data-status="${quest.status}">
      ${quest.image ? `<img class="quest-upload-preview" src="${quest.image}" alt="Illustration de quête">` : `<div class="quest-image ${quest.motif}" aria-hidden="true"></div>`}
      <p class="quest-status">${labelStatus(quest.status)}</p>
      <h3>${quest.title}</h3>
      <p>${quest.summary}</p>
      <dl>
        <div><dt>Difficulté</dt><dd>${quest.difficulty}</dd></div>
        <div><dt>Réputation</dt><dd>${quest.reputation}</dd></div>
        <div><dt>Participants</dt><dd>${quest.participants}</dd></div>
        <div><dt>Récompense RP</dt><dd>${quest.reward}</dd></div>
      </dl>
    </article>
  `).join("") || `<p class="empty-state">Aucune quête dans cette catégorie.</p>`;
  updateRevealButton(toggleQuests, filtered.length, showAllQuests, "quêtes");
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-traveler]");
  if (!link) return;
  event.preventDefault();
  renderTravelerDetail(link.dataset.traveler);
});

function renderTravelerDetail(slug) {
  const traveler = travelers.find((item) => slugify(item.name) === slug);
  const detail = document.querySelector("#voyageur-detail");
  if (!traveler || !detail) return;
  detail.hidden = false;
  detail.innerHTML = `
    <div class="traveler-sheet">
      ${renderPortrait(traveler)}
      <div class="traveler-sheet-main">
        <p class="eyebrow">${escapeHtml(traveler.faction || "Faction inconnue")} · ${escapeHtml(traveler.people || "Race inconnue")} · ${escapeHtml(traveler.situation || "Métier inconnu")}${traveler.guild ? ` · ${escapeHtml(traveler.guild)}` : ""}</p>
        <h2>${escapeHtml(traveler.name)}</h2>
        <p>${escapeHtml(traveler.description || "Aucune description RP renseignée.")}</p>
        <div class="sheet-bars">
          ${bar("Réputation", traveler.reputation || "Toléré", traveler.reputationScore ?? traveler.progress ?? 30)}
          ${bar("Notoriété", traveler.notoriety || "Inconnu", traveler.notorietyScore ?? 20)}
        </div>
        <div class="sheet-grid">
          ${sheetBlock("Rumeur publique", traveler.rumor)}
          ${sheetBlock("Guilde", traveler.guild)}
          ${sheetBlock("Description du logis", traveler.lodgingDescription)}
          ${sheetBlock("Chronique récente", traveler.recentHistory)}
          ${sheetList("Contrats honorés", traveler.completedQuests)}
          ${sheetList("Chroniques associées", traveler.chronicles)}
          ${sheetBlock("Dernière activité", traveler.lastActivity)}
        </div>
      </div>
    </div>
  `;
  history.replaceState(null, "", `#voyageur-${slug}`);
  detail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function sheetBlock(title, value) {
  return `<article class="sheet-block"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(value || "Non renseigné.")}</p></article>`;
}

function sheetList(title, value) {
  const lines = String(value || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const body = lines.length ? `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : "<p>Non renseigné.</p>";
  return `<article class="sheet-block"><h3>${escapeHtml(title)}</h3>${body}</article>`;
}

function renderPortrait(traveler) {
  if (traveler.portrait) return `<img class="traveler-portrait" src="${traveler.portrait}" alt="Portrait de ${escapeHtml(traveler.name)}">`;
  return `<div class="traveler-portrait placeholder" aria-hidden="true">${initials(traveler.name)}</div>`;
}

function bar(title, label, score) {
  const percent = Math.max(0, Math.min(100, Number(score || 0)));
  return `
    <div class="reputation">
      <div class="rep-head">
        <span class="rep-title">${escapeHtml(title)}</span>
        <span class="rep-rank">${escapeHtml(label || "Non renseigné")}</span>
        <span class="rep-percent">${percent} %</span>
      </div>
      <div class="rep-bar" aria-label="${escapeHtml(title)} : ${escapeHtml(label || "")}, ${percent} %">
        <span style="width:${percent}%"></span>
      </div>
    </div>
  `;
}

function renderRumors() {
  const list = document.querySelector("#rumor-list");
  if (!list) return;
  const defaultRumors = [...list.querySelectorAll("li")].map((item) => ({ text: item.textContent, status: "visible" }));
  const rumors = Array.isArray(window.afdRumors) ? window.afdRumors : defaultRumors;
  const filteredRumors = rumors.filter((rumor) => (rumor.status || "visible") === "visible");
  const visibleRumors = showAllRumors ? filteredRumors : filteredRumors.slice(0, 5);
  list.innerHTML = visibleRumors.map((rumor) => `<li>${escapeHtml(rumor.text)}</li>`).join("");
  updateRevealButton(toggleRumors, filteredRumors.length, showAllRumors, "rumeurs");
}

document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((button) => button.classList.remove("active"));
    filter.classList.add("active");
    showAllQuests = false;
    renderQuests(filter.dataset.filter);
  });
});

travelerSearch?.addEventListener("input", () => {
  showAllTravelers = false;
  renderTravelers();
});

toggleTravelers?.addEventListener("click", () => {
  showAllTravelers = !showAllTravelers;
  renderTravelers();
});

toggleQuests?.addEventListener("click", () => {
  showAllQuests = !showAllQuests;
  renderQuests(currentQuestFilter);
});

toggleRumors?.addEventListener("click", () => {
  showAllRumors = !showAllRumors;
  renderRumors();
});

function updateRevealButton(button, total, isExpanded, label) {
  if (!button) return;
  const hiddenCount = Math.max(0, total - 5);
  button.hidden = total <= 5;
  const labels = {
    voyageurs: ["Refermer le registre", `Dérouler ${hiddenCount} voyageurs de plus`],
    quêtes: ["Réduire le tableau", `Découvrir ${hiddenCount} contrats de plus`],
    rumeurs: ["Baisser la voix", `Écouter ${hiddenCount} murmures de plus`]
  };
  const [closeLabel, openLabel] = labels[label] || [`Réduire les ${label}`, `Afficher ${hiddenCount} ${label} de plus`];
  button.textContent = isExpanded ? closeLabel : openLabel;
}

function normalizeSearch(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const roomPrices = {
  "dortoir-prive-1": { label: "Chambre I - Lit prive 1", price: 50, maxOccupants: 1, privateRoom: false, majordomo: false },
  "dortoir-lit-2": { label: "Chambre I - Lit dortoir 2", price: 20, maxOccupants: 1, privateRoom: false, majordomo: false },
  "dortoir-lit-3": { label: "Chambre I - Lit dortoir 3", price: 20, maxOccupants: 1, privateRoom: false, majordomo: false },
  "dortoir-lit-4": { label: "Chambre I - Lit dortoir 4", price: 20, maxOccupants: 1, privateRoom: false, majordomo: false },
  "chambre-ii": { label: "Chambre II, individuelle", price: 100, maxOccupants: 2, privateRoom: true, majordomo: false },
  "chambre-iii": { label: "Chambre III, luxe", price: 500, maxOccupants: 4, privateRoom: true, majordomo: true }
};

function calculateReservationCost(data) {
  const room = roomPrices[data.room] || null;
  const isIndefinite = data.duration === "indetermine";
  const nights = isIndefinite ? 1 : Math.max(1, Number(data.duration) || 1);
  const occupants = Math.max(1, Math.min(room?.maxOccupants || 1, Number(data.occupants) || 1));
  const roomCost = room ? room.price * nights : 0;
  const breakfastCost = data.breakfast ? 10 * occupants * nights : 0;
  const hasMajordomo = Boolean(data.majordomo && room?.majordomo);
  const majordomoCost = hasMajordomo ? 100 : 0;
  const nightlyCost = (room ? room.price : 0) + (data.breakfast ? 10 * occupants : 0);
  const total = isIndefinite ? nightlyCost : roomCost + breakfastCost + majordomoCost;
  const supplements = [
    data.breakfast ? (isIndefinite ? `Petit-dejeuner (${formatRpCost(10 * occupants)} par nuit)` : `Petit-dejeuner (${formatRpCost(breakfastCost)})`) : "",
    hasMajordomo ? (isIndefinite ? "Majordome (1 doree, frais fixe)" : `Majordome (${formatRpCost(majordomoCost)})`) : ""
  ].filter(Boolean);
  return {
    room,
    nights,
    occupants,
    isIndefinite,
    total,
    totalLabel: isIndefinite ? `${formatRpCost(total)} / nuit${hasMajordomo ? " + 1 doree de majordome" : ""}` : formatRpCost(total),
    supplements: supplements.length ? supplements : ["Aucun supplement"]
  };
}

function formatRpCost(value) {
  const gold = Math.floor(value / 100);
  const silver = value % 100;
  const parts = [];
  if (gold) parts.push(`${gold} doree${gold > 1 ? "s" : ""}`);
  if (silver || !parts.length) parts.push(`${silver} argentee${silver > 1 ? "s" : ""}`);
  return parts.join(" et ");
}

function getReservationData() {
  if (!reservationForm) return {};
  const data = Object.fromEntries(new FormData(reservationForm).entries());
  data.breakfast = Boolean(reservationForm.elements.breakfast?.checked);
  data.majordomo = Boolean(reservationForm.elements.majordomo?.checked);
  return data;
}

function syncReservationRoomRules() {
  if (!reservationForm) return;
  const room = roomPrices[reservationForm.elements.room?.value] || null;
  const occupantsField = reservationForm.elements.occupants;
  const majordomoField = reservationForm.elements.majordomo;
  const majordomoOption = document.querySelector("#majordomo-option");
  const maxOccupants = room?.maxOccupants || 1;
  if (occupantsField) {
    occupantsField.max = String(maxOccupants);
    occupantsField.value = String(Math.max(1, Math.min(maxOccupants, Number(occupantsField.value) || 1)));
  }
  if (majordomoField && majordomoOption) {
    const canUseMajordomo = Boolean(room?.majordomo);
    majordomoOption.hidden = !canUseMajordomo;
    majordomoField.disabled = !canUseMajordomo;
    if (!canUseMajordomo) majordomoField.checked = false;
  }
  if (roomAccessFields) {
    roomAccessFields.hidden = !room?.privateRoom;
    roomAccessFields.querySelectorAll("textarea, select").forEach((field) => {
      field.disabled = !room?.privateRoom;
      if (!room?.privateRoom) field.value = field.tagName === "SELECT" ? "Aucun" : "";
    });
  }
}

function updateReservationTotal() {
  if (!reservationForm || !reservationTotal || !reservationDetail) return;
  syncReservationRoomRules();
  const data = getReservationData();
  const cost = calculateReservationCost(data);
  reservationTotal.textContent = cost.totalLabel;
  if (!cost.room) {
    reservationDetail.textContent = "Choisissez une chambre pour commencer le calcul.";
    return;
  }
  if (cost.isIndefinite) {
    reservationDetail.textContent = `${cost.room.label}, tarif indique a la nuit, ${cost.occupants}/${cost.room.maxOccupants} occupant(s). Supplements : ${cost.supplements.join(", ")}.`;
    return;
  }
  reservationDetail.textContent = `${cost.room.label} x ${cost.nights} nuit(s), ${cost.occupants}/${cost.room.maxOccupants} occupant(s). Supplements : ${cost.supplements.join(", ")}.`;
}

reservationForm?.addEventListener("input", updateReservationTotal);
reservationForm?.addEventListener("change", updateReservationTotal);
reservationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!reservationForm.reportValidity()) return;
  const button = reservationForm.querySelector("button[type=submit]");
  syncReservationRoomRules();
  const data = getReservationData();
  const cost = calculateReservationCost(data);
  const payload = {
    characterName: String(data.characterName || "").trim(),
    signature: String(data.signature || "").trim(),
    room: cost.room?.label || "",
    arrivalDate: String(data.arrivalDate || "Non precisee").trim(),
    duration: reservationForm.elements.duration?.selectedOptions?.[0]?.textContent || "Une nuit",
    occupants: cost.occupants,
    supplements: cost.supplements,
    allowedGuests: String(data.allowedGuests || "Non renseignee").trim(),
    bodyguard: String(data.bodyguard || "Aucun").trim(),
    bodyguardDetails: String(data.bodyguardDetails || "Aucun renseignement").trim(),
    requests: String(data.requests || "Aucune").trim(),
    comment: String(data.comment || "Aucun").trim(),
    total: cost.totalLabel
  };
  reservationStatus.textContent = "Le registre transmet la demande...";
  button.disabled = true;
  try {
    const response = await fetch("/.netlify/functions/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Envoi impossible.");
    reservationStatus.textContent = "Reservation envoyee au personnel de l'auberge.";
    reservationForm.reset();
    updateReservationTotal();
  } catch (error) {
    reservationStatus.textContent = `Le message n'a pas pu partir : ${error.message}`;
  } finally {
    button.disabled = false;
  }
});
updateReservationTotal();

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const traveler = {
    name: data.name || "Voyageur sans nom",
    portrait: await readPortraitFromForm(form),
    faction: data.faction || "Neutre",
    people: data.people || "Peuple inconnu",
    situation: data.situation || "Aventurier",
    guild: data.guild || "",
    reason: data.reason || "Trouver refuge",
    rp: data.rp || "Libre",
    rumor: data.rumor || "On ne sait pas encore ce qu'il vient chercher au Feu Dormant.",
    description: data.description || "",
    lodgingDescription: data.lodgingDescription || "",
    recentHistory: data.recentHistory || ""
  };
  renderGeneratedCard(traveler);
});

function renderGeneratedCard(traveler) {
  const discordText = [
    `**${traveler.name}**`,
    `Faction : ${traveler.faction}`,
    `Peuple : ${traveler.people}`,
    `Situation : ${traveler.situation}`,
    traveler.guild ? `Guilde : ${traveler.guild}` : "",
    `Rumeur : ${traveler.rumor}`,
    traveler.description ? `Description RP : ${traveler.description}` : "",
    traveler.lodgingDescription ? `Description du logis : ${traveler.lodgingDescription}` : "",
    traveler.recentHistory ? `Chronique recente : ${traveler.recentHistory}` : "",
    "",
    `Pour le MJ seulement : ${traveler.reason} · ${traveler.rp}`,
    traveler.portrait ? "Portrait joint sur la fiche/JPEG, non publie automatiquement sur le site." : ""
  ].filter(Boolean).join("\n");
  const share = `${location.origin}${location.pathname}#fiche-${encodeURIComponent(traveler.name)}`;
  generatedCard.innerHTML = `
    <p class="eyebrow">Page du registre</p>
    ${traveler.portrait ? `<img class="traveler-portrait" src="${traveler.portrait}" alt="Portrait de ${escapeHtml(traveler.name)}">` : ""}
    <h3>${escapeHtml(traveler.name)}</h3>
    <p><strong>${escapeHtml(traveler.faction)}</strong> · ${escapeHtml(traveler.people)} · ${escapeHtml(traveler.situation)}${traveler.guild ? ` · ${escapeHtml(traveler.guild)}` : ""}</p>
    <p class="rumor">“${escapeHtml(traveler.rumor)}”</p>
    <dl class="generated-meta">
      <div><dt>Ce qui l'amene au Feu Dormant</dt><dd>${escapeHtml(traveler.reason)}</dd></div>
      <div><dt>RP recherche</dt><dd>${escapeHtml(traveler.rp)}</dd></div>
      <div><dt>Chronique recente</dt><dd>${escapeHtml(traveler.recentHistory || "Non renseignee.")}</dd></div>
    </dl>
    ${traveler.description ? `<p>${escapeHtml(traveler.description)}</p>` : ""}
    ${traveler.lodgingDescription ? `<p><strong>Logis :</strong> ${escapeHtml(traveler.lodgingDescription)}</p>` : ""}
    <div class="generated-actions">
      <button class="button secondary" type="button" data-copy>Copier l'annonce</button>
      <button class="button secondary" type="button" data-jpeg>Sceller en image</button>
      <button class="button secondary" type="button" data-share>Copier le chemin</button>
    </div>
  `;
  generatedCard.querySelector("[data-copy]").addEventListener("click", () => copyText(discordText));
  generatedCard.querySelector("[data-share]").addEventListener("click", () => copyText(share));
  generatedCard.querySelector("[data-jpeg]").addEventListener("click", () => downloadTravelerJpeg(traveler));
}

function readPortraitFromForm(formElement) {
  const file = formElement.elements.portraitFile?.files?.[0];
  if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return Promise.resolve("");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    flash("Copié.");
  } catch {
    flash("Copie indisponible dans ce navigateur.");
  }
}

async function downloadTravelerJpeg(traveler) {
  return downloadTravelerJpegV2(traveler);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, "#120806");
  gradient.addColorStop(1, "#4b2816");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#f2b544";
  ctx.lineWidth = 8;
  ctx.strokeRect(32, 32, 1136, 566);
  if (traveler.portrait) {
    const portrait = await loadCanvasImage(traveler.portrait);
    if (portrait) {
      ctx.save();
      ctx.strokeStyle = "#caa35f";
      ctx.lineWidth = 5;
      ctx.strokeRect(780, 78, 330, 470);
      ctx.beginPath();
      ctx.rect(783, 81, 324, 464);
      ctx.clip();
      const scale = Math.max(324 / portrait.width, 464 / portrait.height);
      const width = portrait.width * scale;
      const height = portrait.height * scale;
      ctx.drawImage(portrait, 783 + (324 - width) / 2, 81 + (464 - height) / 2, width, height);
      ctx.restore();
    }
  }
  ctx.fillStyle = "#f2b544";
  ctx.font = "bold 64px Georgia";
  ctx.fillText(traveler.name, 80, 140);
  ctx.fillStyle = "#ead7ad";
  ctx.font = "34px Georgia";
  wrapCanvasText(ctx, `${traveler.faction} · ${traveler.people} · ${traveler.situation}${traveler.guild ? ` · ${traveler.guild}` : ""}`, 80, 210, traveler.portrait ? 650 : 1040, 44);
  ctx.fillStyle = "#caa35f";
  ctx.font = "28px Georgia";
  wrapCanvasText(ctx, `Rumeur : ${traveler.rumor}`, 80, 310, traveler.portrait ? 650 : 1040, 38);
  ctx.fillStyle = "#f2b544";
  ctx.font = "24px Georgia";
  wrapCanvasText(ctx, `${traveler.reason} · ${traveler.rp}`, 80, 385, traveler.portrait ? 650 : 1040, 32);
  if (traveler.recentHistory) {
    ctx.fillStyle = "#caa35f";
    ctx.font = "22px Georgia";
    wrapCanvasText(ctx, `Chronique : ${traveler.recentHistory}`, 80, 435, traveler.portrait ? 650 : 1040, 30);
  }
  if (traveler.description) {
    ctx.fillStyle = "#ead7ad";
    ctx.font = "22px Georgia";
    wrapCanvasText(ctx, traveler.description, 80, traveler.recentHistory ? 505 : 450, traveler.portrait ? 650 : 1040, 30);
  }
  ctx.fillStyle = "#f2b544";
  ctx.font = "28px Georgia";
  ctx.fillText("Au Feu Dormant", 80, 540);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/jpeg", 0.92);
  link.download = `fiche-${slugify(traveler.name)}.jpg`;
  link.click();
}

function loadCanvasImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function downloadTravelerJpegV2(traveler) {
  const width = 1200;
  const margin = 56;
  const gutter = 34;
  const leftWidth = 520;
  const rightX = margin + leftWidth + gutter;
  const rightWidth = width - rightX - margin;
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  const metaText = `${traveler.faction} - ${traveler.people} - ${traveler.situation}${traveler.guild ? ` - ${traveler.guild}` : ""}`;
  const rumorText = traveler.rumor ? `"${traveler.rumor}"` : "Aucune rumeur publique.";
  const nameLines = canvasLines(tempCtx, traveler.name, rightWidth, "bold 40px Georgia");
  const metaLines = canvasLines(tempCtx, metaText, rightWidth, "29px Georgia");
  const rumorLines = canvasLines(tempCtx, rumorText, rightWidth, "italic 25px Georgia");
  const recentLines = canvasLines(tempCtx, traveler.recentHistory || "Non renseignee.", rightWidth - 40, "22px Georgia");
  const descriptionLines = canvasLines(tempCtx, traveler.description || "Description RP non renseignee.", rightWidth, "23px Georgia");
  const lodgingLines = canvasLines(tempCtx, traveler.lodgingDescription || "Logis non renseigne.", rightWidth, "23px Georgia");
  const rightHeight =
    42 +
    nameLines.length * 46 +
    metaLines.length * 35 +
    rumorLines.length * 32 +
    240 +
    recentLines.length * 29 +
    descriptionLines.length * 31 +
    lodgingLines.length * 31;
  const canvasHeight = Math.max(900, rightHeight + margin * 2, 910);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, width, canvasHeight);
  gradient.addColorStop(0, "#120806");
  gradient.addColorStop(0.45, "#2b160d");
  gradient.addColorStop(1, "#4b2816");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, canvasHeight);
  ctx.strokeStyle = "#f2b544";
  ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, width - 56, canvasHeight - 56);
  ctx.strokeStyle = "rgba(202, 163, 95, 0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(margin - 10, margin - 10, width - (margin - 10) * 2, canvasHeight - (margin - 10) * 2);

  ctx.fillStyle = "#f2b544";
  ctx.font = "bold 17px Arial";
  ctx.fillText("PAGE DU REGISTRE", margin, margin + 18);

  const portraitX = margin;
  const portraitY = margin + 48;
  const portraitHeight = Math.min(760, canvasHeight - portraitY - margin - 20);
  ctx.save();
  ctx.strokeStyle = "#caa35f";
  ctx.lineWidth = 3;
  ctx.strokeRect(portraitX, portraitY, leftWidth, portraitHeight);
  if (traveler.portrait) {
    const portrait = await loadCanvasImage(traveler.portrait);
    if (portrait) {
      ctx.beginPath();
      ctx.rect(portraitX + 4, portraitY + 4, leftWidth - 8, portraitHeight - 8);
      ctx.clip();
      const scale = Math.max((leftWidth - 8) / portrait.width, (portraitHeight - 8) / portrait.height);
      const imageWidth = portrait.width * scale;
      const imageHeight = portrait.height * scale;
      ctx.drawImage(portrait, portraitX + 4 + (leftWidth - 8 - imageWidth) / 2, portraitY + 4 + (portraitHeight - 8 - imageHeight) / 2, imageWidth, imageHeight);
    } else {
      drawInitialPortrait(ctx, traveler.name, portraitX, portraitY, leftWidth, portraitHeight);
    }
  } else {
    drawInitialPortrait(ctx, traveler.name, portraitX, portraitY, leftWidth, portraitHeight);
  }
  ctx.restore();

  let y = margin + 22;
  ctx.fillStyle = "#f2b544";
  ctx.font = "bold 40px Georgia";
  drawCanvasLines(ctx, nameLines, rightX, y, 46);
  y += nameLines.length * 46 + 10;

  ctx.fillStyle = "#ead7ad";
  ctx.font = "29px Georgia";
  drawCanvasLines(ctx, metaLines, rightX, y, 35);
  y += metaLines.length * 35 + 18;

  ctx.fillStyle = "#caa35f";
  ctx.font = "italic 25px Georgia";
  drawCanvasLines(ctx, rumorLines, rightX, y, 32);
  y += rumorLines.length * 32 + 28;

  const panelY = y;
  const panelHeight = 154 + recentLines.length * 29;
  ctx.fillStyle = "rgba(16, 13, 11, 0.46)";
  ctx.fillRect(rightX, panelY, rightWidth, panelHeight);
  ctx.strokeStyle = "rgba(242, 181, 68, 0.42)";
  ctx.lineWidth = 2;
  ctx.strokeRect(rightX, panelY, rightWidth, panelHeight);
  drawSmallLabel(ctx, "CE QUI L'AMENE AU FEU DORMANT", rightX + 22, y + 34);
  drawValue(ctx, traveler.reason, rightX + 22, y + 62);
  drawSmallLabel(ctx, "RP RECHERCHE", rightX + 22, y + 98);
  drawValue(ctx, traveler.rp, rightX + 22, y + 126);
  drawSmallLabel(ctx, "CHRONIQUE RECENTE", rightX + 22, y + 164);
  ctx.fillStyle = "#ead7ad";
  ctx.font = "22px Georgia";
  drawCanvasLines(ctx, recentLines, rightX + 22, y + 192, 29);
  y += panelHeight + 36;

  drawSmallLabel(ctx, "DESCRIPTION RP", rightX, y);
  y += 30;
  ctx.fillStyle = "#ead7ad";
  ctx.font = "23px Georgia";
  drawCanvasLines(ctx, descriptionLines, rightX, y, 31);
  y += descriptionLines.length * 31 + 36;

  drawSmallLabel(ctx, "DESCRIPTION DU LOGIS", rightX, y);
  y += 30;
  ctx.fillStyle = "#ead7ad";
  ctx.font = "23px Georgia";
  drawCanvasLines(ctx, lodgingLines, rightX, y, 31);

  ctx.fillStyle = "#f2b544";
  ctx.font = "bold 26px Georgia";
  ctx.fillText("Au Feu Dormant", margin, canvasHeight - 58);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/jpeg", 0.92);
  link.download = `fiche-${slugify(traveler.name)}.jpg`;
  link.click();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  words.forEach((word) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = `${word} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, x, y);
}

function canvasLines(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line.trim());
      line = `${word} `;
    } else {
      line = testLine;
    }
  });
  if (line.trim()) lines.push(line.trim());
  return lines.length ? lines : [""];
}

function drawCanvasLines(ctx, lines, x, y, lineHeight) {
  lines.forEach((line) => {
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
}

function drawSmallLabel(ctx, text, x, y) {
  ctx.fillStyle = "#f2b544";
  ctx.font = "bold 15px Arial";
  ctx.fillText(text, x, y);
}

function drawValue(ctx, text, x, y) {
  ctx.fillStyle = "#fff2cf";
  ctx.font = "bold 21px Georgia";
  ctx.fillText(text || "Non renseigne.", x, y);
}

function drawInitialPortrait(ctx, name, x, y, width, height) {
  const gradient = ctx.createRadialGradient(x + width / 2, y + height / 2, 20, x + width / 2, y + height / 2, width / 1.4);
  gradient.addColorStop(0, "rgba(242, 181, 68, 0.32)");
  gradient.addColorStop(1, "rgba(16, 13, 11, 0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
  ctx.fillStyle = "#f2b544";
  ctx.font = "bold 76px Georgia";
  ctx.textAlign = "center";
  ctx.fillText(initials(name), x + width / 2, y + height / 2 + 24);
  ctx.textAlign = "left";
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function labelStatus(status) {
  return {
    disponible: "Disponible",
    encours: "En cours",
    terminee: "Terminée",
    archivee: "Archivée"
  }[status] || status;
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function flash(message) {
  const notice = document.createElement("div");
  notice.className = "toast";
  notice.textContent = message;
  document.body.append(notice);
  setTimeout(() => notice.remove(), 1800);
}

renderTravelers();
renderQuests();
renderRumors();
if (location.hash.startsWith("#voyageur-")) {
  renderTravelerDetail(location.hash.replace("#voyageur-", ""));
}

async function loadOnlinePortalData() {
  if (!window.afdSupabase) return;
  try {
    const onlineData = await window.afdSupabase.loadState({ travelers, quests, rumors: window.afdRumors || [] });
    if (Array.isArray(onlineData.travelers)) travelers = onlineData.travelers;
    if (Array.isArray(onlineData.quests)) quests = onlineData.quests;
    if (Array.isArray(onlineData.rumors)) window.afdRumors = onlineData.rumors;
    showAllTravelers = false;
    showAllQuests = false;
    showAllRumors = false;
    renderTravelers();
    renderQuests(currentQuestFilter);
    renderRumors();
    if (location.hash.startsWith("#voyageur-")) {
      renderTravelerDetail(location.hash.replace("#voyageur-", ""));
    }
  } catch (error) {
    console.warn("Registre Supabase indisponible, donnees locales utilisees.", error);
  }
}

loadOnlinePortalData();
