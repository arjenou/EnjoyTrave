const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Configure multer for file uploads (QR code)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // enjotraveljapan@gmail.com
    pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
  }
});

// Helper function to format contact info
function formatContactInfo(data, lang = 'CN') {
  let contactInfo = '';
  const labels = {
    CN: { none: '無' },
    JP: { none: 'なし' },
    EN: { none: 'None' }
  };
  
  if (data.whatsapp) contactInfo += `WhatsApp: ${data.whatsapp}\n`;
  if (data.facebook) contactInfo += `Facebook: ${data.facebook}\n`;
  if (data.viber) contactInfo += `Viber: ${data.viber}\n`;
  if (data.line) contactInfo += `Line: ${data.line}\n`;
  if (data.instagram) contactInfo += `Instagram: ${data.instagram}\n`;
  if (data.wechat) contactInfo += `WeChat: ${data.wechat}\n`;
  return contactInfo || labels[lang]?.none || '無';
}

// Email content templates based on language
const emailTemplates = {
  CN: {
    admin: {
      subject: (name) => `【新諮詢】來自 ${name} 的諮詢`,
      title: '新諮詢通知',
      labels: {
        name: '姓名：',
        phone: '電話：',
        email: '電子郵件：',
        contact: '聯絡方式：',
        message: '諮詢內容：',
        phoneNotProvided: '未提供',
        qrNote: '※ 此諮詢包含 QR 碼圖片附件'
      }
    },
    customer: {
      subject: '感謝您的諮詢 - ENJO TRAVEL JAPAN',
      tagline: '讓旅途的喜悅，無限延伸',
      greeting: (name) => `親愛的 ${name}，`,
      thankYou: '感謝您對 ENJO TRAVEL JAPAN 的關注與諮詢！',
      received: '我們已經收到您的諮詢訊息，我們的專業團隊將盡快審閱您的需求，並在 1-2 個工作天內與您聯繫。',
      yourInquiry: '您的諮詢內容：',
      urgent: '如有任何緊急事項，歡迎直接回覆此郵件或透過以下方式聯繫我們：',
      email: 'E-mail:',
      whatsapp: 'WhatsApp:',
      whatsappValue: '+81-70-9231-0378',
      address: '地址：',
      addressValue: '〒545-0022 大阪府大阪市阿倍野區播磨町1丁目24-18',
      closing: '再次感謝您的信任，期待為您提供專業的日本地接服務！',
      signature: '此致',
      team: 'ENJO TRAVEL JAPAN 團隊',
      company: '日本海正株式會社'
    }
  },
  JP: {
    admin: {
      subject: (name) => `【新規お問い合わせ】${name} 様からのお問い合わせ`,
      title: '新規お問い合わせ通知',
      labels: {
        name: 'お名前：',
        phone: '電話番号：',
        email: 'メールアドレス：',
        contact: '連絡先：',
        message: 'お問い合わせ内容：',
        phoneNotProvided: '未提供',
        qrNote: '※ このお問い合わせにはQRコード画像が添付されています'
      }
    },
    customer: {
      subject: 'お問い合わせありがとうございます - ENJO TRAVEL JAPAN',
      tagline: '終わりのない旅の喜びを、世界中の旅人へ',
      greeting: (name) => `${name} 様`,
      thankYou: 'ENJO TRAVEL JAPAN へのご関心とお問い合わせ、誠にありがとうございます！',
      received: 'お問い合わせ内容を確認いたしました。専門チームがご要望を確認し、1-2営業日以内にご連絡いたします。',
      yourInquiry: 'お問い合わせ内容：',
      urgent: '緊急のご用件がございましたら、このメールに直接返信するか、以下の方法でお問い合わせください：',
      email: 'E-mail:',
      whatsapp: 'WhatsApp:',
      whatsappValue: '+81-70-9231-0378',
      address: '住所：',
      addressValue: '〒545-0022 大阪府大阪市阿倍野区播磨町1丁目24-18',
      closing: 'ご信頼いただき、ありがとうございます。専門的な日本現地手配サービスを提供できることを楽しみにしております！',
      signature: '敬具',
      team: 'ENJO TRAVEL JAPAN チーム',
      company: '日本海正株式会社'
    }
  },
  EN: {
    admin: {
      subject: (name) => `【New Inquiry】Inquiry from ${name}`,
      title: 'New Inquiry Notification',
      labels: {
        name: 'Name:',
        phone: 'Phone:',
        email: 'Email:',
        contact: 'Contact Methods:',
        message: 'Inquiry Content:',
        phoneNotProvided: 'Not provided',
        qrNote: '※ This inquiry includes a QR code image attachment'
      }
    },
    customer: {
      subject: 'Thank You for Your Inquiry - ENJO TRAVEL JAPAN',
      tagline: 'Delivering journeys where joy never ends',
      greeting: (name) => `Dear ${name},`,
      thankYou: 'Thank you for your interest and inquiry about ENJO TRAVEL JAPAN!',
      received: 'We have received your inquiry message. Our professional team will review your request and contact you within 1-2 business days.',
      yourInquiry: 'Your Inquiry Content:',
      urgent: 'If you have any urgent matters, please feel free to reply directly to this email or contact us through the following methods:',
      email: 'E-mail:',
      whatsapp: 'WhatsApp:',
      whatsappValue: '+81-70-9231-0378',
      address: 'Address:',
      addressValue: '1-24-18 Harimacho, Abeno-ku, Osaka-shi, Osaka 545-0022, Japan',
      closing: 'Thank you again for your trust. We look forward to providing you with professional DMC services in Japan!',
      signature: 'Best regards,',
      team: 'ENJO TRAVEL JAPAN Team',
      company: 'Nihon Kaisho Co., Ltd.'
    }
  }
};

