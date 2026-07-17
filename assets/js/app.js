let state = loadState();
let currentView = "dashboard";
let vaultPage = 1;
let vaultFilter = "all";
let onlineMode = false;
let onlineBusy = false;
let onlineSession = null;

const VAULT_PAGE_SIZE = 8;
const MAX_LEVEL = 20;
const FINAL_LEVEL_XP = 20000;

normalizeProgressionState();

const ITEM_IMAGE_BANK = [
  {
    id: "outil-orbe-impulsion",
    category: "Outils",
    name: "Orbe d'impulsion",
    src: "assets/images/item-bank/outil-orbe-impulsion.png"
  },
  {
    id: "outil-crochet-rouge",
    category: "Outils",
    name: "Crochet mordant",
    src: "assets/images/item-bank/outil-crochet-rouge.png"
  },
  {
    id: "outil-cle-argentee",
    category: "Outils",
    name: "Cle argentee",
    src: "assets/images/item-bank/outil-cle-argentee.png"
  },
  {
    id: "outil-cle-doree",
    category: "Outils",
    name: "Cle doree",
    src: "assets/images/item-bank/outil-cle-doree.png"
  },
  {
    id: "arme-dague-rustique",
    category: "Armes legeres",
    name: "Dague rustique",
    src: "assets/images/item-bank/arme-dague-rustique.png"
  },
  {
    id: "arme-dague-lancee",
    category: "Armes legeres",
    name: "Dague de lancer",
    src: "assets/images/item-bank/arme-dague-lancee.png"
  },
  {
    id: "arme-lame-verte",
    category: "Armes legeres",
    name: "Lame verte",
    src: "assets/images/item-bank/arme-lame-verte.png"
  },
  {
    id: "potion-flacon-vert",
    category: "Potions",
    name: "Flacon verdoyant",
    src: "assets/images/item-bank/potion-flacon-vert.png"
  },
  {
    id: "potion-fiole-ronde-verte",
    category: "Potions",
    name: "Fiole ronde verte",
    src: "assets/images/item-bank/potion-fiole-ronde-verte.png"
  },
  {
    id: "potion-fiole-ceinture",
    category: "Potions",
    name: "Fiole de ceinture",
    src: "assets/images/item-bank/potion-fiole-ceinture.png"
  },
  {
    id: "potion-cristal-turquoise",
    category: "Potions",
    name: "Cristal turquoise",
    src: "assets/images/item-bank/potion-cristal-turquoise.png"
  },
  {
    id: "potion-flacon-geometrique",
    category: "Potions",
    name: "Flacon geometrique",
    src: "assets/images/item-bank/potion-flacon-geometrique.png"
  },
  {
    id: "potion-symbole-venin",
    category: "Potions",
    name: "Symbole de venin",
    src: "assets/images/item-bank/potion-symbole-venin.png"
  },
  {
    id: "potion-materiel-alchimie",
    category: "Potions",
    name: "Materiel d'alchimie",
    src: "assets/images/item-bank/potion-materiel-alchimie.png"
  },
  {
    id: "sac-bourse-doree",
    category: "Sacs",
    name: "Bourse doree",
    src: "assets/images/item-bank/sac-bourse-doree.png"
  },
  {
    id: "sac-besace-toilee",
    category: "Sacs",
    name: "Besace toilee",
    src: "assets/images/item-bank/sac-besace-toilee.png"
  },
  {
    id: "sac-besace-cuir",
    category: "Sacs",
    name: "Besace de cuir",
    src: "assets/images/item-bank/sac-besace-cuir.png"
  },
  {
    id: "sac-sacoche-outils",
    category: "Sacs",
    name: "Sacoche d'outils",
    src: "assets/images/item-bank/sac-sacoche-outils.png"
  },
  {
    id: "sac-bourse-pieces",
    category: "Sacs",
    name: "Bourse de pieces",
    src: "assets/images/item-bank/sac-bourse-pieces.png"
  },
  {
    id: "projectile-carreaux",
    category: "Projectiles",
    name: "Carreaux affutes",
    src: "assets/images/item-bank/projectile-carreaux.png"
  },
  {
    id: "artefact-hache-sombre",
    category: "Artefacts sombres",
    name: "Hache sombre",
    src: "assets/images/item-bank/artefact-hache-sombre.png"
  },
  {
    id: "artefact-main-sombre",
    category: "Artefacts sombres",
    name: "Main sombre",
    src: "assets/images/item-bank/artefact-main-sombre.png"
  },
  {
    id: "artefact-pistolet-sombre",
    category: "Artefacts sombres",
    name: "Pistolet sombre",
    src: "assets/images/item-bank/artefact-pistolet-sombre.png"
  },
  {
    id: "artefact-crochet-sombre",
    category: "Artefacts sombres",
    name: "Crochet sombre",
    src: "assets/images/item-bank/artefact-crochet-sombre.png"
  },
  {
    id: "artefact-baton-sombre",
    category: "Artefacts sombres",
    name: "Baton sombre",
    src: "assets/images/item-bank/artefact-baton-sombre.png"
  },
  {
    id: "artefact-dague-sombre",
    category: "Artefacts sombres",
    name: "Dague sombre",
    src: "assets/images/item-bank/artefact-dague-sombre.png"
  },
  {
    id: "document-note-cachetee",
    category: "Documents",
    name: "Note cachetee",
    src: "assets/images/item-bank/document-note-cachetee.png"
  },
  {
    id: "document-carte-ancienne",
    category: "Documents",
    name: "Carte ancienne",
    src: "assets/images/item-bank/document-carte-ancienne.png"
  },
  {
    id: "document-lettre-marquee",
    category: "Documents",
    name: "Lettre marquee",
    src: "assets/images/item-bank/document-lettre-marquee.png"
  },
  {
    id: "contrat-poignee-violette",
    category: "Contrats",
    name: "Accord trouble",
    src: "assets/images/item-bank/contrat-poignee-violette.png"
  },
  {
    id: "contrat-poignee-verte",
    category: "Contrats",
    name: "Accord veneneux",
    src: "assets/images/item-bank/contrat-poignee-verte.png"
  },
  {
    id: "contrat-humain-affiche",
    category: "Contrats",
    name: "Affiche humaine",
    src: "assets/images/item-bank/contrat-humain-affiche.png"
  },
  {
    id: "contrat-orc-affiche",
    category: "Contrats",
    name: "Affiche orque",
    src: "assets/images/item-bank/contrat-orc-affiche.png"
  },
  {
    id: "contrat-echange-main",
    category: "Contrats",
    name: "Echange scelle",
    src: "assets/images/item-bank/contrat-echange-main.png"
  },
  {
    id: "soin-trousse-medicale",
    category: "Soins",
    name: "Trousse medicale",
    src: "assets/images/item-bank/soin-trousse-medicale.png"
  },
  {
    id: "ressource-minerai-dore",
    category: "Ressources",
    name: "Minerai dore",
    src: "assets/images/item-bank/ressource-minerai-dore.png"
  },
  {
    id: "ressource-pepites-dorees",
    category: "Ressources",
    name: "Pepites dorees",
    src: "assets/images/item-bank/ressource-pepites-dorees.png"
  },
  {
    id: "ressource-lingot-brut",
    category: "Ressources",
    name: "Lingot brut",
    src: "assets/images/item-bank/ressource-lingot-brut.png"
  },
  {
    id: "ressource-pierre-grise",
    category: "Ressources",
    name: "Pierre grise",
    src: "assets/images/item-bank/ressource-pierre-grise.png"
  },
  {
    id: "materiel-pelles",
    category: "Materiel",
    name: "Pelles de chantier",
    src: "assets/images/item-bank/materiel-pelles.png"
  },
  {
    id: "ressource-foin",
    category: "Ressources",
    name: "Botte de foin",
    src: "assets/images/item-bank/ressource-foin.png"
  },
  {
    id: "ressource-planches",
    category: "Ressources",
    name: "Planches",
    src: "assets/images/item-bank/ressource-planches.png"
  },
  {
    id: "ressource-bois-caisse",
    category: "Ressources",
    name: "Bois de caisse",
    src: "assets/images/item-bank/ressource-bois-caisse.png"
  },
  {
    id: "construction-toit-clair",
    category: "Construction",
    name: "Toiture claire",
    src: "assets/images/item-bank/construction-toit-clair.png"
  },
  {
    id: "construction-toit-brun",
    category: "Construction",
    name: "Toiture brune",
    src: "assets/images/item-bank/construction-toit-brun.png"
  },
  {
    id: "construction-tonneau",
    category: "Construction",
    name: "Tonneau renforce",
    src: "assets/images/item-bank/construction-tonneau.png"
  },
  {
    id: "menace-crane-rouge",
    category: "Menaces",
    name: "Crane rouge",
    src: "assets/images/item-bank/menace-crane-rouge.png"
  },
  {
    id: "document-prime-recherche",
    category: "Documents",
    name: "Prime de recherche",
    src: "assets/images/item-bank/document-prime-recherche.png"
  },
  {
    id: "document-portrait-recherche",
    category: "Documents",
    name: "Portrait recherche",
    src: "assets/images/item-bank/document-portrait-recherche.png"
  },
  {
    id: "document-avis-femme",
    category: "Documents",
    name: "Avis portrait femme",
    src: "assets/images/item-bank/document-avis-femme.png"
  },
  {
    id: "document-avis-capuche",
    category: "Documents",
    name: "Avis silhouette",
    src: "assets/images/item-bank/document-avis-capuche.png"
  },
  {
    id: "insigne-rouage-rouge",
    category: "Insignes",
    name: "Rouage rouge",
    src: "assets/images/item-bank/insigne-rouage-rouge.png"
  },
  {
    id: "insigne-poing-metal",
    category: "Insignes",
    name: "Poing de metal",
    src: "assets/images/item-bank/insigne-poing-metal.png"
  },
  {
    id: "portrait-garde-casque",
    category: "Portraits",
    name: "Garde casque",
    src: "assets/images/item-bank/portrait-garde-casque.png"
  },
  {
    id: "portrait-homme-roux",
    category: "Portraits",
    name: "Homme roux",
    src: "assets/images/item-bank/portrait-homme-roux.png"
  },
  {
    id: "portrait-mascotte-brune",
    category: "Portraits",
    name: "Mascotte brune",
    src: "assets/images/item-bank/portrait-mascotte-brune.png"
  },
  {
    id: "secret-silhouette-violette",
    category: "Secrets",
    name: "Silhouette violette",
    src: "assets/images/item-bank/secret-silhouette-violette.png"
  },
  {
    id: "secret-oeil-triangle",
    category: "Secrets",
    name: "Oeil triangle",
    src: "assets/images/item-bank/secret-oeil-triangle.png"
  },
  {
    id: "monnaie-rouge",
    category: "Monnaies",
    name: "Jeton rouge",
    src: "assets/images/item-bank/monnaie-rouge.png"
  },
  {
    id: "monnaie-bleue",
    category: "Monnaies",
    name: "Jeton bleu",
    src: "assets/images/item-bank/monnaie-bleue.png"
  },
  {
    id: "monnaie-doree",
    category: "Monnaies",
    name: "Jeton dore",
    src: "assets/images/item-bank/monnaie-doree.png"
  },
  {
    id: "plan-fiole-bleue",
    category: "Plans",
    name: "Plan fiole bleue",
    src: "assets/images/item-bank/plan-fiole-bleue.png"
  },
  {
    id: "plan-fiole-rouge",
    category: "Plans",
    name: "Plan fiole rouge",
    src: "assets/images/item-bank/plan-fiole-rouge.png"
  },
  {
    id: "plan-fiole-orange",
    category: "Plans",
    name: "Plan fiole orange",
    src: "assets/images/item-bank/plan-fiole-orange.png"
  },
  {
    id: "plan-flamme-verte",
    category: "Plans",
    name: "Plan flamme verte",
    src: "assets/images/item-bank/plan-flamme-verte.png"
  },
  {
    id: "plan-flamme-rouge",
    category: "Plans",
    name: "Plan flamme rouge",
    src: "assets/images/item-bank/plan-flamme-rouge.png"
  },
  {
    id: "plan-flamme-blanche",
    category: "Plans",
    name: "Plan flamme blanche",
    src: "assets/images/item-bank/plan-flamme-blanche.png"
  },
  {
    id: "plan-rouage-bronze",
    category: "Plans",
    name: "Plan rouage bronze",
    src: "assets/images/item-bank/plan-rouage-bronze.png"
  },
  {
    id: "plan-rouage-argent",
    category: "Plans",
    name: "Plan rouage argent",
    src: "assets/images/item-bank/plan-rouage-argent.png"
  },
  {
    id: "plan-rouage-or",
    category: "Plans",
    name: "Plan rouage or",
    src: "assets/images/item-bank/plan-rouage-or.png"
  },
  {
    id: "plan-lame-orange",
    category: "Plans",
    name: "Plan lame orange",
    src: "assets/images/item-bank/plan-lame-orange.png"
  },
  {
    id: "plan-lame-verte",
    category: "Plans",
    name: "Plan lame verte",
    src: "assets/images/item-bank/plan-lame-verte.png"
  },
  {
    id: "plan-lame-bleue",
    category: "Plans",
    name: "Plan lame bleue",
    src: "assets/images/item-bank/plan-lame-bleue.png"
  },
  {
    id: "marque-coeur-epee",
    category: "Marques",
    name: "Marque coeur epee",
    src: "assets/images/item-bank/marque-coeur-epee.png"
  },
  {
    id: "marque-flacon-rouge",
    category: "Marques",
    name: "Marque flacon rouge",
    src: "assets/images/item-bank/marque-flacon-rouge.png"
  },
  {
    id: "ambiance-feu-camp",
    category: "Ambiances",
    name: "Feu de camp",
    src: "assets/images/item-bank/ambiance-feu-camp.png"
  },
  {
    id: "magie-silhouette-verte",
    category: "Magie",
    name: "Silhouette verte",
    src: "assets/images/item-bank/magie-silhouette-verte.png"
  },
  {
    id: "banniere-crane-vert",
    category: "Bannieres",
    name: "Banniere crane vert",
    src: "assets/images/item-bank/banniere-crane-vert.png"
  },
  {
    id: "banniere-rouge-sombre",
    category: "Bannieres",
    name: "Banniere rouge sombre",
    src: "assets/images/item-bank/banniere-rouge-sombre.png"
  },
  {
    id: "tenue-cuir-noir",
    category: "Tenues",
    name: "Tenue cuir noir",
    src: "assets/images/item-bank/tenue-cuir-noir.png"
  },
  {
    id: "tabard-bleu",
    category: "Tenues",
    name: "Tabard bleu",
    src: "assets/images/item-bank/tabard-bleu.png"
  },
  {
    id: "tabard-rouge",
    category: "Tenues",
    name: "Tabard rouge",
    src: "assets/images/item-bank/tabard-rouge.png"
  },
  {
    id: "lieu-campement-dore",
    category: "Lieux",
    name: "Campement dore",
    src: "assets/images/item-bank/lieu-campement-dore.png"
  },
  {
    id: "lieu-desert-lunaire",
    category: "Lieux",
    name: "Desert lunaire",
    src: "assets/images/item-bank/lieu-desert-lunaire.png"
  },
  {
    id: "lieu-marais-vert",
    category: "Lieux",
    name: "Marais vert",
    src: "assets/images/item-bank/lieu-marais-vert.png"
  },
  {
    id: "lieu-canyon-rocheux",
    category: "Lieux",
    name: "Canyon rocheux",
    src: "assets/images/item-bank/lieu-canyon-rocheux.png"
  },
  {
    id: "lieu-plaine-lunaire",
    category: "Lieux",
    name: "Plaine lunaire",
    src: "assets/images/item-bank/lieu-plaine-lunaire.png"
  }
];

