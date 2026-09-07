# SANN TOOLS

**Useful tools. One simple place.**

Fast, minimal, and privacy-friendly web utilities for developers, creators, and everyday tasks. Built with Next.js App Router and TypeScript.

---

## ⚡ Key Highlights

- **100% Client-Side Execution**: Utilities process input directly inside your browser. No sensitive data, tokens, passwords, or files are ever sent to a third-party server.
- **No SQL / Database Required**: Uses your GitHub repository as the persistent storage engine. Data is stored in structured JSON files (`data/tools.json`, `data/categories.json`, `data/settings.json`).
- **Atomic GitHub REST Commits**: When administrators edit, create, or delete tools via the Admin Dashboard, the backend commits directly to GitHub with SHA-based concurrency conflict protection.
- **Minimal Configuration**: Requires strictly **only two environment variables** (`GITHUB_TOKEN` and `GITHUB_USERNAME`).
- **Strict Admin Security**:
  - Whitelisted against your GitHub account (`process.env.GITHUB_USERNAME`).
  - Session tokens are cryptographically signed server-side using HMAC-SHA256 with secrets derived in-memory.
  - `GITHUB_TOKEN` is **strictly server-side only** and never exposed to the client or browser.
- **Fast Performance & SEO**: Incremental Static Regeneration, clean metadata, OpenGraph tags, and mobile-first responsive layout.
- **Production-Ready for Vercel**: Fully optimized for Vercel serverless deployment.

---

## 🛠️ Built-in Utilities (12 Tools)

1. **JSON Formatter & Beautifier** (`/tools/json-formatter`): Formats, indents, minifies, validates JSON, and calculates payload size.
2. **JSON Validator & Schema Linter** (`/tools/json-validator`): Deep parse verification, error line/column highlighting, and structure stats.
3. **Base64 Encoder & Decoder** (`/tools/base64-encode-decode`): UTF-8 safe text Base64 encoding/decoding with live byte counts.
4. **UUID / GUID Generator** (`/tools/uuid-generator`): Cryptographically secure v4 UUID generator with uppercase and hyphen controls.
5. **Strong Password Generator** (`/tools/password-generator`): Configurable character pools, entropy meter, and exclusion of ambiguous characters.
6. **URL Encoder & Decoder** (`/tools/url-encoder-decoder`): Full URL component and query parameter encoding and decoding.
7. **Timestamp / Epoch Converter** (`/tools/timestamp-converter`): Live UTC/Local/ISO-8601 converter with human-readable relative time.
8. **HEX / RGB / HSL Color Converter** (`/tools/color-converter`): Synchronized cross-format converter with dynamic palette preview and contrast tips.
9. **URL Slug Generator** (`/tools/slug-generator`): Cleans accents, symbols, and whitespace into SEO-friendly permalinks.
10. **Word & Character Counter** (`/tools/word-counter`): Real-time word, character, sentence, paragraph, and reading time analyzer.
11. **QR Code Generator** (`/tools/qr-code-generator`): Customizable foreground/background colors, error correction levels, and PNG export.
12. **Text Case Converter** (`/tools/text-case-converter`): Convert between camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and title case.

---

## 🚀 Environment Variables

SANN TOOLS requires strictly **only two** environment variables:

```env
GITHUB_TOKEN=
GITHUB_USERNAME=
```

- `GITHUB_TOKEN`: Your GitHub Personal Access Token with repository write permissions (used strictly on the server to commit catalog updates).
- `GITHUB_USERNAME`: Your GitHub username (identifies the repository owner and authorizes the sole admin account).

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sann-tools.git
cd sann-tools

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Admin Panel & Workflow

1. Navigate to `/admin/login`
2. If `GITHUB_TOKEN` and `GITHUB_USERNAME` are configured in your environment, you can sign in directly with **"Masuk sebagai Admin (@username)"** with a single click, or enter your GitHub Personal Access Token.
3. If authorized, access is granted to:
   - `/admin` (System overview, storage status, recent updates)
   - `/admin/tools` (Full CRUD operations with live preview, status toggles, deletion)
   - `/admin/tools/new` (New tool builder with slug generator and icon picker)
   - `/admin/categories` (Category taxonomy editor)
   - `/admin/settings` (Site brand, maintenance mode, and featured limits)
4. Every change commits atomically to your GitHub repository and displays the resulting commit SHA.

---

## ☁️ Deployment to Vercel

1. Push your code to your GitHub repository.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add only the two variables:
   - `GITHUB_TOKEN`
   - `GITHUB_USERNAME`
4. Click **Deploy**.

---

## 📄 License

MIT License. Designed with focus on performance, security, and developer craftsmanship.
