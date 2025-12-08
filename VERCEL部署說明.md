# Vercel 部署說明

## 快速開始

### 1. 準備環境變數

在 Vercel 項目設置中，添加以下環境變數：

- **EMAIL_USER**: `enjotraveljapan@gmail.com`
- **EMAIL_APP_PASSWORD**: `nhlkmcjzczqwwwh` （應用密碼，已去掉空格）

**重要**：應用密碼原始值為 `nhlk mcjs zczq wwwh`，已轉換為 `nhlkmcjzczqwwwh`（去掉所有空格）。

### 2. 部署步驟

#### 方法一：通過 Vercel Dashboard

1. 登入 [Vercel](https://vercel.com)
2. 點擊「Add New Project」
3. 導入您的 Git 倉庫（GitHub/GitLab/Bitbucket）
4. 在「Environment Variables」中添加：
   - `EMAIL_USER` = `enjotraveljapan@gmail.com`
   - `EMAIL_APP_PASSWORD` = `nhlkmcjzczqwwwh`
5. 點擊「Deploy」

#### 方法二：通過 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 在項目目錄中部署
vercel

# 設置環境變數
vercel env add EMAIL_USER
vercel env add EMAIL_APP_PASSWORD

# 生產環境部署
vercel --prod
```

### 3. 設置環境變數

在 Vercel Dashboard 中：

1. 進入項目設置（Project Settings）
2. 點擊「Environment Variables」
3. 添加以下變數：

| 變數名 | 值 | 環境 |
|--------|-----|------|
| EMAIL_USER | enjotraveljapan@gmail.com | Production, Preview, Development |
| EMAIL_APP_PASSWORD | nhlkmcjzczqwwwh | Production, Preview, Development |

**注意**：應用密碼值為 `nhlkmcjzczqwwwh`（原始值 `nhlk mcjs zczq wwwh` 去掉空格後）。

**重要**：確保所有環境（Production、Preview、Development）都設置了這些變數。

### 4. 驗證部署

部署完成後：

1. 訪問您的 Vercel 域名（例如：`your-project.vercel.app`）
2. 填寫表單並提交
3. 檢查：
   - 用戶郵箱是否收到確認郵件
   - enjotraveljapan@gmail.com 是否收到通知郵件

## 項目結構

```
旅行/
├── api/
│   └── contact.js          # Vercel 無服務器函數
├── static/                 # 靜態資源
├── index.html              # 主頁面
├── vercel.json             # Vercel 配置文件
├── package.json            # 依賴配置
└── README.md               # 項目說明
```

## 注意事項

1. **環境變數安全**：
   - 不要在代碼中硬編碼應用密碼
   - 使用 Vercel 的環境變數功能
   - 應用密碼已去掉空格：`nhlkmcjzczqwwwh`

2. **文件上傳限制**：
   - QR 碼圖片會轉換為 base64 格式發送
   - 建議圖片大小不超過 2MB

3. **CORS 設置**：
   - API 函數已設置 CORS，允許跨域請求

4. **函數超時**：
   - Vercel 免費版函數執行時間限制為 10 秒
   - 付費版可達 60 秒
   - 郵件發送通常在 2-3 秒內完成

## 故障排除

### 郵件發送失敗

1. **檢查環境變數**：
   - 確認 `EMAIL_USER` 和 `EMAIL_APP_PASSWORD` 已正確設置
   - 確認應用密碼沒有空格

2. **檢查 Vercel 日誌**：
   - 在 Vercel Dashboard 中查看「Functions」→「Logs」
   - 查看錯誤訊息

3. **測試應用密碼**：
   - 確認 Gmail 應用密碼正確
   - 確認已啟用兩步驟驗證

### 表單提交失敗

1. **檢查網絡請求**：
   - 打開瀏覽器開發者工具（F12）
   - 查看 Network 標籤中的請求
   - 檢查錯誤訊息

2. **檢查 API 路由**：
   - 確認 `vercel.json` 配置正確
   - 確認 `api/contact.js` 文件存在

## 更新部署

當您修改代碼後：

```bash
# 推送代碼到 Git 倉庫
git add .
git commit -m "Update code"
git push

# Vercel 會自動部署（如果已連接 Git）
# 或手動部署：
vercel --prod
```

## 支持

如有問題，請檢查：
- [Vercel 文檔](https://vercel.com/docs)
- [Nodemailer 文檔](https://nodemailer.com/about/)
- Vercel Dashboard 中的函數日誌