const viewTitles = {
  dashboard: ["Prototype V2", "Tableau de bord RP"],
  player: ["Fiche joueur", "Votre personnage"],
  skills: ["Progression", "Competences"],
  talents: ["Progression", "Talents"],
  quests: ["Tableau vivant", "Quetes"],
  factions: ["Registre MJ", "Allegeances"],
  vault: ["Organisation", "Coffre"],
  requests: ["Bureau du MJ", "Demandes"],
  gm: ["Atelier MJ", "Tout modifier"]
};

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav) {
    currentView = nav.dataset.view;
    render();
  }

  const role = event.target.closest("[data-role]");
  if (role) {
    if (role.dataset.role === "gm" && isOnline() && !isStaff()) {
      toast("Acces reserve aux maitres de jeu.");
      return;
    }
    if (role.dataset.role === "gm" && !isOnline() && !state.gmUnlocked) return openGmLogin();
    state.role = role.dataset.role;
    if (role.dataset.role === "gm") currentView = "gm";
    saveAndRender("Mode change.");
  }

  if (event.target.closest("[data-export]")) exportState();
  if (event.target.closest("[data-reset]")) {
    if (!isStaff()) {
      toast("Acces reserve aux maitres de jeu.");
      return;
    }
    confirmAction("Reinitialiser le prototype ?", () => {
      state = resetState();
      currentView = "dashboard";
      render();
    });
  }

  if (event.target.closest("[data-player-new-character]")) openPlayerCharacterCreator();

  const acceptQuest = event.target.closest("[data-accept-quest]");
  if (acceptQuest) {
    acceptQuestById(acceptQuest.dataset.acceptQuest);
    return;
  }

  const abandonQuest = event.target.closest("[data-abandon-quest]");
  if (abandonQuest) {
    const quest = state.quests.find(item => item.id === abandonQuest.dataset.abandonQuest);
    confirmAction(`Abandonner la quete "${quest?.title || "selectionnee"}" ?`, () => abandonQuestById(abandonQuest.dataset.abandonQuest));
    return;
  }

  const spendSkill = event.target.closest("[data-spend-skill]");
  if (spendSkill) {
    spendSkillPoint(spendSkill.dataset.spendSkill);
    return;
  }

  const pickTalent = event.target.closest("[data-pick-talent]");
  if (pickTalent) {
    pickTalentById(pickTalent.dataset.pickTalent);
    return;
  }

  const requestBuildReset = event.target.closest("[data-request-build-reset]");
  if (requestBuildReset) {
    createBuildResetRequest();
    return;
  }

  const gmEditCharacter = event.target.closest("[data-gm-edit-character]");
  if (gmEditCharacter) {
    openGmCharacterEditor(gmEditCharacter.dataset.gmEditCharacter);
    return;
  }

  const gmAddXp = event.target.closest("[data-gm-add-xp]");
  if (gmAddXp) {
    openGmXp(gmAddXp.dataset.gmAddXp);
    return;
  }

  const gmQuickXp = event.target.closest("[data-gm-quick-xp]");
  if (gmQuickXp) {
    addGmXp(gmQuickXp.dataset.gmQuickXp, gmQuickXp.dataset.amount);
    return;
  }

  const gmBalance = event.target.closest("[data-gm-balance]");
  if (gmBalance) {
    openGmBalance(gmBalance.dataset.gmBalance);
    return;
  }

  const gmSetBalance = event.target.closest("[data-gm-set-balance]");
  if (gmSetBalance) {
    const id = gmSetBalance.dataset.gmSetBalance;
    const input = Array.from(document.querySelectorAll("[data-gm-balance-input]")).find(item => item.dataset.gmBalanceInput === id);
    setCharacterBalance(id, input?.value, "Solde ajuste depuis l'atelier MJ.");
    return;
  }

  const gmAddPoint = event.target.closest("[data-gm-add-point]");
  if (gmAddPoint) {
    grantPoint(gmAddPoint.dataset.gmAddPoint, gmAddPoint.dataset.kind);
    return;
  }

  const gmResetBuild = event.target.closest("[data-gm-reset-build]");
  if (gmResetBuild) {
    const target = state.characters.find(item => item.id === gmResetBuild.dataset.gmResetBuild);
    confirmAction(`Remettre a zero les competences et talents de ${target?.name || "ce personnage"} ?`, () => resetCharacterBuild(gmResetBuild.dataset.gmResetBuild));
    return;
  }

  const gmApproveRequest = event.target.closest("[data-gm-approve-request]");
  if (gmApproveRequest) {
    confirmAction("Accepter cette demande MJ ?", () => approveRequest(gmApproveRequest.dataset.gmApproveRequest));
    return;
  }

  const gmRejectRequest = event.target.closest("[data-gm-reject-request]");
  if (gmRejectRequest) {
    confirmAction("Refuser cette demande MJ ?", () => rejectRequest(gmRejectRequest.dataset.gmRejectRequest));
    return;
  }

  const gmArchiveRequest = event.target.closest("[data-gm-archive-request]");
  if (gmArchiveRequest) {
    archiveRequest(gmArchiveRequest.dataset.gmArchiveRequest);
    return;
  }

  const gmDeleteCharacter = event.target.closest("[data-gm-delete-character]");
  if (gmDeleteCharacter) {
    confirmAction("Supprimer ce personnage du prototype ?", () => deleteCharacter(gmDeleteCharacter.dataset.gmDeleteCharacter));
    return;
  }

  const gmEditFaction = event.target.closest("[data-gm-edit-faction]");
  if (gmEditFaction) {
    openFactionEditor(gmEditFaction.dataset.gmEditFaction);
    return;
  }

  const gmEditQuest = event.target.closest("[data-gm-edit-quest]");
  if (gmEditQuest) {
    openQuestEditor(gmEditQuest.dataset.gmEditQuest);
    return;
  }

  const gmDeleteQuest = event.target.closest("[data-gm-delete-quest]");
  if (gmDeleteQuest) {
    const quest = state.quests.find(item => item.id === gmDeleteQuest.dataset.gmDeleteQuest);
    confirmAction(`Supprimer la quete "${quest?.title || "selectionnee"}" ?`, () => deleteQuest(gmDeleteQuest.dataset.gmDeleteQuest));
    return;
  }

  const buyItem = event.target.closest("[data-buy-item]");
  if (buyItem) {
    buyVaultItem(buyItem.dataset.buyItem);
    return;
  }

  const vaultPrev = event.target.closest("[data-vault-prev]");
  if (vaultPrev) {
    vaultPage = Math.max(1, vaultPage - 1);
    render();
    return;
  }

  const vaultNext = event.target.closest("[data-vault-next]");
  if (vaultNext) {
    vaultPage += 1;
    render();
    return;
  }

  const gmEditItem = event.target.closest("[data-gm-edit-item]");
  if (gmEditItem) {
    openItemEditor(gmEditItem.dataset.gmEditItem);
    return;
  }

  const gmDeleteItem = event.target.closest("[data-gm-delete-item]");
  if (gmDeleteItem) {
    confirmAction("Supprimer cet objet du coffre ?", () => deleteVaultItem(gmDeleteItem.dataset.gmDeleteItem));
    return;
  }

  const gmRemoveInventory = event.target.closest("[data-gm-remove-inventory]");
  if (gmRemoveInventory) {
    confirmAction("Detruire cet objet de l'inventaire ?", () => removeInventoryItem(gmRemoveInventory.dataset.gmRemoveInventory, gmRemoveInventory.dataset.itemId));
    return;
  }

  const sellInventory = event.target.closest("[data-sell-inventory]");
  if (sellInventory) {
    sellInventoryItem(sellInventory.dataset.characterId, sellInventory.dataset.itemId);
    return;
  }

  const destroyInventory = event.target.closest("[data-destroy-inventory]");
  if (destroyInventory) {
    confirmAction("Detruire cet objet ? Aucun solde ne sera rendu.", () => removeInventoryItem(destroyInventory.dataset.characterId, destroyInventory.dataset.itemId, "player"));
    return;
  }

  const itemBankImage = event.target.closest("[data-item-bank-image]");
  if (itemBankImage) {
    selectItemBankImage(itemBankImage);
    return;
  }

  const saveVaultButton = event.target.closest("[data-save-vault-item]");
  if (saveVaultButton) {
    const form = saveVaultButton.closest("#item-form");
    if (form) {
      event.preventDefault();
      saveVaultItem(form);
      return;
    }
  }

  if (event.target.closest("[data-new-quest]")) {
    openQuestEditor();
    return;
  }
  if (event.target.closest("[data-new-faction]")) {
    openFactionEditor();
    return;
  }
  if (event.target.closest("[data-new-character]")) {
    openGmCharacterEditor();
    return;
  }
  if (event.target.closest("[data-new-item]")) {
    openItemEditor();
    return;
  }
});

