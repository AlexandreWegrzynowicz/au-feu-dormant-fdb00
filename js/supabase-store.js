(function () {
  const config = window.AFD_SUPABASE_CONFIG || {};
  const supabaseFactory = window.supabase;

  if (!config.url || !config.key || !supabaseFactory?.createClient) {
    window.afdSupabase = null;
    return;
  }

  const client = supabaseFactory.createClient(config.url, config.key);

  async function loadState(fallback) {
    const { data, error } = await client
      .from("portal_state")
      .select("data")
      .eq("id", "main")
      .maybeSingle();

    if (error) throw error;
    return data?.data || fallback;
  }

  async function saveState(state) {
    const { error } = await client
      .from("portal_state")
      .upsert({
        id: "main",
        data: state,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  async function signOut() {
    await client.auth.signOut();
  }

  async function getSession() {
    const { data } = await client.auth.getSession();
    return data.session;
  }

  window.afdSupabase = {
    client,
    loadState,
    saveState,
    signIn,
    signOut,
    getSession
  };
})();
