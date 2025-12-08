# ENJO TRAVEL JAPAN 網站

## 功能說明

此網站包含一個聯繫表單，當用戶提交表單後：
1. 用戶會收到一封確認郵件
2. enjotraveljapan@gmail.com 會收到一封通知郵件，包含用戶的所有諮詢信息

## 設置步驟

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置 Gmail 應用密碼

1. 登入您的 Google 帳號（enjotraveljapan@gmail.com）
2. 前往 [Google 帳號管理](https://myaccount.google.com/)
3. 點擊左側的「安全性」
4. 在「登入 Google」區塊中，找到「兩步驟驗證」並確保已啟用
5. 在「登入 Google」區塊中，找到「應用程式密碼」
6. 選擇「郵件」和「其他（自訂名稱）」，輸入名稱如「ENJO Travel Website」
7. 點擊「產生」，複製生成的 16 位應用密碼（不含空格）

### 3. 創建環境變數文件

在項目根目錄創建 `.env` 文件：

```env
EMAIL_USER=enjotraveljapan@gmail.com
EMAIL_APP_PASSWORD=your_16_digit_app_password_here
PORT=3000
```

將 `your_16_digit_app_password_here` 替換為您剛才獲取的應用密碼。

### 4. 啟動服務器

```bash
npm start
```

或者使用開發模式（自動重啟）：

```bash
npm run dev
```

服務器將在 http://localhost:3000 運行。

## 部署說明

### 使用 Node.js 主機服務

1. 將所有文件上傳到服務器
2. 在服務器上運行 `npm install`
3. 創建 `.env` 文件並填入配置
4. 使用 PM2 或其他進程管理器運行服務器：
   ```bash
   pm2 start server.js --name enjo-travel
   ```

### 使用雲端服務（如 Heroku, Railway, Render）

1. 將項目推送到 Git 倉庫
2. 在雲端服務平台連接倉庫
3. 設置環境變數：
   - `EMAIL_USER`: enjotraveljapan@gmail.com
   - `EMAIL_APP_PASSWORD`: 您的 Gmail 應用密碼
   - `PORT`: （通常由平台自動設置）
4. 部署項目

## 注意事項

- `.env` 文件包含敏感信息，請勿提交到 Git 倉庫
- 確保 Gmail 帳號已啟用兩步驟驗證
- 應用密碼是 16 位字符，不含空格
- 如果郵件發送失敗，請檢查應用密碼是否正確

## 技術棧

- Node.js + Express
- Nodemailer (郵件發送)
- Multer (文件上傳處理)
- CORS (跨域支持)


