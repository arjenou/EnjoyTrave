const nodemailer = require('nodemailer');

// Helper function to format contact info
function formatContactInfo(data) {
  let contactInfo = '';
  if (data.whatsapp) contactInfo += `WhatsApp: ${data.whatsapp}\n`;
  if (data.facebook) contactInfo += `Facebook: ${data.facebook}\n`;
  if (data.viber) contactInfo += `Viber: ${data.viber}\n`;
  if (data.line) contactInfo += `Line: ${data.line}\n`;
  if (data.instagram) contactInfo += `Instagram: ${data.instagram}\n`;
  if (data.wechat) contactInfo += `WeChat: ${data.wechat}\n`;
  return contactInfo || '無';
}

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'enjotraveljapan@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
  }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Parse request body (handles both JSON and FormData)
    let body = req.body;
    
    // If body is a string, try to parse it as JSON
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // If not JSON, might be URL-encoded, try to parse manually
        const params = new URLSearchParams(body);
        body = {};
        for (const [key, value] of params.entries()) {
          body[key] = value;
        }
      }
    }

    const {
      name,
      phone,
      email,
      whatsapp,
      facebook,
      viber,
      line,
      instagram,
      wechat,
      message,
      qrCode
    } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: '請填寫所有必填欄位' 
      });
    }

    const contactInfo = formatContactInfo({
      whatsapp,
      facebook,
      viber,
      line,
      instagram,
      wechat
    });

    // Handle file upload (QR code) if present (as base64 string)
    let qrAttachment = null;
    if (qrCode && typeof qrCode === 'string') {
      // QR code is sent as base64 string (data:image/...;base64,...)
      const base64Data = qrCode.replace(/^data:image\/\w+;base64,/, '');
      qrAttachment = {
        filename: 'qr-code.jpg',
        content: Buffer.from(base64Data, 'base64')
      };
    }

    // Prepare email content for admin notification
    const adminMailOptions = {
      from: `"ENJO TRAVEL JAPAN" <${process.env.EMAIL_USER || 'enjotraveljapan@gmail.com'}>`,
      to: process.env.EMAIL_USER || 'enjotraveljapan@gmail.com',
      replyTo: email,
      subject: `【新諮詢】來自 ${name} 的諮詢`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">新諮詢通知</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>姓名：</strong>${name}</p>
            <p><strong>電話：</strong>${phone || '未提供'}</p>
            <p><strong>電子郵件：</strong><a href="mailto:${email}">${email}</a></p>
            <p><strong>聯絡方式：</strong></p>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${contactInfo}</pre>
            <p><strong>諮詢內容：</strong></p>
            <div style="background-color: white; padding: 15px; border-left: 3px solid #dc3545; margin: 10px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          ${qrAttachment ? '<p style="color: #666; font-size: 12px;">※ 此諮詢包含 QR 碼圖片附件</p>' : ''}
        </div>
      `,
      attachments: qrAttachment ? [qrAttachment] : []
    };

    // Prepare email content for customer confirmation
    const customerMailOptions = {
      from: `"ENJO TRAVEL JAPAN" <${process.env.EMAIL_USER || 'enjotraveljapan@gmail.com'}>`,
      to: email,
      subject: '感謝您的諮詢 - ENJO TRAVEL JAPAN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545;">ENJO TRAVEL JAPAN</h1>
            <p style="color: #666;">讓旅途的喜悅，無限延伸</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 30px; border-radius: 5px;">
            <h2 style="color: #333;">親愛的 ${name}，</h2>
            
            <p>感謝您對 ENJO TRAVEL JAPAN 的關注與諮詢！</p>
            
            <p>我們已經收到您的諮詢訊息，我們的專業團隊將盡快審閱您的需求，並在 1-2 個工作天內與您聯繫。</p>
            
            <div style="background-color: white; padding: 20px; border-left: 3px solid #dc3545; margin: 20px 0;">
              <p style="margin: 0;"><strong>您的諮詢內容：</strong></p>
              <p style="margin: 10px 0 0 0;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>如有任何緊急事項，歡迎直接回覆此郵件或透過以下方式聯繫我們：</p>
            
            <div style="margin: 20px 0;">
              <p><strong>E-mail:</strong> <a href="mailto:enjotraveljapan@gmail.com">enjotraveljapan@gmail.com</a></p>
              <p><strong>地址：</strong>〒545-0022 大阪府大阪市阿倍野區播磨町1丁目24-18</p>
            </div>
            
            <p style="margin-top: 30px;">再次感謝您的信任，期待為您提供專業的日本地接服務！</p>
            
            <p style="margin-top: 30px;">
              此致<br>
              <strong>ENJO TRAVEL JAPAN 團隊</strong><br>
              日本海正株式會社
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              Copyright &copy; 2025. 日本海正株式會社 (ENJO TRAVEL JAPAN) All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    return res.status(200).json({
      success: true,
      message: '諮詢已成功提交！我們已發送確認郵件至您的信箱。'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: '發送郵件時發生錯誤，請稍後再試或直接聯繫我們。'
    });
  }
};
