const STORAGE_KEY = "afdConsoleRpV2";
const INITIAL_SKILL_POINTS = 15;
const INITIAL_TALENT_POINTS = 3;
const TALENT_POINT_RULE_VERSION = 1;

const DEFAULT_SKILLS = [
  { id: "survie", name: "Survie", description: "Tenir sur la route, lire les traces, eviter les pieges naturels." },
  { id: "negociation", name: "Negociation", description: "Obtenir un accord, marchander, convaincre sans violence." },
  { id: "discretion", name: "Discretion", description: "Passer sans bruit, disparaitre dans une foule, observer sans etre vu." },
  { id: "combat", name: "Combat", description: "Tenir une arme, proteger un allie, survivre a une escarmouche." },
  { id: "artisanat", name: "Artisanat", description: "Reparer, fabriquer, identifier la valeur d'un objet." },
  { id: "erudition", name: "Erudition", description: "Connaitre les textes, les peuples, les symboles et les vieilles histoires." }
];

const DEFAULT_TALENTS = [
  { id: "oreille-comptoir", name: "Oreille du comptoir", cost: 1, description: "Le personnage capte plus facilement les rumeurs utiles." },
  { id: "main-ferme", name: "Main ferme", cost: 1, description: "Le personnage garde son calme sous pression." },
  { id: "pas-feutres", name: "Pas feutres", cost: 1, description: "Le personnage gagne un avantage narratif en infiltration." },
  { id: "sang-froid", name: "Sang-froid", cost: 2, description: "Une fois par intrigue, le personnage peut ignorer une intimidation." },
  { id: "nom-qui-circule", name: "Nom qui circule", cost: 2, description: "La notoriete progresse plus vite quand une action est publique." }
];

const DEFAULT_FACTIONS = [
  { id: "hector", name: "Les Gens d'Hector", image: "", bonus: "+1 point social lorsque l'auberge est impliquee.", description: "Ceux qui rendent service au comptoir avant de demander une faveur." },
  { id: "routes", name: "Les Routes Salees", image: "", bonus: "+1 en Survie lors des voyages ou affaires maritimes.", description: "Marins, convoyeurs, guides et voyageurs qui sentent encore le sel." },
  { id: "plumes", name: "Les Plumes Blanches", image: "", bonus: "+1 en Negociation quand une rumeur peut changer l'issue.", description: "Informateurs, faussaires, messagers et diplomates de l'ombre." },
  { id: "clefs", name: "Les Clefs Rouillees", image: "", bonus: "+1 en Discretion pour entrer, sortir ou ouvrir sans bruit.", description: "Ceux qui trouvent toujours une porte, meme quand elle n'existe pas." },
  { id: "jardin", name: "Le Jardin Clos", image: "", bonus: "+1 en Erudition pour herbes, poisons, remedes et substances.", description: "Alchimistes discrets, soigneurs troubles et connaisseurs de recettes interdites." }
];

const DEFAULT_VAULT = [
  {
    id: "item-lanterne",
    name: "Lanterne a huile",
    image: "",
    price: 12,
    quantity: 6,
    description: "Une lanterne solide pour les routes sombres et les caves trop silencieuses."
  },
  {
    id: "item-carte",
    name: "Carte annotee",
    image: "",
    price: 35,
    quantity: 2,
    description: "Des chemins, des ratures, et quelques notes qu'Hector refuse d'expliquer."
  }
];

function createCharacter() {
  return {
    id: uid("char"),
    name: "Thorring",
    portrait: "",
    people: "Humain",
    profession: "Aventurier",
    guild: "",
    factionId: "hector",
    reputation: "Neutre",
    notoriety: "Inconnu",
    balance: 120,
    inventory: [],
    level: 1,
    xp: 0,
    xpNext: 100,
    skillPoints: INITIAL_SKILL_POINTS,
    talentPoints: INITIAL_TALENT_POINTS,
    skills: Object.fromEntries(DEFAULT_SKILLS.map(skill => [skill.id, 0])),
    talents: [],
    activeQuests: [],
    completedQuests: [],
    rumor: "On dit qu'il paie toujours sa premiere tournee.",
    story: "Un voyageur qui cherche encore la bonne table et la bonne histoire.",
    lodge: "Un lit simple, un coffre ferme, et une lanterne qui reste allumee tard.",
    notesPublic: "",
    notesPrivate: "",
    history: ["Fiche creee au registre."]
  };
}

