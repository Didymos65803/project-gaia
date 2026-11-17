# 地球系統危機：Project GAIA

一款為臺灣進階六年級設計的繁體中文科學逃脫遊戲。研究站八區接連失聯。操控一位小研究員走進各艙室，讀故事、跟研究員練一次，再操作設備、蒐集線索，再把每區的電源核心裝回插座。全程共 28 道關卡，可單人操作。約 60–120 分鐘的課堂安排包含分組說明和筆記討論。

- [開啟遊戲](https://didymos65803.github.io/project-gaia/)
- [遊戲設計與學習目標](docs/game-design.md)
- [教師操作與解答](docs/teacher-guide.md)

## 操作方式

- 用 **WASD** 或方向鍵移動，走近人物與設備後按 **E** 互動。平板可用觸控方向鍵、點地面移動，並按地圖下方的互動鍵。
- 地圖右側的「帶路」會讓小研究員沿走廊走到任務目標。看到黃色驚嘆號，就能找到下一個人物或儀器。
- 第一次進房間會先播放故事，研究員會用例子介紹第一個任務。部分實驗直接在地圖上完成，例如選出 3,000 的指數標籤、量水樣、搬電池零件。
- 各區驗收後會出現電源核心，裝回電源插座才能繼續。畫面上的錄音可以撿起來讀。角色會解釋這條線索如何接到其他區域，內容也會進入科學筆記。

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

建置結果放在 `dist/`。玩家位置、已通電區域、目前的現場實驗、提示、課程鎖定和筆記存於目前瀏覽器的 localStorage。先前版本的驗收進度也可接續。遊戲可用鍵盤操作，配平關可用下拉選單取代拖放，圖表提供可操作的資料表。

## 課程設定與題庫

- 教師可在右上角齒輪勾選本機要鎖定的章節。重置遊戲進度時會保留這些課程設定。
- 要替所有學生暫停開放演化章，將 `'evolution'` 加入 [網站設定](src/data/settings.ts) 的 `lockedChapters` 後推送至 `main`。上完課再移除該 ID 並推送。初始設定開放完整內容，研究區依劇情與電源核心的修復順序解鎖。
- 劇情、題目、答案、提示和回饋集中在 [八章題庫](src/data/chapters.ts) 和 [終章題庫](src/data/finale.ts)。[現場設備](src/data/field.ts) 設定地圖上的旋鈕與選項，[艙室劇情](src/data/station.ts) 設定場景對話與隱藏錄音。[教師指南](docs/teacher-guide.md) 說明不同題型欄位。

## GitHub Pages 部署

此 repo 已將 GitHub Pages 來源設為 GitHub Actions。另開副本時，在該 repo 的 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。推送至 `main`，或在 **Actions → Test and deploy to GitHub Pages** 手動執行。[GitHub Pages 發佈來源說明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

工作流程用 `npm ci` 安裝鎖定版本，通過測試和建置後發佈 `dist/`。Vite 設定使用相對資產路徑，結案報告使用 URL 片段，方便在 Pages 專案子路徑下直接開啟或重新整理。

## 目錄

```text
src/
  data/         題庫、現場設備、艙室劇情與教師設定
  engine/       判題、模型、地圖碰撞、尋路與存檔
  components/   2D 研究站、角色、筆記與互動儀器
  assets/       地球觀測影像
tests/          Node.js 內建測試與獨立解答資料
docs/           遊戲設計、課程操作與解答
.github/        測試、建置和 Pages 部署工作流程
```

## 圖像與字體

地球影像來自 NASA／DSCOVR EPIC（2015-07-06）。本遊戲裁切並壓縮影像作為結案畫面。[NASA 影像說明](https://www.nasa.gov/image-article/nasa-captures-epic-earth-image/)

Instrument Sans 與 IBM Plex Mono 依 SIL Open Font License 使用，授權文件位於 [public/licenses](public/licenses)。
