<div align="center">

# ⚡ VaultFinance

### Your money, rendered as data.

A cyberpunk-minimalist personal finance tracker. Client-side, private to your browser, and built to look as sharp as it works.

[![Made with HTML](https://img.shields.io/badge/HTML-5-00d9ff?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Made with CSS](https://img.shields.io/badge/CSS-3-0066ff?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Framework](https://img.shields.io/badge/Framework-None-ff3d68?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-00e6a0?style=for-the-badge)](#license)

</div>

---

## 🖤 What is this?

VaultFinance is a fully client-side ledger app: sign up, log in, and track what you earn and spend with categories, custom timestamps, and a live expense chart — all rendered in a floating-glass, neon-blue cyberpunk UI with a smooth dark/light theme switch.

No backend. No database. No tracking. Everything lives in your browser's `localStorage`.

> ⚠️ **This is a portfolio / demo project.** Credentials are obfuscated client-side for demonstration purposes only — this is **not** real security. Don't use it to store real financial data or real passwords you use elsewhere. See [Security Notes](#-security-notes) below.

---

## ✨ Features

- 🔐 **Sign up / log in** with per-user accounts stored locally
- 💸 **Add income & expenses** with description, amount, category, and a **custom date/time**
- 📊 **Live line chart** of cumulative spending, rendered on `<canvas>` — no chart library required
- 🏷️ **Categories** — Income, Food, Rent, Transport, Entertainment, Health, Other
- 🔍 **Search & filter** transactions by keyword, category, or direction (in/out)
- ✏️ **Edit & delete** any entry after the fact
- 📤 **Export** your full ledger as CSV or JSON
- 🌗 **Dark / light theme toggle** with a smooth animated switch
- 🧭 **Floating nav bar** on every page — logo, theme switch, login/logout
- 🕳️ **Custom 404 page** with a glitch/scanline effect
- 📱 Fully responsive, keyboard-accessible, and respects `prefers-reduced-motion`

---

## 🗂️ Project structure

```
vaultfinance/
├── index.html        # Landing page — what the app does, "Get started"
├── signup.html        # Create an account
├── signin.html         # Log in
├── app.html           # The ledger — entries, chart, history
├── 404.html           # Custom not-found page
├── CSS/
│   ├── style.css      # Full design system (tokens, nav, panels, forms)
├── JS/
│   └── core.js        # Auth, storage, theme, nav injection, toasts
└── README.md
```

---

## 🚀 Getting started

No build step, no dependencies, no install.

```bash
git clone https://github.com/your-username/vaultfinance.git
cd vaultfinance
```

Then just open `index.html` in a browser — or serve it locally for the cleanest experience:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

You can also deploy it straight to **GitHub Pages**: push to your repo, enable Pages in Settings → Pages → select branch `main` and root folder, and you're live.

---

## 🎨 Design system

| Token | Value | Use |
|---|---|---|
| `--bg` | `#050810` | Base background |
| `--accent` | `#00d9ff` | Primary electric cyan |
| `--accent-2` | `#0066ff` | Secondary deep blue |
| `--rose` | `#ff3d68` | Expenses / errors |
| `--emerald` | `#00e6a0` | Income / success |

Typefaces: **Space Grotesk** (display), **Inter** (body/UI), **JetBrains Mono** (numbers & data).

Every color and spacing value is a CSS custom property in `assets/style.css`, so retheming is a find-and-replace away.

---

## 🔒 Security notes

This project stores account credentials in `localStorage` using a simple salted XOR + Base64 obfuscation (see `VaultCrypto` in `assets/core.js`). This is **intentionally not real cryptography** — anything running entirely in the browser can be inspected by the person using that browser, so true secrecy requires a real backend.

If you want to evolve this into a production app:
- Replace `VaultCrypto` with a real backend (Node/Express, etc.)
- Hash passwords server-side with **bcrypt** or **argon2** — never round-trip plaintext passwords to the client
- Move transaction storage to a real database with per-user auth checks
- Add HTTPS, CSRF protection, and rate limiting on auth endpoints

---

## 🛣️ Roadmap ideas

- [ ] Recurring transactions
- [ ] Budgets per category with progress bars
- [ ] Multi-currency support
- [ ] Real backend + hashed auth
- [ ] Shareable read-only ledger links

---

<div align="center">

**Built with vanilla HTML, CSS, and JS — no framework, no bloat.**

</div>
