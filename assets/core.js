/* =========================================================================
   VAULTFINANCE — CORE MODULE
   Shared across every page: storage, "encryption", auth, theme, nav, toasts.
   ========================================================================= */

/* -------------------------------------------------------------------------
   NOTE ON "ENCRYPTION"
   This is a client-only demo. There is no real backend, so there is no way
   to keep a secret truly secret — anything running in the user's own
   browser can, in principle, be inspected by that same user. The function
   below (a salted XOR + Base64 obfuscation) is NOT cryptographically
   secure. It exists to demonstrate the *shape* of a real auth flow
   (never store plaintext passwords) for a portfolio project. If this ever
   becomes a real product, swap this for a real backend that hashes
   passwords with bcrypt/argon2 and never sends them to the client at all.
   ------------------------------------------------------------------------- */
const VaultCrypto = (() => {
  const SALT = "vf_cyberpunk_salt_2077";

  function obfuscate(str) {
    let out = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length);
      out += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(out)));
  }

  function deobfuscate(encoded) {
    try {
      const str = decodeURIComponent(escape(atob(encoded)));
      let out = "";
      for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length);
        out += String.fromCharCode(charCode);
      }
      return out;
    } catch (e) {
      return null;
    }
  }

  return { obfuscate, deobfuscate };
})();

/* -------------------------------------------------------------------------
   STORAGE KEYS
   ------------------------------------------------------------------------- */
const VF_KEYS = {
  USERS: "vf_users",           // { username: { passwordHash, createdAt } }
  SESSION: "vf_session",       // { username, loginAt }
  THEME: "vf_theme",           // "dark" | "light"
  TX_PREFIX: "vf_tx_",         // vf_tx_<username> => [ {id, desc, amt, cat, date, ts} ]
};

/* -------------------------------------------------------------------------
   AUTH
   ------------------------------------------------------------------------- */
const VaultAuth = (() => {
  function getUsers() {
    const raw = localStorage.getItem(VF_KEYS.USERS);
    return raw ? JSON.parse(raw) : {};
  }

  function saveUsers(users) {
    localStorage.setItem(VF_KEYS.USERS, JSON.stringify(users));
  }

  function signUp(username, password) {
    username = username.trim();
    if (!username || !password) {
      return { ok: false, error: "Username and password are required." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const users = getUsers();
    if (users[username]) {
      return { ok: false, error: "That username is already taken." };
    }
    users[username] = {
      passwordHash: VaultCrypto.obfuscate(password),
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);
    return { ok: true };
  }

  function logIn(username, password) {
    username = username.trim();
    const users = getUsers();
    const record = users[username];
    if (!record) {
      return { ok: false, error: "No account found with that username." };
    }
    const decrypted = VaultCrypto.deobfuscate(record.passwordHash);
    if (decrypted !== password) {
      return { ok: false, error: "Incorrect password." };
    }
    localStorage.setItem(
      VF_KEYS.SESSION,
      JSON.stringify({ username, loginAt: new Date().toISOString() })
    );
    return { ok: true };
  }

  function logOut() {
    localStorage.removeItem(VF_KEYS.SESSION);
  }

  function currentSession() {
    const raw = localStorage.getItem(VF_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  }

  function requireAuth(redirectTo = "signin.html") {
    const session = currentSession();
    if (!session) {
      window.location.href = redirectTo;
      return null;
    }
    return session;
  }

  return { signUp, logIn, logOut, currentSession, requireAuth };
})();

/* -------------------------------------------------------------------------
   TRANSACTIONS
   ------------------------------------------------------------------------- */
const VaultData = (() => {
  function key(username) {
    return VF_KEYS.TX_PREFIX + username;
  }

  function getAll(username) {
    const raw = localStorage.getItem(key(username));
    return raw ? JSON.parse(raw) : [];
  }

  function saveAll(username, txs) {
    localStorage.setItem(key(username), JSON.stringify(txs));
  }

  function add(username, entry) {
    const txs = getAll(username);
    txs.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
      ...entry,
    });
    saveAll(username, txs);
    return txs;
  }

  function update(username, id, changes) {
    const txs = getAll(username);
    const idx = txs.findIndex((t) => t.id === id);
    if (idx === -1) return txs;
    txs[idx] = { ...txs[idx], ...changes };
    saveAll(username, txs);
    return txs;
  }

  function remove(username, id) {
    const txs = getAll(username).filter((t) => t.id !== id);
    saveAll(username, txs);
    return txs;
  }

  return { getAll, saveAll, add, update, remove };
})();

/* -------------------------------------------------------------------------
   THEME
   ------------------------------------------------------------------------- */
const VaultTheme = (() => {
  function get() {
    return localStorage.getItem(VF_KEYS.THEME) || "dark";
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(VF_KEYS.THEME, theme);
  }

  function toggle() {
    const next = get() === "dark" ? "light" : "dark";
    apply(next);
    return next;
  }

  function init() {
    apply(get());
  }

  return { get, apply, toggle, init };
})();

/* -------------------------------------------------------------------------
   TOASTS
   ------------------------------------------------------------------------- */
const VaultToast = (() => {
  function ensureContainer() {
    let el = document.getElementById("vf-toast-container");
    if (!el) {
      el = document.createElement("div");
      el.id = "vf-toast-container";
      document.body.appendChild(el);
    }
    return el;
  }

  function show(message, type = "info") {
    const container = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `vf-toast vf-toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("vf-toast-in"));
    setTimeout(() => {
      toast.classList.remove("vf-toast-in");
      toast.classList.add("vf-toast-out");
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  return { show };
})();

/* -------------------------------------------------------------------------
   NAV BAR (injected into every page's #vf-nav-root)
   ------------------------------------------------------------------------- */
const VaultNav = (() => {
  function render() {
    const root = document.getElementById("vf-nav-root");
    if (!root) return;

    const session = VaultAuth.currentSession();
    const isLoggedIn = !!session;

    root.innerHTML = `
      <nav class="vf-nav">
        <a href="index.html" class="vf-nav-logo" aria-label="VaultFinance home">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L23 7V13C23 18.5 18.7 22.7 13 24C7.3 22.7 3 18.5 3 13V7L13 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M9 13L12 16L17.5 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Vault<em>Finance</em></span>
        </a>

        <div class="vf-nav-actions">
          <button id="vf-theme-toggle" class="vf-theme-switch" aria-label="Toggle light and dark theme" title="Toggle theme">
            <span class="vf-theme-switch-track">
              <span class="vf-theme-switch-thumb"></span>
            </span>
          </button>

          ${
            isLoggedIn
              ? `<button id="vf-logout-btn" class="vf-btn vf-btn-ghost">Log out</button>`
              : `<a href="signin.html" class="vf-btn vf-btn-primary">Log in</a>`
          }
        </div>
      </nav>
    `;

    const toggleBtn = document.getElementById("vf-theme-toggle");
    toggleBtn.classList.toggle("is-light", VaultTheme.get() === "light");
    toggleBtn.addEventListener("click", () => {
      const next = VaultTheme.toggle();
      toggleBtn.classList.toggle("is-light", next === "light");
    });

    const logoutBtn = document.getElementById("vf-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        VaultAuth.logOut();
        VaultToast.show("Logged out. See you next time.", "info");
        setTimeout(() => (window.location.href = "index.html"), 600);
      });
    }
  }

  return { render };
})();

/* Auto-init theme + nav on every page load */
document.addEventListener("DOMContentLoaded", () => {
  VaultTheme.init();
  VaultNav.render();
});