function createPlayerDraft() {
  const character = createCharacter();
  return {
    ...character,
    name: "",
    people: "",
    profession: "",
    guild: "",
    reputation: "A valider",
    notoriety: "Inconnu",
    balance: 0,
    level: 1,
    xp: 0,
    xpNext: 100,
    skillPoints: INITIAL_SKILL_POINTS,
    talentPoints: INITIAL_TALENT_POINTS,
    rumor: "",
    story: "",
    lodge: "",
    notesPublic: "Fiche creee par le joueur, a completer par le MJ.",
    notesPrivate: "",
    history: ["Fiche creee par le joueur. En attente de validation MJ."]
  };
}

function starterState() {
  const character = createCharacter();
  character.id = "char-thorring";
  const second = createCharacter();
  second.id = "char-maelys";
  second.name = "Maelys Cornebrume";
  second.people = "Humaine";
  second.profession = "Exploratrice";
  second.factionId = "routes";
  second.balance = 90;
  second.rumor = "Elle paie toujours ses dettes, mais jamais avec la meme monnaie.";
  const third = createCharacter();
  third.id = "char-gorvak";
  third.name = "Gorvak Brise-Amarre";
  third.people = "Orc";
  third.profession = "Marin";
  third.factionId = "clefs";
  third.balance = 70;
  third.rumor = "On dit qu'il connait trois routes maritimes qui n'existent sur aucune carte.";
  return {
    version: 2,
    talentPointRuleVersion: TALENT_POINT_RULE_VERSION,
    activeCharacterId: character.id,
    role: "player",
    gmUnlocked: false,
    characters: [character, second, third],
    factions: DEFAULT_FACTIONS,
    vault: DEFAULT_VAULT,
    skillCatalog: DEFAULT_SKILLS,
    talentCatalog: DEFAULT_TALENTS,
    quests: [
      {
        id: "quest-tonneau",
        title: "Le tonneau qui murmure",
        status: "Disponible",
        type: "Enquete",
        level: 1,
        reward: "50 XP et une faveur mineure",
        description: "Un tonneau livre au Feu Dormant emet des coups depuis l'interieur. Hector veut des volontaires avant de l'ouvrir.",
        acceptedBy: []
      },
      {
        id: "quest-lanterne",
        title: "La lanterne eteinte",
        status: "Disponible",
        type: "Escorte",
        level: 2,
        reward: "80 XP et notoriete locale",
        description: "La lanterne du vieux quai ne brille plus. Les derniers qui sont alles voir ne sont pas revenus au comptoir.",
        acceptedBy: []
      }
    ],
    requests: [],
    log: ["Application V2 initialisee."]
  };
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved.version === 2) return normalizeState(saved);
  } catch (error) {
    console.warn(error);
  }
  const fresh = starterState();
  saveState(fresh);
  return fresh;
}

function spentSkillCount(skills = {}) {
  return Object.values(skills || {}).reduce((total, value) => total + Math.max(0, Math.trunc(Number(value)) || 0), 0);
}

function normalizeSkillPoints(value, skills = {}) {
  const points = Math.trunc(Number(value));
  if (!Number.isFinite(points)) return 15;
  if (points === 0 && spentSkillCount(skills) === 0) return 15;
  return Math.max(0, points);
}

function talentPointAllowance(level) {
  const normalizedLevel = Math.max(1, Math.trunc(Number(level)) || 1);
  return INITIAL_TALENT_POINTS + normalizedLevel - 1;
}

function spentTalentPoints(talents = [], catalog = DEFAULT_TALENTS) {
  const costs = new Map(catalog.map(item => [
    item.id,
    Math.max(0, Math.trunc(Number(item.cost)) || 0)
  ]));

  return (Array.isArray(talents) ? talents : []).reduce(
    (total, talentId) => total + (costs.get(talentId) || 0),
    0
  );
}