document.addEventListener("submit", (event) => {
  const formId = event.target.getAttribute("id");

  if (formId === "gm-login") {
    event.preventDefault();
    if (isOnline() && !isStaff()) return toast("Acces reserve aux maitres de jeu.");
    state.gmUnlocked = true;
    state.role = "gm";
    closeModal();
    saveAndRender("Console MJ ouverte.");
  }

  if (formId === "player-form") {
    event.preventDefault();
    savePlayerForm(event.target);
  }

  if (formId === "player-create-form") {
    event.preventDefault();
    savePlayerCreatedCharacter(event.target);
  }

  if (formId === "gm-character-form") {
    event.preventDefault();
    saveGmCharacter(event.target);
  }

  if (formId === "gm-xp-form") {
    event.preventDefault();
    saveGmXp(event.target);
  }

  if (formId === "gm-balance-form") {
    event.preventDefault();
    saveGmBalance(event.target);
  }

  if (formId === "faction-form") {
    event.preventDefault();
    saveFaction(event.target);
  }

  if (formId === "quest-form") {
    event.preventDefault();
    saveQuest(event.target);
  }

  if (formId === "item-form") {
    event.preventDefault();
    saveVaultItem(event.target);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "portrait-file") loadPortrait(event.target);
  if (event.target.id === "faction-image-file") loadFormImage(event.target, "faction-image-value", "faction-image-preview");
  if (event.target.id === "item-image-file") loadFormImage(event.target, "item-image-value", "item-image-preview");
  if (event.target.matches("[data-vault-filter]")) {
    vaultFilter = event.target.value;
    vaultPage = 1;
    render();
  }
  if (event.target.matches("[data-active-character]")) {
    state.activeCharacterId = event.target.value;
    if (isOnline()) window.AFDOnline.rememberActiveCharacter(state.activeCharacterId);
    saveAndRender("Personnage actif change.");
  }
});

function character() {
  return state.characters.find(item => item.id === state.activeCharacterId) || state.characters[0];
}

function isOnline() {
  return onlineMode && Boolean(window.AFDOnline?.configured);
}

function isStaff() {
  return ["mj", "admin", "administrateur"].includes(state.profile?.role) || state.gmUnlocked === true;
}

function faction(id) {
  return state.factions.find(item => item.id === id);
}

