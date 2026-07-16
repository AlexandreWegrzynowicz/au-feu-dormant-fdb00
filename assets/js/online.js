(function () {
  "use strict";

  const ACTIVE_CHARACTER_KEY = "afdOnlineActiveCharacter";
  const MEDIA_TTL = 60 * 60;

  function questStatusForUi(status) {
    return {
      brouillon: "Brouillon",
      disponible: "Disponible",
      fermee: "Fermee",
      archivee: "Archivee"
    }[String(status || "").toLowerCase()] || "Disponible";
  }

  let client = null;
  let config = null;
  let session = null;

  async function fetchRuntimeConfig() {
    const endpoints = ["/api/runtime-config", "/.netlify/functions/runtime-config"];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) continue;
        const value = await response.json();
        if (value.configured && value.supabaseUrl && value.supabasePublishableKey) return value;
      } catch (_error) {
        // A local static server has no Netlify Functions. Local mode remains available.
      }
    }
    return null;
  }

  async function initialize() {
    config = await fetchRuntimeConfig();
    if (!config || !window.supabase?.createClient) {
      return { configured: false, session: null };
    }

    client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    session = data.session;
    return { configured: true, session };
  }

  function onAuthStateChange(callback) {
    if (!client) return () => {};
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      session = nextSession;
      callback(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }

  async function sendMagicLink(email) {
    ensureClient();
    const redirect = `${window.location.origin}${window.location.pathname}`;
    const { error } = await client.auth.signInWithOtp({
      email: String(email || "").trim(),
      options: { emailRedirectTo: redirect }
    });
    if (error) throw error;
  }

  async function signOut() {
    ensureClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    session = null;
  }

  function ensureClient() {
    if (!client) throw new Error("Supabase n'est pas configure.");
  }

  function ensureSession() {
    ensureClient();
    if (!session?.user) throw new Error("La session a expire. Reconnectez-vous.");
  }

  async function select(table, columns = "*") {
    const { data, error } = await client.from(table).select(columns);
    if (error) throw error;
    return data || [];
  }

  async function rpc(name, parameters = {}) {
    ensureSession();
    const { data, error } = await client.rpc(name, parameters);
    if (error) throw error;
    return data;
  }

  async function signedMedia(bucket, path) {
    if (!path) return "";
    if (/^(data:|https?:|\/|assets\/)/i.test(path)) return path;
    const { data, error } = await client.storage.from(bucket).createSignedUrl(path, MEDIA_TTL);
    return error ? "" : data?.signedUrl || "";
  }

  async function uploadMedia(bucket, file, ownerId, label) {
    ensureSession();
    if (!file) return "";
    if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) {
      throw new Error("Utilisez une image PNG, JPEG ou WEBP.");
    }
    if (file.size > 5 * 1024 * 1024) throw new Error("L'image depasse 5 Mo.");
    const extension = (file.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeLabel = String(label || "media").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 48);
    const path = `${ownerId}/${Date.now()}-${safeLabel}.${extension}`;
    const { error } = await client.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });
    if (error) throw error;
    return path;
  }

  function byId(rows) {
    return new Map((rows || []).map((row) => [row.id, row]));
  }

  function groupBy(rows, key) {
    return (rows || []).reduce((result, row) => {
      const id = row[key];
      if (!result.has(id)) result.set(id, []);
      result.get(id).push(row);
      return result;
    }, new Map());
  }

  function roleIsStaff(role) {
    return role === "mj" || role === "administrateur";
  }

  async function loadState() {
    ensureSession();

    const userId = session.user.id;
    const profileQuery = client.from("profiles").select("*").eq("id", userId).maybeSingle();
    const [
      profileResult,
      factions,
      skillCatalog,
      talentCatalog,
      characters,
      quests,
      itemCatalog,
      requests,
      mail,
      transfers,
      directSales,
      auctions
    ] = await Promise.all([
      profileQuery,
      select("factions"),
      select("skill_catalog"),
      select("talent_catalog"),
      select("characters"),
      select("quests"),
      select("item_catalog"),
      select("gm_requests"),
      select("mail"),
      select("transfers"),
      select("direct_sales"),
      select("auctions")
    ]);

    if (profileResult?.error) throw profileResult.error;
    const profile = profileResult?.data;
    if (!profile) throw new Error("Profil Supabase introuvable. Reconnectez-vous dans quelques secondes.");

    const characterIds = characters.map((character) => character.id);
    let skillRows = [];
    let talentRows = [];
    let participantRows = [];
    let inventoryRows = [];
    let historyRows = [];
    let privateNoteRows = [];

    if (characterIds.length) {
      [skillRows, talentRows, participantRows, inventoryRows, historyRows, privateNoteRows] = await Promise.all([
        client.from("character_skills").select("*").in("character_id", characterIds),
        client.from("character_talents").select("*").in("character_id", characterIds),
        client.from("quest_participants").select("*").in("character_id", characterIds),
        client.from("inventory_items").select("*").in("character_id", characterIds),
        client.from("character_history").select("*").in("character_id", characterIds).order("created_at", { ascending: false }),
        client.from("character_private_notes").select("*").in("character_id", characterIds)
      ]).then((results) => results.map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }));
    }

    const factionMap = byId(factions);
    const skillMap = byId(skillCatalog);
    const talentMap = byId(talentCatalog);
    const charMap = byId(characters);
    const characterSkills = groupBy(skillRows, "character_id");
    const characterTalents = groupBy(talentRows, "character_id");
    const characterParticipants = groupBy(participantRows, "character_id");
    const questParticipants = groupBy(participantRows, "quest_id");
    const characterInventory = groupBy(inventoryRows, "character_id");
    const characterHistory = groupBy(historyRows, "character_id");
    const privateNotes = new Map(privateNoteRows.map((row) => [row.character_id, row.note]));

    const mappedFactions = await Promise.all(factions.map(async (row) => ({
      id: row.id,
      legacyId: row.legacy_id || "",
      name: row.name,
      description: row.description,
      bonus: row.bonus,
      image: await signedMedia("faction-images", row.image_path),
      imagePath: row.image_path || "",
      active: row.is_active
    })));

    const mappedCharacters = await Promise.all(characters.map(async (row) => {
      const activeParticipants = characterParticipants.get(row.id) || [];
      return {
        id: row.id,
        legacyId: row.legacy_id || "",
        ownerId: row.owner_id,
        status: row.status,
        name: row.name,
        portrait: await signedMedia("character-portraits", row.portrait_path),
        portraitPath: row.portrait_path || "",
        people: row.people,
        profession: row.profession,
        guild: row.guild,
        factionId: row.faction_id || "",
        reputation: row.reputation,
        notoriety: row.notoriety,
        rumor: row.rumor,
        story: row.story,
        lodge: row.lodge,
        notesPublic: row.public_notes,
        notesPrivate: privateNotes.get(row.id) || "",
        level: row.level,
        xp: row.xp,
        xpNext: xpForLevel(row.level),
        balance: row.balance,
        skillPoints: row.skill_points,
        talentPoints: row.talent_points,
        lastActivity: row.last_activity,
        skills: Object.fromEntries((characterSkills.get(row.id) || []).map((entry) => {
          const catalog = skillMap.get(entry.skill_id);
          return [catalog?.legacy_id || entry.skill_id, entry.rank];
        })),
        talents: (characterTalents.get(row.id) || []).map((entry) => talentMap.get(entry.talent_id)?.legacy_id || entry.talent_id),
        activeQuests: activeParticipants.filter((entry) => entry.status === "en_cours").map((entry) => entry.quest_id),
        completedQuests: activeParticipants.filter((entry) => entry.status === "terminee").map((entry) => entry.quest_id),
        inventory: await Promise.all((characterInventory.get(row.id) || []).map(async (entry) => ({
          id: entry.id,
          catalogItemId: entry.catalog_item_id,
          name: entry.name,
          description: entry.description,
          image: await signedMedia("item-images", entry.image_path),
          imagePath: entry.image_path || "",
          purchasePrice: entry.purchase_price,
          lockedReason: entry.locked_reason || ""
        }))),
        history: (characterHistory.get(row.id) || []).map((entry) => ({
          id: entry.id,
          type: entry.event_type,
          summary: entry.summary,
          private: entry.is_private,
          createdAt: entry.created_at
        }))
      };
    }));

    const mappedQuests = await Promise.all(quests.map(async (row) => ({
      id: row.id,
      legacyId: row.legacy_id || "",
      title: row.title,
      description: row.description,
      type: row.quest_type,
      level: row.recommended_level,
      reward: row.reward_text,
      status: questStatusForUi(row.status),
      image: await signedMedia("quest-images", row.image_path),
      imagePath: row.image_path || "",
      acceptedBy: (questParticipants.get(row.id) || [])
        .filter((entry) => entry.status === "en_cours")
        .map((entry) => entry.character_id)
        .filter(Boolean)
    })));

    const mappedItems = await Promise.all(itemCatalog.map(async (row) => ({
      id: row.id,
      legacyId: row.legacy_id || "",
      name: row.name,
      description: row.description,
      image: await signedMedia("item-images", row.image_path),
      imagePath: row.image_path || "",
      price: row.price,
      quantity: row.quantity,
      active: row.is_active
    })));

    const rememberedId = localStorage.getItem(ACTIVE_CHARACTER_KEY);
    const activeCharacterId = mappedCharacters.some((character) => character.id === rememberedId)
      ? rememberedId
      : mappedCharacters[0]?.id || null;

    return {
      version: 3,
      online: true,
      profile,
      role: roleIsStaff(profile.role) ? "gm" : "player",
      gmUnlocked: roleIsStaff(profile.role),
      activeCharacterId,
      characters: mappedCharacters,
      factions: mappedFactions,
      skillCatalog: skillCatalog.map((row) => ({ id: row.legacy_id || row.id, uuid: row.id, name: row.name, description: row.description, max: row.max_rank })),
      talentCatalog: talentCatalog.map((row) => ({ id: row.legacy_id || row.id, uuid: row.id, name: row.name, description: row.description, cost: row.cost })),
      vault: mappedItems,
      quests: mappedQuests,
      requests: requests.map((row) => ({
        id: row.id,
        characterId: row.character_id,
        type: row.request_type,
        title: row.title,
        message: row.message,
        status: row.status,
        response: row.response,
        createdAt: row.created_at
      })),
      mail,
      transfers,
      directSales,
      auctions,
      log: []
    };
  }

  function xpForLevel(level) {
    if (level >= 20) return 20000;
    return Math.max(1, Number(level) || 1) * 100;
  }

  function rememberActiveCharacter(id) {
    if (id) localStorage.setItem(ACTIVE_CHARACTER_KEY, id);
  }

  async function updateCharacterIdentity(characterId, character) {
    return rpc("api_update_character_identity", {
      p_character_id: characterId,
      p_character: character
    });
  }

  async function upsertStaffRow(table, values, id) {
    ensureSession();
    const query = id
      ? client.from(table).update(values).eq("id", id).select().single()
      : client.from(table).insert(values).select().single();
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async function deleteStaffRow(table, id) {
    ensureSession();
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw error;
  }

  async function staffQuestRequest(action, quest, id) {
    ensureSession();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error("Connexion expiree. Reconnectez-vous.");

    const response = await fetch("/api/staff-quests", {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ action, quest, id: id || null })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      const messages = {
        STAFF_REQUIRED: "Action reservee aux maitres de jeu.",
        AUTH_REQUIRED: "Connexion expiree. Reconnectez-vous.",
        SERVER_NOT_CONFIGURED: "Le serveur des quetes n'est pas configure.",
        QUEST_SAVE_FAILED: "La quete n'a pas pu etre enregistree.",
        QUEST_DELETE_FAILED: "La quete n'a pas pu etre supprimee."
      };
      throw new Error(messages[result.error] || "L'operation sur la quete a echoue.");
    }
    return result.quest || null;
  }

  window.AFDOnline = {
    initialize,
    onAuthStateChange,
    sendMagicLink,
    signOut,
    loadState,
    rpc,
    uploadMedia,
    signedMedia,
    rememberActiveCharacter,
    updateProfile: (name) => rpc("api_update_profile", { p_display_name: name }),
    createCharacter: (character) => rpc("api_create_character", { p_character: character }),
    updateCharacterIdentity,
    submitCharacter: (id) => rpc("api_submit_character", { p_character_id: id }),
    validateCharacter: (id, accepted, response) => rpc("api_validate_character", { p_character_id: id, p_accepted: accepted, p_response: response || "" }),
    staffUpdateCharacter: (id, patch) => rpc("api_staff_update_character", { p_character_id: id, p_patch: patch }),
    allocateSkill: (characterId, skillId, points = 1) => rpc("api_allocate_skill", { p_character_id: characterId, p_skill_id: skillId, p_points: points }),
    acquireTalent: (characterId, talentId) => rpc("api_acquire_talent", { p_character_id: characterId, p_talent_id: talentId }),
    resetBuild: (characterId, kind = "both") => rpc("api_reset_build", { p_character_id: characterId, p_kind: kind }),
    grantXp: (characterId, amount) => rpc("api_grant_xp", { p_character_id: characterId, p_amount: amount }),
    acceptQuest: (characterId, questId) => rpc("api_accept_quest", { p_character_id: characterId, p_quest_id: questId }),
    abandonQuest: (characterId, questId) => rpc("api_abandon_quest", { p_character_id: characterId, p_quest_id: questId }),
    buyItem: (characterId, itemId) => rpc("api_buy_item", { p_character_id: characterId, p_catalog_item_id: itemId }),
    sellInventoryItem: (characterId, itemId) => rpc("api_sell_inventory_item", { p_character_id: characterId, p_inventory_item_id: itemId }),
    destroyInventoryItem: (characterId, itemId) => rpc("api_destroy_inventory_item", { p_character_id: characterId, p_inventory_item_id: itemId }),
    createTransfer: (senderId, recipientId, itemId) => rpc("api_create_transfer", { p_sender_character_id: senderId, p_recipient_character_id: recipientId, p_inventory_item_id: itemId }),
    resolveTransfer: (transferId, accept) => rpc("api_resolve_transfer", { p_transfer_id: transferId, p_accept: accept }),
    createDirectSale: (sellerId, itemId, price) => rpc("api_create_direct_sale", { p_seller_character_id: sellerId, p_inventory_item_id: itemId, p_price: price }),
    buyDirectSale: (saleId, buyerId) => rpc("api_buy_direct_sale", { p_sale_id: saleId, p_buyer_character_id: buyerId }),
    createAuction: (sellerId, itemId, startingPrice, duration) => rpc("api_create_auction", { p_seller_character_id: sellerId, p_inventory_item_id: itemId, p_starting_price: startingPrice, p_duration_hours: duration }),
    placeBid: (auctionId, bidderId, amount) => rpc("api_place_bid", { p_auction_id: auctionId, p_bidder_character_id: bidderId, p_amount: amount }),
    claimMail: (mailId, characterId) => rpc("api_claim_mail", { p_mail_id: mailId, p_character_id: characterId }),
    claimFirstAdmin: () => rpc("api_claim_first_admin"),
    setProfileRole: (email, role) => rpc("api_set_profile_role", { p_email: email, p_role: role }),
    assignCharacterOwner: (id, email) => rpc("api_assign_character_owner", { p_character_id: id, p_email: email }),
    saveFaction: (values, id) => upsertStaffRow("factions", values, id),
    saveQuest: (values, id) => staffQuestRequest("save", values, id),
    saveCatalogItem: (values, id) => upsertStaffRow("item_catalog", values, id),
    deleteFaction: (id) => deleteStaffRow("factions", id),
    deleteQuest: (id) => staffQuestRequest("delete", null, id),
    deleteCatalogItem: (id) => deleteStaffRow("item_catalog", id),
    deleteCharacter: (id) => deleteStaffRow("characters", id),
    get client() { return client; },
    get session() { return session; },
    get configured() { return Boolean(client); }
  };
})();