function normalizeState(saved) {
  saved.characters = Array.isArray(saved.characters) && saved.characters.length ? saved.characters : starterState().characters;
  saved.factions = Array.isArray(saved.factions) && saved.factions.length ? saved.factions : DEFAULT_FACTIONS;
  saved.vault = Array.isArray(saved.vault) ? saved.vault : DEFAULT_VAULT;
  saved.skillCatalog = Array.isArray(saved.skillCatalog) ? saved.skillCatalog : DEFAULT_SKILLS;
  saved.talentCatalog = Array.isArray(saved.talentCatalog) ? saved.talentCatalog : DEFAULT_TALENTS;
  const migrateTalentPointRule = saved.talentPointRuleVersion !== TALENT_POINT_RULE_VERSION;
  saved.quests = Array.isArray(saved.quests) ? saved.quests : [];
  saved.requests = Array.isArray(saved.requests) ? saved.requests : [];
  saved.requests = saved.requests.map(item => ({
    id: item.id || uid("request"),
    characterId: item.characterId || "",
    characterName: item.characterName || "",
    type: item.type || "general",
    title: item.title || "Demande MJ",
    message: item.message || "",
    status: item.status || "En attente",
    createdAt: item.createdAt || "",
    resolvedAt: item.resolvedAt || "",
    response: item.response || ""
  }));
  saved.log = Array.isArray(saved.log) ? saved.log : [];
  saved.activeCharacterId = saved.characters.some(item => item.id === saved.activeCharacterId) ? saved.activeCharacterId : saved.characters[0].id;
  saved.factions = saved.factions.map(item => ({ image: "", ...item }));
  saved.vault = saved.vault.map(item => ({
    image: "",
    price: 0,
    quantity: 0,
    description: "",
    ...item,
    image: String(item.image || "").trim()
  }));
  const vaultById = Object.fromEntries(saved.vault.map(item => [item.id, item]));
  saved.characters = saved.characters.map(item => ({
    ...createCharacter(),
    ...item,
    level: Math.max(1, Math.trunc(Number(item.level)) || 1),
    xp: Math.max(0, Math.trunc(Number(item.xp)) || 0),
    xpNext: Math.max(1, Math.trunc(Number(item.xpNext)) || 100),
    skillPoints: normalizeSkillPoints(item.skillPoints, item.skills),
    talentPoints: migrateTalentPointRule
      ? Math.max(0, talentPointAllowance(item.level) - spentTalentPoints(item.talents, saved.talentCatalog))
      : Math.max(0, Math.trunc(Number(item.talentPoints)) || 0),
    balance: Number.isFinite(Number(item.balance)) ? Number(item.balance) : 0,
    inventory: Array.isArray(item.inventory)
      ? item.inventory.map(entry => {
        const source = vaultById[entry?.id] || {};
        return {
          id: entry?.id || uid("item"),
          name: entry?.name || source.name || "Objet",
          image: String(entry?.image || source.image || "").trim(),
          price: Number.isFinite(Number(entry?.price ?? source.price)) ? Number(entry?.price ?? source.price) : 0,
          quantity: Math.max(1, Number(entry?.quantity) || 1),
          description: entry?.description || source.description || ""
        };
      })
      : [],
    skills: { ...Object.fromEntries(DEFAULT_SKILLS.map(skill => [skill.id, 0])), ...(item.skills || {}) },
    talents: Array.isArray(item.talents) ? item.talents : [],
    activeQuests: Array.isArray(item.activeQuests) ? item.activeQuests : [],
    completedQuests: Array.isArray(item.completedQuests) ? item.completedQuests : [],
    history: Array.isArray(item.history) ? item.history : []
  }));
  saved.talentPointRuleVersion = TALENT_POINT_RULE_VERSION;
  saveState(saved);
  return saved;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  const fresh = starterState();
  saveState(fresh);
  return fresh;
}
