// بوت نشر تلقائي لقناة واتساب
// التشغيل: npm install && node index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fs = require('fs');

// ====== الإعدادات ======
const DATA_PATH = process.env.DATA_PATH || '.'; // مجلد دائم لحفظ الجلسة
const CHANNEL_INVITE_CODE = process.env.CHANNEL_INVITE_CODE || 'ضع_كود_دعوة_القناة_هنا'; // الجزء الأخير من رابط القناة
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 */6 * * *'; // كل 6 ساعات (عدّلها حسب رغبتك)
const MESSAGES_FILE = './messages.json';
const STATE_FILE = `${DATA_PATH}/state.json`;
// =======================

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: `${DATA_PATH}/session` }),
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  },
});

function loadMessages() {
  return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
}

function nextIndex(total) {
  let i = 0;
  try { i = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')).i || 0; } catch {}
  fs.writeFileSync(STATE_FILE, JSON.stringify({ i: (i + 1) % total }));
  return i % total;
}

async function postNext() {
  try {
    const messages = loadMessages();
    if (!messages.length) return console.log('لا توجد رسائل في messages.json');
    const channel = await client.getChannelByInviteCode(CHANNEL_INVITE_CODE);
    const text = messages[nextIndex(messages.length)];
    await channel.sendMessage(text);
    console.log(new Date().toLocaleString(), '✅ تم النشر');
  } catch (e) {
    console.error('❌ فشل النشر:', e.message);
  }
}

client.on('qr', (qr) => {
  console.log('امسح الكود من واتساب > الأجهزة المرتبطة:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('البوت جاهز 🚀');
  cron.schedule(CRON_SCHEDULE, postNext);
});

client.initialize();
