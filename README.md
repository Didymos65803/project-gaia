# 地球系統危機：Project GAIA

一款為臺灣進階六年級設計的繁體中文科學逃脫遊戲。研究站八區接連失聯，玩家要操作儀器、核對資料與做出決策，最後用跨區證據完成四道重啟任務。全程共 28 道關卡，預估約 60–120 分鐘，可單人操作或分組討論。

- [開啟遊戲](https://didymos65803.github.io/project-gaia/)
- [遊戲設計與學習目標](docs/game-design.md)
- [教師操作與解答](docs/teacher-guide.md)

## 本機執行

使用 Node.js 24。執行下列指令後，開啟 Vite 顯示的本機網址。

```sh
npm install
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

建置結果放在 `dist/`。進度、提示、課程鎖定和自訂筆記存於目前瀏覽器的 localStorage。遊戲可用鍵盤操作，配平關可用下拉選單取代拖放，圖表提供可操作的資料表。

## 課程設定與題庫

- 教師可在右上角齒輪勾選本機要鎖定的章節。重置遊戲進度時會保留這些課程設定。
- 要替所有學生暫停開放演化章，將 `'evolution'` 加入 [網站設定](src/data/settings.ts) 的 `lockedChapters` 後推送至 `main`。上完課再移除該 ID 並推送。初始設定開放完整內容，遊戲依劇情順序解鎖。
- 劇情、題目、答案、提示和回饋集中在 [八章題庫](src/data/chapters.ts) 和 [終章題庫](src/data/finale.ts)。[教師指南](docs/teacher-guide.md) 說明不同題型欄位。

## GitHub Pages 部署

此 repo 已將 GitHub Pages 來源設為 GitHub Actions。另開副本時，在該 repo 的 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。推送至 `main`，或在 **Actions → Test and deploy to GitHub Pages** 手動執行。[GitHub Pages 發佈來源說明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

工作流程用 `npm ci` 安裝鎖定版本，通過測試和建置後發佈 `dist/`。Vite 設定使用相對資產路徑，遊戲畫面使用 URL 片段，方便在任何 Pages 專案子路徑下直接開啟或重新整理。

## 目錄

```text
src/
  data/         八章、終章、教師設定與題庫型別
  engine/       判題、模型、進度與存檔
  components/   地圖、研究區、筆記與互動儀器
  assets/       地球觀測影像
tests/          Node.js 內建測試與獨立解答資料
docs/           遊戲設計、課程操作與解答
.github/        測試、建置和 Pages 部署工作流程
```

## 圖像與字體

地球影像來自 NASA／DSCOVR EPIC（2015-07-06）。本遊戲裁切並壓縮影像作為研究站畫面。[NASA 影像說明](https://www.nasa.gov/image-article/nasa-captures-epic-earth-image/)

Instrument Sans 與 IBM Plex Mono 依 SIL Open Font License 使用，授權文件位於 [public/licenses](public/licenses)。
