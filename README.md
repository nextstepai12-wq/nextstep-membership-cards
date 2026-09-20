<div align="center">

<img src="assets/logo-header.png" alt="NextStep AI — مجتمع NextStep Community" width="520" />

# NextStep AI Membership Card
### مولّد بطاقات عضوية مجتمع NextStep AI

صفحة ويب واحدة تُنشئ بطاقة عضوية رسمية برقم فريد ورمز QR، وتتيح للعضو تحميلها ومشاركتها.

![Static site](https://img.shields.io/badge/site-static%20HTML-0d1b3d?style=flat-square)
![Backend](https://img.shields.io/badge/backend-Supabase-3ecf8e?style=flat-square)
![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-2f6bff?style=flat-square)
![Build](https://img.shields.io/badge/build%20step-none-29b6f6?style=flat-square)

**[العربية](#العربية) · [English](#english)**

<img src="assets/page-preview.png" alt="معاينة الصفحة" width="720" />

</div>

---

<a id="العربية"></a>

<div dir="rtl" align="right">

## العربية

### نظرة عامة

يدخل العضو اسمه وتخصصه وبريده وصورته، فتُنشئ الصفحة بطاقة بحجم 1024×1536 بكسل عبر عنصر `canvas`،
وتحمل رقم عضوية فريداً يصدر من قاعدة بيانات Supabase. لا توجد خطوة بناء ولا اعتماد على إطار عمل:
الصفحة كلها في ملف `index.html` واحد.

### المزايا

| الميزة | التفاصيل |
|---|---|
| **بطاقة جاهزة للطباعة والمشاركة** | تصميم موحّد بالشعار الثابت، الصورة، الاسم، الصفة، التخصص، رقم العضوية، وسنة الانضمام |
| **رقم عضوية فريد** | يُولَّد في Supabase عبر الدالة `create_member`، فلا يتكرر |
| **رمز QR محلي** | يُولَّد داخل الصفحة بلا مكتبات خارجية، ويختار أصغر إصدار (1–5) يناسب الرابط ليكون أسهل مسحاً |
| **تحميل** | صورة PNG بجودة كاملة |
| **رسالة ترحيب + بريد تلقائي** | بعد إنشاء البطاقة تظهر رسالة ترحيب باسم العضو، وتُرسَل البطاقة (صورة PNG) إلى بريده مع رسالة ترحيب عبر دالة `send-card`. بدون الدالة يفتح زر «إيميل» رسالة بريد جاهزة |
| **مشاركة LinkedIn** | يفتح نافذة المشاركة وينسخ نص المنشور جاهزاً |
| **خلفية ثلاثية الأبعاد** | Three.js: سلّم وسهم (الخطوة التالية)، شبكة مجتمع، نواة ذكاء اصطناعي، وقبعة تخرج. اختيارية: تعمل الصفحة بدونها |
| **شاشة واحدة بلا سكرول** | على الكمبيوتر: النموذج ومعاينة البطاقة جنبًا إلى جنب. على الجوال: شاشة النموذج ثم شاشة البطاقة مع زر «تعديل» |
| **معاينة حيّة** | تظهر بطاقة نموذجية على الشاشات الكبيرة قبل الإنشاء |
| **واجهة عربية RTL** | متجاوبة مع الجوال، وتحترم تفضيل تقليل الحركة |
| **قص ذكي للصورة** | الصور الطولية تُقصّ من الأعلى ليظهر الرأس كاملاً |

### كيف تعمل

```
النموذج ──► تجهيز الصورة والخطوط والـQR ──► رفع الصورة إلى Supabase Storage
                                                    │
        عرض البطاقة وأزرارها ◄── رسم البطاقة ◄── create_member (رقم العضوية)
```

يتم التحقق من الصورة وتحميل الخطوط **قبل** إنشاء العضوية، حتى لا يُستهلك رقم عضوية إذا فشل الرسم.

### هيكل المشروع

```
.
├── index.html                    الصفحة كاملة (HTML + CSS + JS + الشعار مدمج)
├── assets/
│   ├── logo-original.png         الشعار الأصلي (للرجوع إليه)
│   ├── logo-header.png           الشعار كما يظهر في البطاقة
│   ├── card-preview.png          بطاقة نموذجية
│   └── page-preview.png          معاينة الصفحة في هذا الملف
├── supabase/functions/send-card/ دالة Edge لإرسال البطاقة بالبريد (Resend)
│   ├── index.ts
│   └── handler.ts
├── .github/workflows/pages.yml   نشر تلقائي على GitHub Pages
├── .nojekyll
└── README.md
```

### التشغيل محلياً

```bash
git clone https://github.com/nextstepai12-wq/nextstep-membership-card.git
cd nextstep-membership-card
python3 -m http.server 8080
# افتح http://localhost:8080
```

> استخدم `localhost` أو HTTPS ولا تفتح الملف مباشرة (`file://`)، فنسخ النص والمشاركة يحتاجان سياقاً آمناً.

### الإعدادات

كل الإعدادات في كائن `CONFIG` أعلى سكربت `index.html`:

| المفتاح | الوصف | الافتراضي |
|---|---|---|
| `SUPABASE_URL` | رابط مشروع Supabase | — |
| `SUPABASE_ANON_KEY` | المفتاح العام (publishable) المخصّص للمتصفح | — |
| `STORAGE_BUCKET` | اسم الـ bucket الذي تُرفع إليه صور الأعضاء | `member-photos` |
| `EDGE_FUNCTION_URL` | رابط دالة `send-card`. **فارغ** = يحمّل البطاقة ويفتح رسالة بريد جاهزة | رابط مشروعك |
| `AUTO_SEND_EMAIL` | إرسال البطاقة تلقائيًا لبريد العضو بعد إنشائها | `true` |
| `COMMUNITY_LINK` | رابط المجتمع، ويُستخدم في الـ QR فقط عند `QR_VALUE_SOURCE = "community"` | رابط تجريبي |
| `WEBSITE_LINK` | رابط الموقع (وجهة الـ QR ونص LinkedIn) | `https://nextstepai.stream` |
| `QR_VALUE_SOURCE` | `"website"` أو `"community"` | `"website"` |
| `MAX_PHOTO_MB` | أقصى حجم للصورة بالميغابايت | `8` |
| `PHOTO_TOP_BIAS` | موضع قص الصور الطولية: `0` رأس كامل، `0.5` من المنتصف | `0.12` |

لعرض دليل الإعداد داخل الصفحة افتحها بالشكل `?setup`.

### إعداد Supabase

تتوقع الصفحة العقد التالي:

- **Storage:** bucket عام باسم `member-photos` (الرفع مسموح للعامة، والقراءة عبر الروابط العامة).
- **RPC:** دالة `create_member` تستقبل `p_name` و`p_specialization` و`p_email` و`p_photo_url`،
  وترجع صفاً (أو مصفوفة بصف واحد) فيه الحقل `membership_number`.
  إن لم يُرجَع الحقل تستخدم الصفحة رقماً مؤقتاً بصيغة `NS-<timestamp>`.

مخطط قاعدة البيانات نفسه (الجدول والدالة والسياسات) يُحفظ في ملف `supabase-schema.sql` ويُشغَّل مرة واحدة من **SQL Editor**.

### إرسال البطاقة إلى بريد العضو

تُرسَل رسالة ترحيب مع البطاقة (مرفقة ومعروضة داخل الرسالة) عبر دالة Supabase Edge اسمها `send-card` تستخدم خدمة [Resend](https://resend.com).

1. **Resend:** أنشئ حسابًا وأنشئ **API Key**، ثم وثّق دومينك من *Domains* (مطلوب لإرسال رسائل لأعضاء عاديين؛ العنوان التجريبي `onboarding@resend.dev` يرسل فقط إلى بريد صاحب الحساب).
2. **نشر الدالة** (تحتاج [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase login
   supabase link --project-ref fwlwkshvrxhctplfbdfq
   supabase functions deploy send-card --no-verify-jwt
   ```
   خيار `--no-verify-jwt` ضروري لأن الصفحة تستدعيها من المتصفح بمفتاح publishable، والدالة تتحقق من الطلبات بنفسها.
3. **الأسرار (Secrets):**
   ```bash
   supabase secrets set \
     RESEND_API_KEY="re_xxxxxxxx" \
     FROM_EMAIL="NextStep AI <community@your-domain.com>" \
     COMMUNITY_LINK="https://chat.whatsapp.com/..." \
     WEBSITE_LINK="https://nextstepai12-wq.github.io/nextstep-ai-landing/" \
     ALLOWED_ORIGINS="https://nextstepai12-wq.github.io" \
     MEMBERS_TABLE="members"
   ```
   | السر | الوصف |
   |---|---|
   | `RESEND_API_KEY` | مفتاح Resend (مطلوب) |
   | `FROM_EMAIL` | عنوان المُرسِل بعد توثيق الدومين |
   | `COMMUNITY_LINK` / `WEBSITE_LINK` | أزرار داخل الرسالة |
   | `ALLOWED_ORIGINS` | الأصول المسموح لها باستدعاء الدالة من المتصفح (افتراضيًا `*`) |
   | `MEMBERS_TABLE` | **موصى به:** اسم جدول الأعضاء؛ فتتحقق الدالة أن رقم العضوية والبريد موجودان فعلًا قبل الإرسال. أسماء الأعمدة الافتراضية `membership_number` و`email`، ويمكن تغييرها بـ `MEMBERS_NUMBER_COLUMN` و`MEMBERS_EMAIL_COLUMN` |
4. **اختبار سريع:**
   ```bash
   curl -i -X POST "https://fwlwkshvrxhctplfbdfq.supabase.co/functions/v1/send-card" \
     -H "Content-Type: application/json" \
     -d '{"email":"you@example.com","name":"اسم تجريبي","membership_number":"NS-2026-00001","image":"data:image/png;base64,..."}'
   ```

**الحماية المدمجة:** التحقق من صيغة البريد والاسم ورقم العضوية، وقبول صور PNG حقيقية فقط بحد أقصى 3 ميغابايت، وتهريب النص داخل قالب البريد (HTML escaping)، وحدّ 3 رسائل/ساعة لكل بريد و20 لكل IP، وتحقق اختياري من وجود العضو في قاعدة البيانات. لا تُرسَل أي رسالة إلا بقالب الدالة الثابت.

إن فشل الإرسال (الدالة غير منشورة أو خطأ في Resend) تعرض الصفحة رسالة لطيفة، ويبقى زر «إيميل» يحمّل البطاقة ويفتح رسالة بريد جاهزة.

### النشر على GitHub Pages

1. ارفع المشروع إلى مستودع **Public** على فرع `main`.
2. من **Settings → Pages** اختر **Source: GitHub Actions**، وسيُنشر الموقع تلقائياً مع كل `push`.
   (بديل: **Deploy from a branch** ← `main` ← `/ (root)`).
3. لدومين خاص أضفه في **Custom domain** ثم أنشئ سجل `CNAME` عند مزوّد الدومين يشير إلى `nextstepai12-wq.github.io`.

### الأمان

- المفتاح `anon / publishable` مصمَّم ليظهر في المتصفح، **لكن حمايته تعتمد على Row Level Security**.
  فعّله، وامنع القراءة والتعديل والحذف للعامة، واجعل الإدراج يمر عبر `create_member` فقط.
- سياسة الـ bucket تسمح **بالرفع فقط** (مع القراءة العامة للصور)، بلا حذف أو تعديل.
- لا تضع مفتاح `service_role` أو أي سر في هذا المستودع.
- روابط الصور عامة بطبيعتها، فأخبر الأعضاء بذلك في سياسة الخصوصية.

### تخصيص التصميم

- **الشعار:** مخزَّن في الثابت `LOGO_HEADER_SRC` كصورة PNG شفافة (853×167 بكسل) تُرسم في أعلى البطاقة وفي رأس الصفحة.
  لتبديله جهّز صورة بنفس الأبعاد ثم حوّلها:
  ```bash
  base64 -w0 assets/logo-header.png   # على macOS: base64 -i assets/logo-header.png
  ```
  والصق الناتج بعد `data:image/png;base64,`.
- **البطاقة:** تُرسم في الدالة `drawCard` بإحداثيات ثابتة على قماش 1024×1536، والزخارف في `drawBackground`.
- **الألوان:** المتغيرات في `:root` أعلى ملف الـ CSS، وألوان البطاقة داخل دوال الرسم.
- **الخطوط:** Tajawal للنصوص و Aref Ruqaa لعبارة التذييل، من Google Fonts.

### استكشاف الأخطاء

| المشكلة | السبب والحل |
|---|---|
| «تعذر تحميل Supabase» | تحقّق من الاتصال وأن `cdn.jsdelivr.net` غير محجوب |
| «تعذر رفع الصورة» | راجع سياسات Storage (يجب السماح بالرفع للـ bucket) وتأكد من اسم الـ bucket |
| «تعذر إنشاء العضوية» | راجع اسم الدالة `create_member` وأسماء معاملاتها وصلاحية `EXECUTE` للدور `anon` |
| البطاقة بخط مختلف | تعذّر تحميل Google Fonts؛ أعد المحاولة أو استضف الخطوط محلياً |
| «رابط QR طويل جدًا» | الحد الأقصى 106 بايت؛ استخدم رابطاً أقصر |
| نسخ نص LinkedIn لا يعمل | افتح الصفحة عبر HTTPS أو `localhost` |

### الاعتماديات الخارجية

| المكتبة | الاستخدام | المصدر |
|---|---|---|
| Supabase JS | قاعدة البيانات والتخزين | jsDelivr |
| Three.js r128 | الخلفية ثلاثية الأبعاد (اختيارية) | cdnjs |
| Tajawal + Aref Ruqaa | الخطوط | Google Fonts |

### الترخيص

جميع الحقوق محفوظة © NextStep AI. الشعار والهوية البصرية ملك لأصحابها ولا يجوز إعادة استخدامها دون إذن.

</div>

---

<a id="english"></a>

## English

### Overview

A single-page web app that generates an official membership card for the **NextStep AI** community.
Members enter their name, title, specialization, email and photo; the page renders a 1024×1536 card on a
`<canvas>` with a unique membership number issued by Supabase and a locally generated QR code.
No build step, no framework, everything lives in `index.html`.

### Features

- Branded card: fixed logo, photo, name, role, specialization, member number and join year
- Unique membership numbers from Supabase (`create_member` RPC)
- Dependency-free QR generator (versions 1–5, ECC level L, picks the smallest version that fits)
- Welcome message on creation, plus the card emailed to the member automatically (Supabase Edge Function + Resend) with a fallback to a prefilled mail draft
- Download as PNG and LinkedIn sharing with copied post text
- 3D Three.js background (staircase + arrow, community network, AI core, graduation cap), optional: the page works without it
- Single-screen layout with no page scroll: side-by-side form and live card preview on desktop, form → card screens on phones
- Arabic RTL UI, mobile-friendly, honors `prefers-reduced-motion`
- Top-biased photo cropping so heads are not cut off in portrait photos

### Quick start

```bash
git clone https://github.com/nextstepai12-wq/nextstep-membership-card.git
cd nextstep-membership-card
python3 -m http.server 8080   # then open http://localhost:8080
```

Serve over `localhost` or HTTPS; clipboard access does not work from `file://`.

### Configuration

Edit the `CONFIG` object at the top of the script in `index.html`:

| Key | Description |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Your Supabase project URL and publishable (anon) key |
| `STORAGE_BUCKET` | Public bucket for member photos (`member-photos`) |
| `EDGE_FUNCTION_URL` | URL of the `send-card` Edge Function. Empty = download the card and open a prefilled mail draft |
| `AUTO_SEND_EMAIL` | Email the card automatically right after creation (default `true`) |
| `COMMUNITY_LINK` / `WEBSITE_LINK` | Link targets; `QR_VALUE_SOURCE` (`"website"` or `"community"`) picks the QR destination |
| `MAX_PHOTO_MB` | Maximum photo size (default `8`) |
| `PHOTO_TOP_BIAS` | Portrait crop anchor: `0` = top, `0.5` = center (default `0.12`) |

Open the page with `?setup` to show the built-in setup guide.

### Supabase contract

- **Storage:** a public bucket named `member-photos` that allows uploads.
- **RPC:** `create_member(p_name, p_specialization, p_email, p_photo_url)` returning a row with `membership_number`.
- Keep your schema in `supabase-schema.sql` and run it once in the SQL Editor.
- Enable **Row Level Security**. The anon key is public by design, so never commit a `service_role` key.

### Email delivery (welcome message + card)

`supabase/functions/send-card` sends a branded welcome email with the card attached and embedded, through [Resend](https://resend.com).

```bash
supabase link --project-ref <your-project-ref>
supabase functions deploy send-card --no-verify-jwt
supabase secrets set RESEND_API_KEY=... FROM_EMAIL="NextStep AI <community@your-domain.com>" \
  COMMUNITY_LINK=... ALLOWED_ORIGINS=https://nextstepai12-wq.github.io MEMBERS_TABLE=members
```

Verify your sending domain in Resend (the `onboarding@resend.dev` sender only delivers to the account owner). The function validates input, accepts real PNGs up to 3 MB only, escapes HTML, rate-limits (3/hour per email, 20/hour per IP) and, when `MEMBERS_TABLE` is set, checks that the member exists before sending.

### Deploy

1. Push to a **public** repository on `main`.
2. **Settings → Pages → Source: GitHub Actions** (or *Deploy from a branch* → `main` → `/ (root)`).
3. Optional custom domain: add it under **Custom domain** and point a `CNAME` record to `nextstepai12-wq.github.io`.

### License

All rights reserved © NextStep AI. The logo and brand identity may not be reused without permission.