// Handle form submission
app.post('/api/contact', upload.single('qrCode'), async (req, res) => {
  try {
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
      language = 'CN' // Get language from request, default to CN
    } = req.body;

    // Normalize language code (CN, JP, EN)
    const lang = ['CN', 'JP', 'EN'].includes(language) ? language : 'CN';
    
    // Validate required fields
    const errorMessages = {
      CN: '請填寫所有必填欄位',
      JP: '必須項目を入力してください',
      EN: 'Please fill in all required fields'
    };
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: errorMessages[lang] || errorMessages.CN
      });
    }
    
    // Get email templates for the language
    const templates = emailTemplates[lang] || emailTemplates.CN;
    const adminLabels = templates.admin.labels;
    const customerLabels = templates.customer;

    const contactInfo = formatContactInfo({
      whatsapp,
      facebook,
      viber,
      line,
      instagram,
      wechat
    }, lang);

    // Prepare email content for admin notification (always in Chinese)
    const adminTemplates = emailTemplates.CN;
    const adminMailOptions = {
      from: `"ENJO TRAVEL JAPAN" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // enjotraveljapan@gmail.com
      replyTo: email,
      subject: adminTemplates.admin.subject(name),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${adminTemplates.admin.title}</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>${adminTemplates.admin.labels.name}</strong>${name}</p>
            <p><strong>${adminTemplates.admin.labels.phone}</strong>${phone || adminTemplates.admin.labels.phoneNotProvided}</p>
            <p><strong>${adminTemplates.admin.labels.email}</strong><a href="mailto:${email}">${email}</a></p>
            <p><strong>${adminTemplates.admin.labels.contact}</strong></p>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${contactInfo}</pre>
            <p><strong>${adminTemplates.admin.labels.message}</strong></p>
            <div style="background-color: white; padding: 15px; border-left: 3px solid #dc3545; margin: 10px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 10px;"><strong>語言：</strong>${lang === 'CN' ? '繁體中文' : lang === 'JP' ? '日本語' : 'English'}</p>
          </div>
          ${req.file ? `<p style="color: #666; font-size: 12px;">${adminTemplates.admin.labels.qrNote}</p>` : ''}
        </div>
      `,
      attachments: req.file ? [{
        filename: req.file.originalname || 'qr-code.jpg',
        content: req.file.buffer
      }] : []
    };

    // Prepare email content for customer confirmation (in user's language)
    const customerMailOptions = {
      from: `"ENJO TRAVEL JAPAN" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: customerLabels.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545;">ENJO TRAVEL JAPAN</h1>
            <p style="color: #666;">${customerLabels.tagline}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 30px; border-radius: 5px;">
            <h2 style="color: #333;">${customerLabels.greeting(name)}</h2>
            
            <p>${customerLabels.thankYou}</p>
            
            <p>${customerLabels.received}</p>
            
            <div style="background-color: white; padding: 20px; border-left: 3px solid #dc3545; margin: 20px 0;">
              <p style="margin: 0;"><strong>${customerLabels.yourInquiry}</strong></p>
              <p style="margin: 10px 0 0 0;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>${customerLabels.urgent}</p>
            
            <div style="margin: 20px 0;">
              <p><strong>${customerLabels.email}</strong> <a href="mailto:enjotraveljapan@gmail.com">enjotraveljapan@gmail.com</a></p>
              <p><strong>${customerLabels.whatsapp}</strong> <a href="https://wa.me/817092310378">${customerLabels.whatsappValue}</a></p>
              <p><strong>${customerLabels.address}</strong>${customerLabels.addressValue}</p>
            </div>
            
            <p style="margin-top: 30px;">${customerLabels.closing}</p>
            
            <p style="margin-top: 30px;">
              ${customerLabels.signature}<br>
              <strong>${customerLabels.team}</strong><br>
              ${customerLabels.company}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              Copyright &copy; 2025. ${customerLabels.company} (ENJO TRAVEL JAPAN) All rights reserved.
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

    const successMessages = {
      CN: '諮詢已成功提交！我們已發送確認郵件至您的信箱。',
      JP: 'お問い合わせが正常に送信されました！確認メールを送信しました。',
      EN: 'Inquiry submitted successfully! We have sent a confirmation email to your inbox.'
    };
    
    res.json({
      success: true,
      message: successMessages[lang] || successMessages.CN
    });

  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessages = {
      CN: '發送郵件時發生錯誤，請稍後再試或直接聯繫我們。',
      JP: 'メール送信中にエラーが発生しました。しばらくしてから再試行するか、直接お問い合わせください。',
      EN: 'An error occurred while sending the email. Please try again later or contact us directly.'
    };
    res.status(500).json({
      success: false,
      message: errorMessages[lang] || errorMessages.CN
    });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Make sure to set EMAIL_USER and EMAIL_APP_PASSWORD in .env file`);
});

