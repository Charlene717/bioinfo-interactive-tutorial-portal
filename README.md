# Bioinformatics Interactive Tutorial Portal
## 生資互動式教學首頁

一個彙整 charlene717 所有互動式生資教學模組的入口頁。
雙語（繁中／英文）、深淺色、GitHub Pages ↔ 本地檔案連結切換。
所有教學連結都以 `target="_blank"` 在新分頁開啟。

A bilingual portal that links to every interactive bioinformatics tutorial
under this workspace. Designed to run identically on GitHub Pages and from
a local `file://` open. GitHub URLs are the source of truth (per project
convention); local-file links are a fallback toggle.

---

## 1. 結構 Folder layout

```
bioinfo-interactive-tutorial-portal/
├── index.html              ← 主頁，瀏覽器直接開啟
├── assets/
│   ├── styles.css
│   └── app.js              ← 渲染、雙語、連結模式邏輯
├── data/
│   └── subjects.json       ← 單一資料源（編輯此檔即更新內容）
└── README.md
```

只要編輯 `data/subjects.json`，主頁會自動套用更新（不需要任何 build）。

---

## 2. 連結規則 Link conventions

所有教學的線上網址統一遵循：

```
https://charlene717.github.io/<slug>/
```

例如：

- `scrna-interactive-tutorial`  →  https://charlene717.github.io/scrna-interactive-tutorial/
- `linalg-interactive-tutorial` →  https://charlene717.github.io/linalg-interactive-tutorial/
- `qda-interactive-tutorial`    →  https://charlene717.github.io/qda-interactive-tutorial/

頁面上的「連結」下拉提供兩種模式：

| 模式 | 行為 |
|------|------|
| **GitHub Pages**（預設、推薦） | 點任何卡片 → 開到 `https://charlene717.github.io/<slug>/`。未推上的也指這個 URL（會看到 GitHub 404，但 URL 結構一致，之後一推就可用）。 |
| **本地檔案** | 點任何卡片 → 開到 `subjects.json` 內 `localPath` 對應的本地相對路徑（相對於本入口資料夾）。方便在還沒推上前先本地預覽。 |

選擇會自動記在 `localStorage`（鍵：`biportal_mode`）。

> 衝突原則：當本地路徑與 GitHub URL 不一致時，**以 GitHub URL 為準**（這是預設）。

---

## 3. 維護 `data/subjects.json` Maintaining the data file

每個科目的 schema：

```jsonc
{
  "group":     "F",                                  // 對應 groups[].id
  "slug":      "scrna-interactive-tutorial",         // GitHub Pages slug（=repo 名）
  "localPath": "../F_Omics_組學分析/scRNA-seq/scrna-interactive-tutorial/",
  "nameZh":    "單細胞 RNA-seq",
  "nameEn":    "scRNA-seq",
  "descZh":    "QC、PCA、UMAP、分群、軌跡、CellChat。",
  "descEn":    "QC, PCA, UMAP, clustering, trajectory, CellChat.",
  "status":    "deployed"                            // deployed | wip | planning
}
```

狀態定義：

- `deployed` — 已推上 GitHub Pages、線上可訪問。
- `wip` — 本地有內容但尚未完成或尚未推上（卡片有條紋底）。
- `planning` — 還沒開始，只有空殼資料夾或完全空（卡片有條紋底＋灰化）。

當你把某科目推上 GitHub 後，把 `status` 從 `wip` 改成 `deployed` 即可。

---

## 4. 部署 Deploying

### 推到 GitHub Pages（建議 repo 名）

```
charlene717 / bioinfo-interactive-tutorial-portal
```

部署後入口會在：
**https://charlene717.github.io/bioinfo-interactive-tutorial-portal/**

從 `Bioinformatics_Tutorials/` 內初始化：

```bash
cd "E:/Charlene/Bioinformatics_Tutorials/bioinfo-interactive-tutorial-portal"
git init
git add .
git commit -m "init: portal for all interactive tutorials"
git branch -M main
git remote add origin https://github.com/charlene717/bioinfo-interactive-tutorial-portal.git
git push -u origin main
```

在 GitHub repo Settings → Pages：
Source 選 `Deploy from a branch` → `main` / `/ (root)` → Save。

### 本地開啟

可以直接雙擊 `index.html`。預設「GitHub Pages」模式下，未部署科目的連結會 404 但結構一致；切到「本地檔案」就能瀏覽尚未推上的內容。

> ⚠️ 若 `file://` 開啟時 `fetch('./data/subjects.json')` 被瀏覽器阻擋（Chrome 對 `file://` 的 CORS 限制），起一個小型 HTTP server：
>
> ```bash
> # 在 portal 資料夾內：
> python -m http.server 8000
> # 然後開 http://localhost:8000/
> ```
>
> 或用 VS Code 的 **Live Server** 擴充功能。

---

## 5. 設計要點 Design notes

- **9 大群組 A–I**：對應 `Bioinformatics_Tutorials/` 內的最上層分組（基礎工具 / 資訊基礎 / 生物基礎 / 數學統計 / 生資綜論 / 組學 / ML‧DL / AI 進階 / 研究工程）。
- **群組色票**：每個群組有專屬色，卡片 hover 邊框與 badge 都會套用。
- **狀態視覺化**：WIP 與 Planning 卡片用 135° 條紋遮罩 + 灰化讓你一眼看出哪些還沒推。
- **搜尋**：對 slug、中英名、中英描述、群組名都會 fuzzy match。
- **不影響任何科目資料夾**：本 portal 只讀取 `subjects.json`，從未寫入或讀取任何科目資料夾內容；可以放心邊修改科目邊使用 portal。
- **無外部依賴**：沒有用 React/Tailwind/CDN，純 HTML+CSS+JS。GitHub Pages 開箱即用。

---

## 6. 未來擴充建議 Future hooks

- 每個科目首頁加一個「← 回首頁 / Back to Portal」連結回到此 portal（你說現在先不用，先記著）。可以在每個科目 `index.html` 加：
  ```html
  <a href="https://charlene717.github.io/bioinfo-interactive-tutorial-portal/"
     target="_blank" rel="noopener">← Portal</a>
  ```
- 在 `subjects.json` 加 `progress`（0–100）、`lastUpdated`、`chapters`、`refsCount` 等欄位，卡片可以額外顯示。
- 用 GitHub Actions 自動掃 `Bioinformatics_Tutorials/` 各 slug 的 commit 時間，自動更新 `lastUpdated`。
