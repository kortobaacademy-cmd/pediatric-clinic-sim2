# عيادة التدريب — نسخة مستقلة (Netlify)

تطبيق تدريب تفاعلي على حالات أطفال، بالصوت والنص، شغال برة Claude artifacts عشان المايك (STT) يشتغل 100%.

## هيكل المشروع

```
pediatric-clinic-sim/
├── index.html                    ← الواجهة (React عن طريق CDN، بدون خطوة build)
├── netlify/
│   └── functions/
│       └── claude.js              ← Netlify Function بتحمي الـ API key وتعمل proxy لـ Anthropic
├── netlify.toml                   ← إعدادات النشر
├── package.json
└── README.md
```

## ليه محتاج backend؟

عشان تقدر تستدعي Claude API من المتصفح، المفروض تحط الـ API key في الكود — وده معناه أي حد فاتح صفحتك يقدر ياخده وينسخه ويستخدمه على حسابك. الدالة اللي في `netlify/functions/claude.js` بتشتغل على السيرفر (مش في متصفح المستخدم)، وبتاخد الـ key من environment variable، فمفيش أي مكان في الكود اللي بيوصله المتصفح يشوف الـ key.

## خطوات النشر على Netlify (مجانًا) — من الصفر

### 1. جهّز الملفات على GitHub

- روح [github.com](https://github.com) واعمل حساب لو مش عندك.
- دوس **+** فوق يمين الصفحة → **New repository**.
- اكتب اسم زي `pediatric-clinic-sim`، سيبه **Public**، ومتحطش README ولا .gitignore، دوس **Create repository**.
- في صفحة الـ repo الفاضي، دوس على رابط **uploading an existing file**.
- ارفع الملفات دي بالسحب والإفلات: `index.html`, `netlify.toml`, `package.json`, `README.md`، ودوس **Commit changes**.
- بعد كده لازم تضيف `claude.js` جوه فولدرين: دوس **Add file → Create new file**، اكتب اسم الملف كـ:
  ```
  netlify/functions/claude.js
  ```
  (لما تكتب `/` هيعمل الفولدرات أوتوماتيك). الصق فيه محتوى الملف اللي بعتهولك، ودوس **Commit changes**.

في الآخر لازم يبقى شكل الـ repo كده:
```
pediatric-clinic-sim/
├── index.html
├── netlify.toml
├── package.json
├── README.md
└── netlify/
    └── functions/
        └── claude.js
```

### 2. اعمل حساب Netlify واربطه بـ GitHub

- روح [netlify.com](https://netlify.com) → **Sign up** → اختار **GitHub** (هيربطهم لبعض على طول).
- وافق على صلاحية الوصول لحسابك على GitHub.

### 3. انشر المشروع

- بعد الدخول، دوس **Add new site → Import an existing project**.
- اختار **GitHub**، وهتلاقي الـ repo بتاعك `pediatric-clinic-sim` ظاهر — دوسه.
- لو مش ظاهر، دوس على رابط ضبط الصلاحيات وضيف الوصول للـ repo.
- في إعدادات النشر:
  - **Build command:** سيبه فاضي.
  - **Publish directory:** اكتب `.` (نقطة، يعني الفولدر الرئيسي).
- **متضغطش Deploy لسه** — روح للخطوة الجاية الأول عشان تضيف الـ API key. لو دوست Deploy بالغلط، معلش، هتظبطها بعد كده وتعمل Redeploy.

### 4. ضيف الـ API key (الخطوة الأهم)

- في نفس صفحة الإعداد، هتلاقي قسم **Environment variables** — وسّعه ولو مش ظاهر، أو روح بعد النشر لـ **Site configuration → Environment variables**.
- ضيف:
  - **Key:** `ANTHROPIC_API_KEY`
  - **Value:** الـ API key بتاعك (من [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key)
- (اختياري لكن منصوح بيه) ضيف كمان:
  - **Key:** `APP_SECRET`
  - **Value:** أي كلمة سر طويلة من اختيارك (مثلاً `athar-clinic-2026-xyz123`)

### 5. Deploy

- دوس **Deploy site**.
- استنى دقيقة، هيديك رابط شكله `https://random-name-123.netlify.app` (تقدر تغيّر الاسم من **Site configuration → Change site name**).

### 6. لو استخدمت APP_SECRET

ارجع لـ GitHub، افتح `index.html`، عدّل السطر:
```html
window.APP_SECRET = "";
```
لـ:
```html
window.APP_SECRET = "athar-clinic-2026-xyz123";
```
(نفس القيمة اللي حطيتها في Netlify). بعد ما تحفظ التعديل على GitHub، Netlify هينشر النسخة الجديدة أوتوماتيك لوحده.

لو مش عايز الحماية دي دلوقتي، سيب الأمر زي ما هو وامسح الـ `APP_SECRET` variable من Netlify.

### 7. جرّب التطبيق

- افتح الرابط على Chrome.
- وافق على إذن المايك لما يطلبه.
- ابدأ حالة، اسأل بالصوت أو الكتابة، وشوف كل حاجة شغالة.

## ملاحظات

- **التكلفة:** كل مكالمة لـ Claude API بتتحسب على حسابك في Anthropic Console (مش مجانية زي Netlify نفسه). لو هتبعته لطلاب كتير، تابع الاستهلاك من [console.anthropic.com](https://console.anthropic.com/settings/usage).
- **الصوت العربي:** لسه بيعتمد على نظام تشغيل الجهاز اللي بيفتح منه المستخدم — مفيش حل تقني لده غير استخدام خدمة TTS خارجية لو حبيت جودة صوت أفضل وموحدة لكل المستخدمين.
- **الفرق عن نسخة Vercel:** غيّرنا مسار استدعاء الـ API في `index.html` من `/api/claude` لـ `/.netlify/functions/claude`، وأعدنا كتابة دالة السيرفر بصيغة Netlify Functions (`exports.handler` بدل `module.exports`). الباقي كله زي ما هو بالظبط.