function render() {
  if (!document.getElementById("main-panel")) return;
  if (!isStaff() && ["gm", "requests"].includes(currentView)) currentView = "dashboard";
  document.querySelectorAll("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === currentView));
  document.querySelectorAll("[data-role]").forEach(button => button.classList.toggle("active", button.dataset.role === state.role));
  document.querySelectorAll('[data-view="gm"], [data-view="requests"], [data-role="gm"]').forEach(button => {
    button.hidden = isOnline() && !isStaff();
  });
  document.querySelectorAll("[data-staff-only]").forEach(element => {
    element.hidden = !isStaff();
  });
  renderCharacterSwitcher();
  document.getElementById("view-kicker").textContent = viewTitles[currentView][0];
  document.getElementById("view-title").textContent = viewTitles[currentView][1];
  if (!state.characters.length) {
    document.getElementById("main-panel").innerHTML = renderEmptyCharacterState();
    document.getElementById("context-panel").innerHTML = renderEmptyContext();
    return;
  }
  document.getElementById("main-panel").innerHTML = views[currentView]();
  document.getElementById("context-panel").innerHTML = renderContext();
}

function renderEmptyCharacterState() {
  return `
    <section class="panel empty-character-state">
      <p class="eyebrow">Premiere fiche</p>
      <h2>Aucun personnage dans votre registre</h2>
      <p>Créez un brouillon. Un MJ pourra ensuite valider la fiche et administrer sa progression.</p>
      <button class="primary-button" data-player-new-character>Creer mon personnage</button>
    </section>
  `;
}

function renderEmptyContext() {
  return `
    <p class="eyebrow">Compte connecte</p>
    <h2>${esc(state.profile?.display_name || state.profile?.email || "Nouveau joueur")}</h2>
    <p>Vous pourrez gérer jusqu'a trois personnages actifs apres leur validation par un MJ.</p>
  `;
}

function renderCharacterSwitcher() {
  const switcher = document.getElementById("character-switcher");
  if (!switcher) return;
  switcher.innerHTML = state.characters.map(item => `<option value="${esc(item.id)}" ${item.id === state.activeCharacterId ? "selected" : ""}>${esc(item.name)}</option>`).join("");
}

const views = {
  dashboard: renderDashboard,
  player: renderPlayer,
  skills: renderSkills,
  talents: renderTalents,
  quests: renderQuests,
  factions: renderFactions,
  vault: renderVault,
  requests: renderRequests,
  gm: renderGm
};

function renderDashboard() {
  const c = character();
  const active = state.quests.filter(quest => c.activeQuests.includes(quest.id));
  return `
    <div class="grid">
      <article class="panel span-8">
        ${renderCharacterHeader(c)}
        <div class="progress" aria-label="Experience"><span style="--value:${xpPercent(c)}%"></span></div>
        <p class="muted">${c.xp} / ${xpRequirementForLevel(c.level)} XP avant le prochain niveau</p>
      </article>
      <article class="panel span-4">
        <p class="eyebrow">Actions rapides</p>
        <div class="actions">
          <button class="primary-button" data-player-new-character>Créer une fiche</button>
          <button class="primary-button" data-view="player">Modifier ma fiche</button>
          <button class="secondary-button" data-view="quests">Voir les quetes</button>
          <button class="secondary-button" data-view="skills">Placer mes points</button>
          <button class="secondary-button" data-view="requests">Demander au MJ</button>
        </div>
      </article>
      <article class="card span-3 stat"><span>Points competence</span><strong>${c.skillPoints}</strong></article>
      <article class="card span-3 stat"><span>Points talent</span><strong>${c.talentPoints}</strong></article>
      <article class="card span-3 stat"><span>Solde</span><strong>${formatCoins(c.balance)}</strong></article>
      <article class="card span-3 stat"><span>Quetes en cours</span><strong>${active.length}</strong></article>
      <section class="panel span-12">
        <h2>En cours</h2>
        <div class="table">${active.map(renderQuestRow).join("") || `<p class="empty">Aucune quete acceptee pour le moment.</p>`}</div>
      </section>
    </div>
  `;
}

function renderPlayer() {
  const c = character();
  const active = state.quests.filter(quest => c.activeQuests.includes(quest.id));
  const chosenTalents = state.talentCatalog.filter(talent => c.talents.includes(talent.id));
  const inventory = renderInventory(c);
  return `
    <div class="grid">
      <form id="player-form" class="form-panel span-8">
        <div class="stat">
          <div>
            <p class="eyebrow">Fiche active</p>
            <h2>${esc(c.name)}</h2>
          </div>
          <button class="secondary-button" type="button" data-player-new-character>Créer une autre fiche</button>
        </div>
        <input type="hidden" name="id" value="${esc(c.id)}">
        <div class="grid">
          <div class="span-5">
            ${renderPortrait(c)}
            <label>Portrait PNG/JPEG
              <input id="portrait-file" type="file" accept="image/png,image/jpeg">
            </label>
          </div>
          <div class="span-7 form-grid">
            ${field("name", "Nom", c.name)}
            ${field("people", "Peuple", c.people)}
            ${field("profession", "Situation actuelle", c.profession)}
            ${field("guild", "Guilde", c.guild)}
            ${select("factionId", "Allegeance", state.factions.map(f => [f.id, f.name]), c.factionId)}
            ${field("rumor", "Rumeur publique", c.rumor)}
            ${textarea("story", "Description RP", c.story)}
            ${textarea("lodge", "Description du logis", c.lodge)}
          </div>
        </div>
        <div class="actions">
          <button class="primary-button" type="submit">Enregistrer ma fiche</button>
        </div>
      </form>
      <aside class="panel span-4">
        <p class="eyebrow">Visible sur la fiche</p>
        <h2>Progression</h2>
        <p><strong>XP :</strong> ${c.xp} / ${xpRequirementForLevel(c.level)}</p>
        <p><strong>Solde :</strong> ${formatCoins(c.balance)}</p>
        <p><strong>Points competence :</strong> ${c.skillPoints}</p>
        <p><strong>Points talent :</strong> ${c.talentPoints}</p>
        <h3>Talents choisis</h3>
        <div class="tag-row">${chosenTalents.map(talent => `<span class="tag">${esc(talent.name)}</span>`).join("") || `<span class="tag">Aucun talent</span>`}</div>
        <h3>Quetes en cours</h3>
        <div class="table">${active.map(renderQuestRow).join("") || `<p class="empty">Aucune quete acceptee.</p>`}</div>
        <h3>Inventaire (${inventoryCount(c)}/10)</h3>
        <div class="inventory-grid">${inventory || `<p class="empty">Aucun objet achete.</p>`}</div>
      </aside>
    </div>
  `;
}

function renderSkills() {
  const c = character();
  return `
    <section class="panel">
      <p class="eyebrow">Points disponibles : ${c.skillPoints}</p>
      <h2>Competences du personnage</h2>
      <p class="muted">Le joueur depense uniquement les points disponibles. Pour deplacer des points deja places, il doit demander au MJ.</p>
      <div class="actions">
        <button class="secondary-button" data-request-build-reset>Demander un reset au MJ</button>
      </div>
      <div class="table">
        ${state.skillCatalog.map(skill => `
          <article class="row skill-row">
            <div><strong>${esc(skill.name)}</strong><span class="muted">${esc(skill.description)}</span></div>
            <strong>${c.skills[skill.id] || 0}</strong>
            <button class="pill-button" data-spend-skill="${esc(skill.id)}" ${c.skillPoints <= 0 ? "disabled" : ""}>+1</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTalents() {
  const c = character();
  return `
    <section class="panel">
      <p class="eyebrow">Points talent disponibles : ${c.talentPoints}</p>
      <h2>Talents</h2>
      <p class="muted">Les talents choisis restent sur la fiche. Seul le MJ peut remettre les choix a zero pour un personnage precis.</p>
      <div class="actions">
        <button class="secondary-button" data-request-build-reset>Demander un reset au MJ</button>
      </div>
      <div class="grid">
        ${state.talentCatalog.map(talent => {
          const picked = c.talents.includes(talent.id);
          return `
            <article class="card span-6">
              <h3>${esc(talent.name)}</h3>
              <p>${esc(talent.description)}</p>
              <p class="muted">Cout : ${talent.cost} point${talent.cost > 1 ? "s" : ""}</p>
              <button class="${picked ? "secondary-button" : "primary-button"}" data-pick-talent="${esc(talent.id)}" ${picked || c.talentPoints < talent.cost ? "disabled" : ""}>${picked ? "Deja choisi" : "Choisir"}</button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderRequests() {
  ensureRequests();
  const c = character();
  const mine = state.requests.filter(item => item.characterId === c.id).slice().reverse();
  const pending = mine.filter(item => item.status === "En attente").length;
  return `
    <section class="panel">
      <div class="stat">
        <div>
          <p class="eyebrow">${pending} demande${pending > 1 ? "s" : ""} en attente</p>
          <h2>Demandes au MJ</h2>
        </div>
        <button class="primary-button" data-request-build-reset>Demander un reset</button>
      </div>
      <p class="muted">Pour replacer des points deja depenses, la fiche envoie une demande. Le MJ accepte ou refuse depuis l'atelier.</p>
      <div class="table">
        ${mine.map(renderPlayerRequestRow).join("") || `<p class="empty">Aucune demande pour cette fiche.</p>`}
      </div>
    </section>
  `;
}

function renderPlayerRequestRow(req) {
  return `
    <article class="row">
      <div>
        <strong>${esc(req.title)}</strong>
        <span class="muted">${esc(req.message)}</span>
        <span class="muted">${esc(req.createdAt || "Date inconnue")}${req.resolvedAt ? ` - traite le ${esc(req.resolvedAt)}` : ""}</span>
        ${req.response ? `<span>${esc(req.response)}</span>` : ""}
      </div>
      <span class="tag">${esc(req.status)}</span>
    </article>
  `;
}

function renderQuests() {
  const c = character();
  return `
    <section class="panel">
      <div class="stat">
        <div>
          <p class="eyebrow">Tableau des quetes</p>
          <h2>Choisir une piste</h2>
        </div>
        ${state.role === "gm" ? `<button class="primary-button" data-new-quest>Nouvelle quete</button>` : ""}
      </div>
      <div class="grid">
        ${state.quests.map(quest => `
          <article class="card span-6">
            <p class="eyebrow">${esc(quest.status)} - ${esc(quest.type)} - niveau ${quest.level}</p>
            <h3>${esc(quest.title)}</h3>
            <p>${esc(quest.description)}</p>
            <p class="muted">Recompense : ${esc(quest.reward)}</p>
            <div class="tag-row">${quest.acceptedBy.map(id => `<span class="tag">${esc(state.characters.find(c => c.id === id)?.name || "Inconnu")}</span>`).join("")}</div>
            <div class="actions">
              ${quest.acceptedBy.includes(c.id)
                ? `<button class="danger-button" data-abandon-quest="${esc(quest.id)}">Abandonner</button>`
                : `<button class="primary-button" data-accept-quest="${esc(quest.id)}">Accepter</button>`}
              ${state.role === "gm" ? `
                <button class="secondary-button" data-gm-edit-quest="${esc(quest.id)}">Modifier MJ</button>
                <button class="danger-button" data-gm-delete-quest="${esc(quest.id)}">Supprimer</button>
              ` : ""}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFactions() {
  return `
    <section class="panel">
      <div class="stat">
        <div>
          <p class="eyebrow">Choix cree par le MJ</p>
          <h2>Allegeances</h2>
        </div>
        ${state.role === "gm" ? `<button class="primary-button" data-new-faction>Nouvelle faction</button>` : ""}
      </div>
      <div class="grid">
        ${state.factions.map(item => `
          <article class="card span-6">
            ${renderFactionImage(item)}
            <h3>${esc(item.name)}</h3>
            <p>${esc(item.description)}</p>
            <p><strong>Bonus MJ :</strong> ${esc(item.bonus)}</p>
            ${state.role === "gm" ? `<button class="secondary-button" data-gm-edit-faction="${esc(item.id)}">Modifier</button>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderVault() {
  const c = character();
  const items = filterVaultItems(state.vault, c);
  const maxPage = Math.max(1, Math.ceil(items.length / VAULT_PAGE_SIZE));
  vaultPage = Math.min(Math.max(1, vaultPage), maxPage);
  const visibleItems = items.slice((vaultPage - 1) * VAULT_PAGE_SIZE, vaultPage * VAULT_PAGE_SIZE);

  return `
    <section class="panel">
      <div class="stat vault-heading">
        <div>
          <p class="eyebrow">Solde de ${esc(c.name)} : ${formatCoins(c.balance)}</p>
          <h2>Coffre de l'organisation</h2>
        </div>
        ${state.role === "gm" ? `<button class="primary-button" data-new-item>Nouvel objet</button>` : ""}
      </div>
      <p class="muted">Le joueur achete avec de la monnaie RP virtuelle. L'objet rejoint sa fiche et le solde est decompte.</p>
      <div class="vendor-panel">
        <div class="vendor-header">
          <div class="vendor-avatar">AFD</div>
          <div>
            <p class="eyebrow">Marchandises</p>
            <h3>Eskrokar, intendant du coffre</h3>
          </div>
          <label class="vendor-filter">Voir
            <select data-vault-filter>
              ${vendorFilterOption("all", "Tous les objets")}
              ${vendorFilterOption("available", "Disponibles")}
              ${vendorFilterOption("affordable", "A portee de bourse")}
              ${vendorFilterOption("soldout", "Epuises")}
            </select>
          </label>
        </div>
        <div class="vendor-grid">
          ${visibleItems.map(item => renderVendorItem(item, c)).join("") || `<p class="empty vendor-empty">Aucune marchandise ne correspond au filtre.</p>`}
        </div>
        <div class="vendor-footer">
          <button class="secondary-button square-button" data-vault-prev ${vaultPage <= 1 ? "disabled" : ""} aria-label="Page precedente">&lt;</button>
          <span>Page ${vaultPage} de ${maxPage}</span>
          <button class="secondary-button square-button" data-vault-next ${vaultPage >= maxPage ? "disabled" : ""} aria-label="Page suivante">&gt;</button>
          <strong class="vendor-balance">${formatCoins(c.balance)}</strong>
        </div>
      </div>
    </section>
  `;
}

function filterVaultItems(items, c) {
  return items.filter(item => {
    if (vaultFilter === "available") return item.quantity > 0;
    if (vaultFilter === "affordable") return item.quantity > 0 && c.balance >= item.price;
    if (vaultFilter === "soldout") return item.quantity <= 0;
    return true;
  });
}

function vendorFilterOption(value, label) {
  return `<option value="${value}" ${vaultFilter === value ? "selected" : ""}>${label}</option>`;
}

function renderVendorItem(item, c) {
  const outOfStock = item.quantity <= 0;
  const tooExpensive = c.balance < item.price;
  const inventoryFull = inventoryCount(c) >= 10;
  const disabled = outOfStock || tooExpensive || inventoryFull;
  const reason = outOfStock ? "Rupture" : tooExpensive ? "Solde insuffisant" : inventoryFull ? "Inventaire plein" : "Acheter";

  return `
    <article class="vendor-item ${disabled ? "is-muted" : ""}" title="${esc(item.description || "Aucune description.")}">
      <div class="vendor-icon">${renderItemImage(item)}</div>
      <div class="vendor-item-copy">
        <div class="vendor-item-top">
          <h3>${esc(item.name)}</h3>
          <span class="vendor-stock">${outOfStock ? "Rupture" : `x${item.quantity}`}</span>
        </div>
        <p>${esc(item.description || "Aucune description.")}</p>
        <div class="vendor-price">
          <span>${formatCoins(item.price)}</span>
          <button class="primary-button small-button" data-buy-item="${esc(item.id)}" ${disabled ? "disabled" : ""}>${reason}</button>
        </div>
        ${state.role === "gm" ? `
          <div class="vendor-gm-actions">
            <button class="secondary-button small-button" data-gm-edit-item="${esc(item.id)}">Modifier</button>
            <button class="danger-button small-button" data-gm-delete-item="${esc(item.id)}">Supprimer</button>
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

function formatCoins(value) {
  const amount = Math.ceil(num(value));
  return `<span class="coin-value"><img class="coin-icon" src="assets/images/coin-solde-small.png" alt="" width="22" height="22" loading="lazy">${amount} pieces</span>`;
}

function renderGm() {
  if (!state.gmUnlocked) {
    return `
      <section class="panel">
        <h2>Atelier verrouille</h2>
        <p>Le MJ peut tout modifier : progression, points, talents, factions, quetes et bonus.</p>
        <button class="primary-button" type="button" onclick="openGmLogin()">Entrer cote MJ</button>
      </section>
    `;
  }
  return `
    <div class="grid">
      <section class="panel span-7">
        <div class="stat">
          <div>
            <h2>Personnages</h2>
            <p class="muted">Le MJ cree les fiches. Le joueur selectionne ensuite sa fiche en haut de l'application.</p>
          </div>
          <button class="primary-button" data-new-character>Nouveau personnage</button>
        </div>
        <div class="table">
          ${state.characters.map(c => `
            <article class="gm-character-card">
              <div class="gm-character-summary">
                <strong class="gm-character-title">${esc(c.name)}</strong>
                <div class="gm-character-meta">
                  <span class="tag">Niv. ${c.level}</span>
                  <span class="tag">XP ${c.xp} / ${xpRequirementForLevel(c.level)}</span>
                  <span class="tag">Solde ${formatCoins(c.balance)}</span>
                  <span class="tag">${c.skillPoints} pts comp.</span>
                  <span class="tag">${c.talentPoints} pts talent</span>
                </div>
                <div class="progress mini-progress" aria-label="Progression XP de ${esc(c.name)}"><span style="--value:${xpPercent(c)}%"></span></div>
              </div>
              <div class="gm-character-actions">
                <div class="quick-balance">
                  <span>Solde</span>
                  <input data-gm-balance-input="${esc(c.id)}" type="number" min="0" step="1" value="${esc(c.balance)}" aria-label="Solde de ${esc(c.name)}">
                  <button class="secondary-button small-button" data-gm-set-balance="${esc(c.id)}">OK</button>
                </div>
                <button class="secondary-button" data-gm-edit-character="${esc(c.id)}">Modifier</button>
                <button class="secondary-button" data-gm-quick-xp="${esc(c.id)}" data-amount="50">+50 XP</button>
                <button class="secondary-button" data-gm-add-xp="${esc(c.id)}">XP manuel</button>
                <button class="secondary-button" data-gm-balance="${esc(c.id)}">Solde</button>
                <button class="secondary-button" data-gm-add-point="${esc(c.id)}" data-kind="skill">+Comp</button>
                <button class="secondary-button" data-gm-add-point="${esc(c.id)}" data-kind="talent">+Talent</button>
                <button class="secondary-button" data-gm-reset-build="${esc(c.id)}">Reset comp./talents</button>
                <button class="danger-button" data-gm-delete-character="${esc(c.id)}">Supprimer</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="panel span-5">
        <h2>Journal MJ</h2>
        <div class="table">${state.log.slice(-10).reverse().map(line => `<p class="row">${esc(line)}</p>`).join("")}</div>
      </section>
      ${renderGmRequests()}
    </div>
  `;
}

function renderGmRequests() {
  ensureRequests();
  const list = state.requests.slice().reverse();
  const pending = list.filter(item => item.status === "En attente").length;
  return `
    <section class="panel span-12">
      <div class="stat">
        <div>
          <p class="eyebrow">${pending} demande${pending > 1 ? "s" : ""} en attente</p>
          <h2>Demandes au MJ</h2>
        </div>
      </div>
      <div class="table">
        ${list.map(renderGmRequestRow).join("") || `<p class="empty">Aucune demande au MJ.</p>`}
      </div>
    </section>
  `;
}

function renderGmRequestRow(req) {
  const c = state.characters.find(item => item.id === req.characterId);
  const name = req.characterName || c?.name || "Personnage inconnu";
  return `
    <article class="row">
      <div>
        <strong>${esc(req.title)}</strong>
        <span class="muted">${esc(name)} - ${esc(req.status)}</span>
        <span>${esc(req.message)}</span>
        <span class="muted">${esc(req.createdAt || "Date inconnue")}${req.resolvedAt ? ` - traite le ${esc(req.resolvedAt)}` : ""}</span>
        ${req.response ? `<span>${esc(req.response)}</span>` : ""}
      </div>
      <div class="actions compact-actions">
        ${req.status === "En attente" ? `
          <button class="primary-button small-button" data-gm-approve-request="${esc(req.id)}">Accepter</button>
          <button class="danger-button small-button" data-gm-reject-request="${esc(req.id)}">Refuser</button>
        ` : `
          <button class="secondary-button small-button" data-gm-archive-request="${esc(req.id)}">Archiver</button>
        `}
      </div>
    </article>
  `;
}

function renderContext() {
  const c = character();
  const f = faction(c.factionId);
  return `
    <p class="eyebrow">Personnage actif</p>
    ${renderCharacterHeader(c)}
    <hr>
    <h3>Allegeance</h3>
    <p><strong>${esc(f?.name || "Aucune")}</strong></p>
    <p>${esc(f?.bonus || "Aucun bonus.")}</p>
    <h3>Limites joueur</h3>
    <p class="muted">Le joueur modifie son identite, depense ses points disponibles et accepte les quetes. Le MJ gere XP, ajouts de points, corrections, bonus et validation RP.</p>
  `;
}

function renderCharacterHeader(c) {
  const f = faction(c.factionId);
  return `
    <div class="character-head">
      ${renderPortrait(c)}
      <div>
        <h2>${esc(c.name)}</h2>
        <p>${esc(c.people)} - ${esc(c.profession)}${c.guild ? ` - ${esc(c.guild)}` : ""}</p>
        <div class="tag-row">
          <span class="tag">Niveau ${c.level}</span>
        <span class="tag">${esc(c.reputation)}</span>
        <span class="tag">${esc(c.notoriety)}</span>
        <span class="tag">${esc(f?.name || "Sans allegeance")}</span>
        ${c.notesPublic ? `<span class="tag">${esc(c.notesPublic)}</span>` : ""}
      </div>
        <p>${esc(c.rumor)}</p>
      </div>
    </div>
  `;
}

function renderPortrait(c) {
  return `<div class="portrait">${c.portrait ? `<img src="${esc(c.portrait)}" alt="">` : esc(initials(c.name))}</div>`;
}

function renderFactionImage(item) {
  return `<div class="wide-image faction-image">${item.image ? `<img src="${esc(item.image)}" alt="">` : `<span>${esc(initials(item.name || "Faction"))}</span>`}</div>`;
}

function renderItemImage(item) {
  return `<div class="wide-image item-image">${item.image ? `<img src="${esc(item.image)}" alt="">` : `<span>${esc(initials(item.name || "Objet"))}</span>`}</div>`;
}

function renderInventoryIcon(item) {
  return `<span class="inventory-icon">${item.image ? `<img src="${esc(item.image)}" alt="">` : `<span>${esc(initials(item.name || "Objet"))}</span>`}</span>`;
}

function renderInventory(c) {
  c.inventory ||= [];
  const canManage = state.role === "gm" && state.gmUnlocked;
  const canPlayerAct = c.id === state.activeCharacterId;
  return c.inventory.map(item => {
    const sellValue = resaleValue(item);
    return `
      <article class="inventory-card">
        <div class="inventory-card-main">
          ${renderInventoryIcon(item)}
          <div class="inventory-card-copy">
            <div class="inventory-card-title">
              <strong>${esc(item.name)}</strong>
              <span class="info-badge" title="${esc(item.description || "Aucune description.")}">?</span>
            </div>
            <p>${esc(item.description || "Aucune description.")}</p>
            <div class="inventory-card-meta">
              <span class="tag">x${item.quantity}</span>
              <span class="tag">Achat ${formatCoins(item.price)}</span>
              <span class="tag">Revente ${formatCoins(sellValue)}</span>
            </div>
          </div>
        </div>
        <div class="actions compact-actions inventory-actions">
          ${canPlayerAct ? `
            <button class="secondary-button small-button" data-sell-inventory data-character-id="${esc(c.id)}" data-item-id="${esc(item.id)}">Vendre</button>
            <button class="danger-button small-button" data-destroy-inventory data-character-id="${esc(c.id)}" data-item-id="${esc(item.id)}">Detruire</button>
          ` : ""}
          ${canManage ? `<button class="danger-button small-button" data-gm-remove-inventory="${esc(c.id)}" data-item-id="${esc(item.id)}">Retirer MJ</button>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function renderQuestRow(quest) {
  return `
    <article class="row">
      <div>
        <strong>${esc(quest.title)}</strong>
        <span>${esc(quest.type)} - ${esc(quest.reward)}</span>
      </div>
      <div class="actions compact-actions">
        <span class="tag">${esc(quest.status)}</span>
        <button class="danger-button small-button" data-abandon-quest="${esc(quest.id)}">Abandonner</button>
      </div>
    </article>
  `;
}

function savePlayerForm(form) {
  const data = Object.fromEntries(new FormData(form));
  const c = character();
  if (isOnline()) {
    return runOnlineMutation(() => AFDOnline.updateCharacterIdentity(c.id, {
      name: data.name.trim() || c.name,
      people: data.people,
      profession: data.profession,
      guild: data.guild,
      faction_id: data.factionId || null,
      rumor: data.rumor,
      story: data.story,
      lodge: data.lodge
    }), "Fiche joueur enregistree.");
  }
  Object.assign(c, {
    name: data.name.trim() || c.name,
    people: data.people,
    profession: data.profession,
    guild: data.guild,
    factionId: data.factionId,
    rumor: data.rumor,
    story: data.story,
    lodge: data.lodge
  });
  c.history.push("Fiche modifiee par le joueur.");
  saveAndRender("Fiche joueur enregistree.");
}

function openPlayerCharacterCreator() {
  const draft = createPlayerDraft();
  openModal(`
    <form id="player-create-form" class="form-panel">
      <h2>Créer ma fiche joueur</h2>
      <p class="muted">Le joueur remplit l'identite RP. Le MJ completera ensuite XP, points, solde, reputation, notoriete et validations.</p>
      <div class="form-grid">
        ${field("name", "Nom du personnage", draft.name)}
        ${field("people", "Peuple", draft.people)}
        ${field("profession", "Situation actuelle", draft.profession)}
        ${field("guild", "Guilde", draft.guild)}
        ${select("factionId", "Allegeance souhaitee", state.factions.map(f => [f.id, f.name]), draft.factionId)}
        ${field("rumor", "Rumeur publique", draft.rumor)}
        ${textarea("story", "Description RP", draft.story)}
        ${textarea("lodge", "Description du logis", draft.lodge)}
      </div>
      <button class="primary-button" type="submit">Enregistrer ma fiche</button>
    </form>
  `);
}

function savePlayerCreatedCharacter(form) {
  const data = Object.fromEntries(new FormData(form));
  const c = createPlayerDraft();
  Object.assign(c, {
    id: uid("char"),
    name: data.name.trim() || "Personnage sans nom",
    people: data.people,
    profession: data.profession,
    guild: data.guild,
    factionId: data.factionId,
    rumor: data.rumor,
    story: data.story,
    lodge: data.lodge
  });
  if (isOnline()) {
    closeModal();
    return runOnlineMutation(async () => {
      const id = await AFDOnline.createCharacter({
        name: c.name,
        people: c.people,
        profession: c.profession,
        guild: c.guild,
        faction_id: c.factionId || null,
        rumor: c.rumor,
        story: c.story,
        lodge: c.lodge
      });
      state.activeCharacterId = id;
      AFDOnline.rememberActiveCharacter(id);
    }, "Fiche creee et envoyee au registre.");
  }
  state.characters.push(c);
  state.activeCharacterId = c.id;
  currentView = "player";
  log(`Nouvelle fiche joueur creee : ${c.name}.`);
  closeModal();
  saveAndRender("Fiche creee et sauvegardee.");
}

function loadPortrait(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return toast("Image PNG, JPEG ou WEBP uniquement.");
  if (isOnline()) {
    const c = character();
    return runOnlineMutation(async () => {
      const path = await AFDOnline.uploadMedia("portraits", file, AFDOnline.session.user.id, c.name);
      await AFDOnline.updateCharacterIdentity(c.id, { portrait_path: path });
    }, "Portrait enregistre.");
  }
  const reader = new FileReader();
  reader.onload = () => {
    character().portrait = String(reader.result || "");
    saveAndRender("Portrait enregistre.");
  };
  reader.readAsDataURL(file);
}

function loadFormImage(input, valueId, previewId) {
  const file = input.files?.[0];
  if (!file) return;
  if (!["image/png", "image/jpeg"].includes(file.type)) return toast("Image PNG ou JPEG uniquement.");
  const reader = new FileReader();
  reader.onload = () => {
    resizeDataImage(String(reader.result || ""), 256, file.type, (value) => {
      document.querySelectorAll("[data-item-bank-image]").forEach(item => item.classList.remove("active"));
      const target = document.getElementById(valueId);
      if (target) {
        target.value = value;
        target.setAttribute("value", value);
      }
      const preview = document.getElementById(previewId);
      if (preview) preview.innerHTML = `<div class="wide-image"><img src="${esc(value)}" alt=""></div>`;
    });
  };
  reader.readAsDataURL(file);
}

function resizeDataImage(source, maxSize, mimeType, done) {
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    done(canvas.toDataURL(mimeType === "image/png" ? "image/png" : "image/jpeg", 0.86));
  };
  image.onerror = () => done(source);
  image.src = source;
}

function spendSkillPoint(skillId) {
  const c = character();
  if (c.skillPoints <= 0) return toast("Aucun point disponible.");
  if (isOnline()) {
    const skill = state.skillCatalog.find(item => item.id === skillId);
    return runOnlineMutation(
      () => AFDOnline.allocateSkill(c.id, skill?.uuid || skillId),
      "Point de competence depense."
    );
  }
  c.skills[skillId] = (c.skills[skillId] || 0) + 1;
  c.skillPoints -= 1;
  c.history.push(`+1 competence : ${state.skillCatalog.find(skill => skill.id === skillId)?.name}.`);
  saveAndRender("Point depense.");
}

function pickTalentById(talentId) {
  const c = character();
  const talent = state.talentCatalog.find(item => item.id === talentId);
  if (!talent || c.talentPoints < talent.cost || c.talents.includes(talentId)) return;
  if (isOnline()) {
    return runOnlineMutation(
      () => AFDOnline.acquireTalent(c.id, talent.uuid || talentId),
      "Talent choisi."
    );
  }
  c.talentPoints -= talent.cost;
  c.talents.push(talentId);
  c.history.push(`Talent choisi : ${talent.name}.`);
  saveAndRender("Talent choisi.");
}

function acceptQuestById(questId) {
  const c = character();
  const quest = state.quests.find(item => item.id === questId);
  if (!quest || quest.acceptedBy.includes(c.id)) return;
  if (isOnline()) {
    return runOnlineMutation(() => AFDOnline.acceptQuest(c.id, quest.id), "Quete ajoutee a ta fiche.");
  }
  quest.acceptedBy.push(c.id);
  if (!c.activeQuests.includes(quest.id)) c.activeQuests.push(quest.id);
  c.history.push(`Quete acceptee : ${quest.title}.`);
  saveAndRender("Quete ajoutee a ta fiche.");
}

function abandonQuestById(questId) {
  const c = character();
  const quest = state.quests.find(item => item.id === questId);
  if (!quest || !c.activeQuests.includes(quest.id)) return;
  if (isOnline()) {
    return runOnlineMutation(() => AFDOnline.abandonQuest(c.id, quest.id), "Quete abandonnee.");
  }
  quest.acceptedBy = quest.acceptedBy.filter(id => id !== c.id);
  c.activeQuests = c.activeQuests.filter(id => id !== quest.id);
  c.history.push(`Quete abandonnee : ${quest.title}.`);
  saveAndRender("Quete abandonnee.");
}

function openGmLogin() {
  openModal(`
    <form id="gm-login" class="form-panel">
      <h2>Acces MJ</h2>
      <label>Mot de passe
        <input type="password" name="password" autocomplete="current-password">
      </label>
      <button class="primary-button" type="submit">Entrer</button>
    </form>
  `);
}

function openGmCharacterEditor(id = "") {
  const c = state.characters.find(item => item.id === id) || {
    ...createCharacter(),
    id: "",
    name: "",
    people: "",
    profession: "",
    guild: "",
    rumor: "",
    story: "",
    lodge: "",
    notesPublic: "",
    notesPrivate: ""
  };
  openModal(`
    <form id="gm-character-form" class="form-panel">
      <input type="hidden" name="id" value="${esc(c.id)}">
      <h2>${c.id ? "Modifier la fiche MJ" : "Creer un personnage"}</h2>
      <div class="form-grid">
        ${field("name", "Nom", c.name)}
        ${field("people", "Peuple", c.people)}
        ${field("profession", "Situation actuelle", c.profession)}
        ${field("guild", "Guilde", c.guild)}
        ${select("factionId", "Allegeance", state.factions.map(f => [f.id, f.name]), c.factionId)}
        ${field("level", "Niveau", c.level, "number")}
        ${field("xp", "XP", c.xp, "number")}
        ${field("balance", "Solde virtuel", c.balance, "number")}
        ${field("xpNext", "XP prochain niveau (auto)", xpRequirementForLevel(c.level), "number")}
        ${field("skillPoints", "Points competence", c.skillPoints, "number")}
        ${field("talentPoints", "Points talent", c.talentPoints, "number")}
        ${field("reputation", "Reputation", c.reputation)}
        ${field("notoriety", "Notoriete", c.notoriety)}
        ${textarea("rumor", "Rumeur publique", c.rumor)}
        ${textarea("story", "Description RP", c.story)}
        ${textarea("lodge", "Description du logis", c.lodge)}
        ${textarea("notesPublic", "Note visible", c.notesPublic)}
        ${textarea("notesPrivate", "Note privee MJ", c.notesPrivate)}
      </div>
      <div class="actions">
        <button class="primary-button" type="submit">Sauvegarder</button>
        ${q.id ? `<button class="danger-button" type="button" data-gm-delete-quest="${esc(q.id)}">Supprimer</button>` : ""}
      </div>
    </form>
  `);
}

function saveGmCharacter(form) {
  const data = Object.fromEntries(new FormData(form));
  let c = state.characters.find(item => item.id === data.id);
  if (!c) {
    c = createCharacter();
    c.id = uid("char");
    state.characters.push(c);
    state.activeCharacterId = c.id;
  }
  const nextLevel = clampLevel(data.level);
  Object.assign(c, {
    name: data.name.trim() || "Nouveau voyageur",
    people: data.people,
    profession: data.profession,
    guild: data.guild,
    factionId: data.factionId,
    level: nextLevel,
    xp: Math.min(num(data.xp), xpRequirementForLevel(nextLevel)),
    balance: num(data.balance),
    xpNext: xpRequirementForLevel(nextLevel),
    skillPoints: numOrFallback(data.skillPoints, c.skillPoints ?? 15),
    talentPoints: numOrFallback(data.talentPoints, c.talentPoints ?? 3),
    reputation: data.reputation,
    notoriety: data.notoriety,
    rumor: data.rumor,
    story: data.story,
    lodge: data.lodge,
    notesPublic: data.notesPublic,
    notesPrivate: data.notesPrivate
  });
  state.activeCharacterId = c.id;
  log(`MJ a modifie ${c.name}.`);
  closeModal();
  saveAndRender("Fiche MJ modifiee.");
}

function deleteCharacter(id) {
  if (state.characters.length <= 1) return toast("Il faut garder au moins un personnage.");
  const removed = state.characters.find(item => item.id === id);
  state.characters = state.characters.filter(item => item.id !== id);
  state.quests.forEach(quest => {
    quest.acceptedBy = quest.acceptedBy.filter(characterId => characterId !== id);
  });
  if (state.activeCharacterId === id) state.activeCharacterId = state.characters[0].id;
  log(`Personnage supprime : ${removed?.name || "Inconnu"}.`);
  saveAndRender("Personnage supprime.");
}

function openGmXp(id) {
  const c = state.characters.find(item => item.id === id);
  if (!c) return toast("Personnage introuvable.");
  openModal(`
    <form id="gm-xp-form" class="form-panel">
      <input type="hidden" name="id" value="${esc(id)}">
      <h2>Modifier l'XP de ${esc(c.name)}</h2>
      <p class="muted">Actuellement : niveau ${esc(c.level)}, ${esc(c.xp)} / ${esc(xpRequirementForLevel(c.level))} XP.</p>
      <label>XP a ajouter ou retirer
        <input name="amount" type="number" step="1" value="50">
      </label>
      <button class="primary-button" type="submit">Appliquer</button>
    </form>
  `);
}

function saveGmXp(form) {
  const data = Object.fromEntries(new FormData(form));
  closeModal();
  addGmXp(data.id, data.amount);
}

function addGmXp(id, amount) {
  const c = state.characters.find(item => item.id === id);
  if (!c) return toast("Personnage introuvable.");
  const result = applyXpToCharacter(c, amount);
  state.activeCharacterId = c.id;
  const detail = result.levels > 0
    ? ` ${c.name} atteint le niveau ${c.level} et gagne ${result.levels} point${result.levels > 1 ? "s" : ""} de competence et ${result.levels} point${result.levels > 1 ? "s" : ""} talent.`
    : ` ${c.name} a maintenant ${c.xp} / ${xpRequirementForLevel(c.level)} XP.`;
  c.history.push(`XP ${result.amount >= 0 ? "+" : ""}${result.amount}. Total : ${c.xp} / ${xpRequirementForLevel(c.level)} XP au niveau ${c.level}.`);
  log(`XP appliquee a ${c.name} (${result.amount >= 0 ? "+" : ""}${result.amount}).${detail}`);
  saveAndRender(result.levels > 0 ? `Niveau gagne ! ${c.name} est niveau ${c.level}.` : "XP appliquee.");
}

function applyXpToCharacter(c, amount) {
  const delta = Math.trunc(Number(amount) || 0);
  c.level = clampLevel(c.level);
  c.xp = Math.max(0, Math.trunc(Number(c.xp)) || 0);
  c.xpNext = xpRequirementForLevel(c.level);
  c.skillPoints = Math.max(0, Math.trunc(Number(c.skillPoints)) || 0);
  c.talentPoints = Math.max(0, Math.trunc(Number(c.talentPoints)) || 0);
  c.xp = Math.max(0, c.xp + delta);

  let levels = 0;
  while (c.level < MAX_LEVEL && c.xp >= c.xpNext && levels < MAX_LEVEL) {
    const threshold = c.xpNext;
    c.xp -= threshold;
    c.level += 1;
    c.skillPoints += 1;
    c.talentPoints += 1;
    c.xpNext = xpRequirementForLevel(c.level);
    levels += 1;
    c.history.push(`Niveau ${c.level} atteint. +1 point de competence et +1 point talent.`);
  }

  if (c.level >= MAX_LEVEL) {
    c.level = MAX_LEVEL;
    c.xpNext = xpRequirementForLevel(MAX_LEVEL);
    c.xp = Math.min(c.xp, c.xpNext);
  }

  return { amount: delta, levels };
}

function openGmBalance(id) {
  const c = state.characters.find(item => item.id === id);
  if (!c) return;
  openModal(`
    <form id="gm-balance-form" class="form-panel">
      <input type="hidden" name="id" value="${esc(id)}">
      <h2>Modifier le solde de ${esc(c.name)}</h2>
      <p class="muted">Indique le solde total exact que le personnage doit posseder.</p>
      <label>Nouveau solde
        <input name="balance" type="number" min="0" step="1" value="${esc(c.balance)}">
      </label>
      <button class="primary-button" type="submit">Enregistrer le solde</button>
    </form>
  `);
}

function saveGmBalance(form) {
  const data = Object.fromEntries(new FormData(form));
  setCharacterBalance(data.id, data.balance, "Solde ajuste depuis la fenetre MJ.");
}

function setCharacterBalance(id, value, source = "Solde ajuste par le MJ.") {
  const c = state.characters.find(item => item.id === id);
  if (!c) return toast("Personnage introuvable.");
  const nextBalance = num(value);
  c.balance = nextBalance;
  state.activeCharacterId = c.id;
  c.history.push(`MJ a fixe le solde a ${nextBalance} pieces.`);
  log(`Solde modifie pour ${c.name} : ${nextBalance} pieces.`);
  closeModal();
  saveAndRender(`${source} Nouveau solde : ${nextBalance} pieces.`);
}

function grantPoint(id, kind) {
  const c = state.characters.find(item => item.id === id);
  if (kind === "talent") c.talentPoints += 1;
  else c.skillPoints += 1;
  c.history.push(`MJ a ajoute 1 point ${kind === "talent" ? "talent" : "competence"}.`);
  log(`Point ajoute a ${c.name}.`);
  saveAndRender("+1 point ajoute.");
}

function resetCharacterBuild(id, notify = true) {
  const c = state.characters.find(item => item.id === id);
  if (!c) {
    toast("Personnage introuvable.");
    return false;
  }
  const spentSkills = Object.values(c.skills || {}).reduce((total, value) => total + Math.max(0, Math.trunc(Number(value)) || 0), 0);
  const spentTalents = (c.talents || []).reduce((total, talentId) => {
    const talent = state.talentCatalog.find(item => item.id === talentId);
    return total + Math.max(0, Math.trunc(Number(talent?.cost)) || 0);
  }, 0);
  c.skills = Object.fromEntries(state.skillCatalog.map(skill => [skill.id, 0]));
  c.talents = [];
  c.skillPoints = Math.max(15, num(c.skillPoints) + spentSkills);
  c.talentPoints = num(c.talentPoints) + spentTalents;
  c.history.push("Competences et talents remis a zero par le MJ.");
  log(`Reset competences/talents : ${c.name}.`);
  if (notify) saveAndRender("Points remis a zero pour cette fiche.");
  return true;
}

function ensureRequests() {
  if (!Array.isArray(state.requests)) state.requests = [];
}

function requestDate() {
  return new Date().toLocaleString("fr-FR");
}

function createBuildResetRequest() {
  ensureRequests();
  const c = character();
  const alreadyPending = state.requests.some(item => item.characterId === c.id && item.type === "build-reset" && item.status === "En attente");
  if (alreadyPending) {
    toast("Une demande de reset est deja en attente pour cette fiche.");
    currentView = "requests";
    render();
    return;
  }
  state.requests.push({
    id: uid("request"),
    characterId: c.id,
    characterName: c.name,
    type: "build-reset",
    title: "Reset competences et talents",
    message: `${c.name} demande a replacer ses points de competences et talents.`,
    status: "En attente",
    createdAt: requestDate(),
    resolvedAt: "",
    response: ""
  });
  log(`Demande MJ creee : reset de ${c.name}.`);
  currentView = "requests";
  saveAndRender("Demande envoyee au MJ.");
}

function approveRequest(id) {
  ensureRequests();
  const req = state.requests.find(item => item.id === id);
  if (!req) return toast("Demande introuvable.");
  if (req.status !== "En attente") return toast("Demande deja traitee.");
  if (req.type === "build-reset") {
    const ok = resetCharacterBuild(req.characterId, false);
    if (!ok) return;
    req.response = "Demande acceptee : les points de competences et talents ont ete remis a zero.";
  } else {
    req.response = "Demande acceptee par le MJ.";
  }
  req.status = "Acceptee";
  req.resolvedAt = requestDate();
  log(`Demande MJ acceptee : ${req.title} (${req.characterName}).`);
  saveAndRender("Demande acceptee.");
}

function rejectRequest(id) {
  ensureRequests();
  const req = state.requests.find(item => item.id === id);
  if (!req) return toast("Demande introuvable.");
  if (req.status !== "En attente") return toast("Demande deja traitee.");
  req.status = "Refusee";
  req.resolvedAt = requestDate();
  req.response = "Demande refusee par le MJ.";
  log(`Demande MJ refusee : ${req.title} (${req.characterName}).`);
  saveAndRender("Demande refusee.");
}

function archiveRequest(id) {
  ensureRequests();
  const req = state.requests.find(item => item.id === id);
  state.requests = state.requests.filter(item => item.id !== id);
  log(`Demande MJ archivee : ${req?.title || "Demande"}.`);
  saveAndRender("Demande archivee.");
}

function openFactionEditor(id = "") {
  const f = state.factions.find(item => item.id === id) || { id: "", name: "", image: "", bonus: "", description: "" };
  openModal(`
    <form id="faction-form" class="form-panel">
      <input type="hidden" name="id" value="${esc(f.id)}">
      <input type="hidden" name="image" id="faction-image-value" value="${esc(f.image)}">
      <h2>Faction MJ</h2>
      <div id="faction-image-preview">${renderFactionImage(f)}</div>
      <label>Image PNG/JPEG
        <input id="faction-image-file" type="file" accept="image/png,image/jpeg">
      </label>
      ${field("name", "Nom", f.name)}
      ${field("bonus", "Bonus accorde", f.bonus)}
      ${textarea("description", "Description", f.description)}
      <button class="primary-button" type="submit">Sauvegarder</button>
    </form>
  `);
}

function saveFaction(form) {
  const data = Object.fromEntries(new FormData(form));
  const old = state.factions.find(item => item.id === data.id);
  const item = { id: old?.id || uid("faction"), name: data.name, image: data.image, bonus: data.bonus, description: data.description };
  if (old) state.factions[state.factions.indexOf(old)] = item;
  else state.factions.push(item);
  log(`Faction sauvegardee : ${item.name}.`);
  closeModal();
  saveAndRender("Faction sauvegardee.");
}

function openItemEditor(id = "") {
  const item = state.vault.find(entry => entry.id === id) || { id: "", name: "", image: "", price: 10, quantity: 1, description: "" };
  openModal(`
    <form id="item-form" class="form-panel">
      <input type="hidden" name="id" value="${esc(item.id)}">
      <input type="hidden" name="image" id="item-image-value" value="${esc(item.image)}">
      <h2>${item.id ? "Modifier l'objet" : "Ajouter au coffre"}</h2>
      <div id="item-image-preview">${renderItemImage(item)}</div>
      ${renderItemImageBank(item.image)}
      <label>Image PNG/JPEG
        <input id="item-image-file" type="file" accept="image/png,image/jpeg">
      </label>
      <div class="form-grid">
        ${field("name", "Nom de l'objet", item.name)}
        ${field("price", "Prix", item.price, "number")}
        ${field("quantity", "Quantite", item.quantity, "number")}
        ${textarea("description", "Description", item.description)}
      </div>
      <button class="primary-button" type="button" data-save-vault-item>Sauvegarder</button>
    </form>
  `);
}

function renderItemImageBank(selectedImage = "") {
  const groups = [...new Set(ITEM_IMAGE_BANK.map(item => item.category))];
  return `
    <section class="image-bank" aria-label="Banque d'images d'objet">
      <p class="eyebrow">Banque d'images MJ</p>
      ${groups.map(category => `
        <div class="image-bank-group">
          <strong>${esc(category)}</strong>
          <div class="image-bank-grid">
            ${ITEM_IMAGE_BANK.filter(item => item.category === category).map(item => `
              <button
                class="image-bank-option ${selectedImage === item.src ? "active" : ""}"
                type="button"
                data-item-bank-image="${esc(item.src)}"
                data-item-bank-name="${esc(item.name)}"
                title="${esc(item.name)}"
              >
                <img src="${esc(item.src)}" alt="">
                <span>${esc(item.name)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </section>
  `;
}

function selectItemBankImage(button) {
  const value = document.getElementById("item-image-value");
  const preview = document.getElementById("item-image-preview");
  if (!value || !preview) return;
  const image = normalizeImageValue(button.dataset.itemBankImage);
  value.value = image;
  value.setAttribute("value", image);
  preview.innerHTML = renderItemImage({ image: value.value, name: button.dataset.itemBankName || "Objet" });
  document.querySelectorAll("[data-item-bank-image]").forEach(item => item.classList.toggle("active", item === button));
}

function selectedItemImageFromForm(form) {
  const activeBankImage = form.querySelector("[data-item-bank-image].active")?.dataset.itemBankImage;
  const hiddenImage = form.querySelector("#item-image-value")?.value;
  const dataImage = new FormData(form).get("image");
  return normalizeImageValue(hiddenImage || activeBankImage || dataImage);
}

function normalizeImageValue(value) {
  return String(value || "").trim();
}

function saveVaultItem(form) {
  state.vault ||= [];
  const data = Object.fromEntries(new FormData(form));
  const old = state.vault.find(item => item.id === data.id);
  const name = String(data.name || "").trim() || "Objet sans nom";
  const description = String(data.description || "").trim();
  const price = Math.ceil(num(data.price));
  const quantityValue = String(data.quantity ?? "").trim();
  const quantity = quantityValue === "" ? 1 : Math.max(0, Math.floor(num(quantityValue)));
  const item = {
    id: old?.id || uid("item"),
    name,
    image: selectedItemImageFromForm(form),
    price,
    quantity,
    description
  };
  if (old) state.vault[state.vault.indexOf(old)] = item;
  else state.vault.unshift(item);
  state.characters.forEach(character => {
    (character.inventory || []).forEach(entry => {
      if (entry.id !== item.id) return;
      entry.name = item.name;
      entry.image = item.image;
      entry.price = item.price;
      entry.description = item.description;
    });
  });
  currentView = "vault";
  vaultFilter = "all";
  vaultPage = 1;
  log(`Objet sauvegarde dans le coffre : ${item.name}.`);
  if (!persistStateOrToast()) return;
  if (!vaultItemPersisted(item.id)) {
    toast("Objet non retrouve apres sauvegarde. Recharge la page puis reessaie.");
    return;
  }
  closeModal();
  toast("Objet sauvegarde dans le coffre.");
  render();
}

function persistStateOrToast() {
  try {
    saveState(state);
    return true;
  } catch (error) {
    console.error(error);
    toast("Sauvegarde impossible : image trop lourde ou stockage navigateur plein.");
    return false;
  }
}

function vaultItemPersisted(id) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Array.isArray(saved.vault) && saved.vault.some(item => item.id === id);
  } catch (error) {
    console.error(error);
    return false;
  }
}

function deleteVaultItem(id) {
  const item = state.vault.find(entry => entry.id === id);
  state.vault = state.vault.filter(entry => entry.id !== id);
  log(`Objet retire du coffre : ${item?.name || "Inconnu"}.`);
  saveAndRender("Objet supprime.");
}

function buyVaultItem(id) {
  const c = character();
  c.inventory ||= [];
  const item = state.vault.find(entry => entry.id === id);
  if (!item) return;
  const price = num(item.price);
  const quantity = Math.floor(num(item.quantity));
  if (quantity <= 0) return toast("Objet indisponible.");
  if (num(c.balance) < price) return toast("Solde insuffisant.");
  if (inventoryCount(c) >= 10) return toast("Inventaire plein : 10 objets maximum.");
  c.balance = num(c.balance) - price;
  item.quantity = Math.max(0, quantity - 1);
  const existing = c.inventory.find(entry => entry.id === item.id);
  if (existing) {
    existing.quantity = Math.floor(num(existing.quantity)) + 1;
    existing.name = item.name;
    existing.image = normalizeImageValue(item.image);
    existing.price = price;
    existing.description = item.description;
  } else {
    c.inventory.push({ id: item.id, name: item.name, image: normalizeImageValue(item.image), price, quantity: 1, description: item.description });
  }
  c.history.push(`Achat : ${item.name} pour ${price} pieces.`);
  log(`${c.name} a achete ${item.name}.`);
  saveAndRender("Objet ajoute a la fiche.");
}

function inventoryCount(c) {
  return (c.inventory || []).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
}

function resaleValue(item) {
  return Math.ceil(num(item?.price) * 0.8);
}

function takeInventoryItem(c, itemId) {
  c.inventory ||= [];
  const entry = c.inventory.find(item => item.id === itemId);
  if (!entry) return null;
  const removed = { ...entry, quantity: 1 };
  const quantity = Math.floor(num(entry.quantity));
  if (quantity > 1) entry.quantity = quantity - 1;
  else c.inventory = c.inventory.filter(item => item.id !== itemId);
  return removed;
}

function sellInventoryItem(characterId, itemId) {
  const c = state.characters.find(item => item.id === characterId);
  if (!c) return;
  const entry = takeInventoryItem(c, itemId);
  if (!entry) return toast("Objet introuvable.");
  const value = resaleValue(entry);
  c.balance = num(c.balance) + value;
  c.history.push(`Vente : ${entry.name} pour ${value} pieces.`);
  log(`${c.name} a vendu ${entry.name} pour ${value} pieces.`);
  saveAndRender(`Objet vendu : ${value} pieces recuperees.`);
}

function removeInventoryItem(characterId, itemId, actor = "gm") {
  const c = state.characters.find(item => item.id === characterId);
  if (!c) return;
  const entry = takeInventoryItem(c, itemId);
  if (!entry) return toast("Objet introuvable.");
  const message = actor === "player" ? `Objet detruit : ${entry.name}.` : `MJ a detruit un objet : ${entry.name}.`;
  c.history.push(message);
  log(`Objet detruit dans l'inventaire de ${c.name} : ${entry.name}.`);
  saveAndRender("Objet detruit. Aucun solde rendu.");
}

function openQuestEditor(id = "") {
  const q = state.quests.find(item => item.id === id) || { id: "", title: "", status: "Disponible", type: "Libre", level: 1, reward: "", description: "", acceptedBy: [] };
  openModal(`
    <form id="quest-form" class="form-panel">
      <input type="hidden" name="id" value="${esc(q.id)}">
      <h2>Quete MJ</h2>
      <div class="form-grid">
        ${field("title", "Titre", q.title)}
        ${field("type", "Type", q.type)}
        ${field("status", "Statut", q.status)}
        ${field("level", "Niveau conseille", q.level, "number")}
        ${field("reward", "Recompense", q.reward)}
        ${textarea("description", "Description", q.description)}
      </div>
      <button class="primary-button" type="submit">Sauvegarder</button>
    </form>
  `);
}

function questStatusForDatabase(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value === "brouillon") return "brouillon";
  if (["fermee", "terminee", "termine"].includes(value)) return "fermee";
  if (value === "archivee") return "archivee";
  return "disponible";
}

function saveQuest(form) {
  const data = Object.fromEntries(new FormData(form));
  const old = state.quests.find(item => item.id === data.id);
  const title = String(data.title || "").trim();

  if (!title) {
    toast("Le titre de la quete est obligatoire.");
    return;
  }

  if (isOnline()) {
    const values = {
      title,
      description: String(data.description || "").trim(),
      quest_type: String(data.type || "Libre").trim() || "Libre",
      recommended_level: Math.max(1, Math.min(20, num(data.level) || 1)),
      reward_text: String(data.reward || "").trim(),
      status: questStatusForDatabase(data.status)
    };

    closeModal();
    runOnlineMutation(
      () => AFDOnline.saveQuest(values, old?.id || null),
      old ? "Quete modifiee." : "Quete publiee."
    );
    return;
  }

  const item = {
    ...(old || { id: uid("quest"), acceptedBy: [] }),
    title,
    status: data.status,
    type: data.type,
    level: num(data.level),
    reward: data.reward,
    description: data.description
  };
  if (old) state.quests[state.quests.indexOf(old)] = item;
  else state.quests.unshift(item);
  log(`Quete sauvegardee : ${item.title}.`);
  closeModal();
  saveAndRender("Quete sauvegardee.");
}

function deleteQuest(id) {
  const quest = state.quests.find(item => item.id === id);
  if (!quest) {
    toast("Quete introuvable.");
    return;
  }
  if (isOnline()) {
    closeModal();
    runOnlineMutation(() => AFDOnline.deleteQuest(id), "Quete supprimee.");
    return;
  }
  state.quests = state.quests.filter(item => item.id !== id);
  state.characters.forEach(item => {
    item.activeQuests = (item.activeQuests || []).filter(questId => questId !== id);
    item.completedQuests = (item.completedQuests || []).filter(questId => questId !== id);
  });
  log(`Quete supprimee : ${quest.title}.`);
  closeModal();
  saveAndRender("Quete supprimee.");
}

function field(name, label, value = "", type = "text") {
  return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}"></label>`;
}

function textarea(name, label, value = "") {
  return `<label>${label}<textarea name="${name}">${esc(value)}</textarea></label>`;
}

function select(name, label, options, value) {
  return `<label>${label}<select name="${name}">${options.map(([id, text]) => `<option value="${esc(id)}" ${id === value ? "selected" : ""}>${esc(text)}</option>`).join("")}</select></label>`;
}

function openModal(html) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal">${html}<div class="actions"><button class="secondary-button" onclick="closeModal()">Fermer</button></div></div>`;
  root.classList.add("open");
}

function closeModal() {
  document.getElementById("modal-root").classList.remove("open");
}

function confirmAction(message, action) {
  openModal(`<div class="form-panel"><h2>Confirmation</h2><p>${esc(message)}</p><button class="danger-button" id="confirm-action">Confirmer</button></div>`);
  document.getElementById("confirm-action").onclick = () => {
    closeModal();
    action();
  };
}

function saveAndRender(message) {
  if (isOnline()) {
    toast(message);
    render();
    return true;
  }
  const saved = persistStateOrToast();
  toast(saved ? message : `${message} Affiche, mais non sauvegarde.`);
  render();
  return saved;
}

async function refreshOnlineState(message) {
  if (!isOnline()) return;
  state = await window.AFDOnline.loadState();
  normalizeProgressionState();
  if (message) toast(message);
  render();
}

async function runOnlineMutation(action, successMessage) {
  if (onlineBusy) return;
  onlineBusy = true;
  try {
    await action();
    await refreshOnlineState(successMessage);
  } catch (error) {
    console.error(error);
    toast(error?.message || "L'operation en ligne a echoue.");
  } finally {
    onlineBusy = false;
  }
}

function log(message) {
  state.log.push(`${new Date().toLocaleString("fr-FR")} - ${message}`);
}

function toast(message) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.add("show");
  setTimeout(() => node.classList.remove("show"), 2200);
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `au-feu-dormant-v2-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function xpPercent(c) {
  const xp = Math.max(0, Math.trunc(Number(c.xp)) || 0);
  return Math.min(100, Math.round((xp / Math.max(1, xpRequirementForLevel(c.level))) * 100));
}

function clampLevel(value) {
  return Math.min(MAX_LEVEL, Math.max(1, Math.trunc(Number(value)) || 1));
}

function xpRequirementForLevel(level) {
  const currentLevel = clampLevel(level);
  return currentLevel >= MAX_LEVEL ? FINAL_LEVEL_XP : currentLevel * 100;
}

function normalizeProgressionState() {
  let changed = false;
  state.characters.forEach(c => {
    const nextLevel = clampLevel(c.level);
    const nextXpNext = xpRequirementForLevel(nextLevel);
    const nextXp = Math.min(Math.max(0, Math.trunc(Number(c.xp)) || 0), nextXpNext);
    const nextSkillPoints = Math.max(0, Math.trunc(Number(c.skillPoints)) || 0);
    const nextTalentPoints = Math.max(0, Math.trunc(Number(c.talentPoints)) || 0);
    if (
      c.level !== nextLevel ||
      c.xpNext !== nextXpNext ||
      c.xp !== nextXp ||
      c.skillPoints !== nextSkillPoints ||
      c.talentPoints !== nextTalentPoints
    ) {
      c.level = nextLevel;
      c.xp = nextXp;
      c.xpNext = nextXpNext;
      c.skillPoints = nextSkillPoints;
      c.talentPoints = nextTalentPoints;
      changed = true;
    }
  });
  if (changed) saveState(state);
}

function initials(name) {
  return String(name || "?").split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

function num(value) {
  return Math.max(0, Number(value) || 0);
}

function numOrFallback(value, fallback) {
  const raw = String(value ?? "").trim();
  if (!raw) return num(fallback);
  const next = Math.trunc(Number(raw));
  return Number.isFinite(next) ? Math.max(0, next) : num(fallback);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

async function bootstrapApplication() {
  const authShell = document.getElementById("auth-shell");
  const appShell = document.getElementById("app-shell");
  const status = document.getElementById("connection-status");
  const signOutButton = document.querySelector("[data-sign-out]");

  try {
    const result = await window.AFDOnline?.initialize?.();
    onlineMode = Boolean(result?.configured);
    onlineSession = result?.session || null;
  } catch (error) {
    console.error(error);
    onlineMode = false;
  }

  if (!onlineMode) {
    if (authShell) authShell.hidden = true;
    if (appShell) appShell.hidden = false;
    if (status) status.textContent = "Mode local";
    render();
    return;
  }

  const applySession = async (session) => {
    onlineSession = session;
    if (!session) {
      if (authShell) authShell.hidden = false;
      if (appShell) appShell.hidden = true;
      if (signOutButton) signOutButton.hidden = true;
      return;
    }

    if (authShell) authShell.hidden = true;
    if (appShell) appShell.hidden = false;
    if (signOutButton) signOutButton.hidden = false;
    if (status) status.textContent = "Connecte";
    try {
      state = await window.AFDOnline.loadState();
      normalizeProgressionState();
      render();
    } catch (error) {
      console.error(error);
      if (status) status.textContent = "Erreur de synchronisation";
      toast(error?.message || "Impossible de charger les donnees en ligne.");
    }
  };

  window.AFDOnline.onAuthStateChange((session) => applySession(session));
  await applySession(onlineSession);
}

document.getElementById("magic-link-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.getElementById("auth-message");
  const email = new FormData(event.target).get("email");
  try {
    if (message) message.textContent = "Envoi du lien...";
    await window.AFDOnline.sendMagicLink(email);
    if (message) message.textContent = "Lien envoye. Consultez votre boite e-mail.";
  } catch (error) {
    if (message) message.textContent = error?.message || "Envoi impossible.";
  }
});

document.querySelector("[data-sign-out]")?.addEventListener("click", async () => {
  try {
    await window.AFDOnline.signOut();
  } catch (error) {
    toast(error?.message || "Deconnexion impossible.");
  }
});

bootstrapApplication();
