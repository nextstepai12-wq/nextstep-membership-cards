// send-card — يرسل بطاقة العضوية (صورة PNG) مع رسالة ترحيب إلى بريد العضو عبر Resend.
// يعمل كدالة Supabase Edge (Deno). انظر README لخطوات النشر.

const env = (key: string, fallback = ""): string => Deno.env.get(key) ?? fallback;

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NUMBER_RE = /^[A-Za-z0-9_-]{3,40}$/;

/* ---------- حدّ بسيط لعدد الطلبات (على مستوى النسخة الواحدة، best-effort) ---------- */

const hits = new Map<string, number[]>();

export function rateLimited(key: string, max: number, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

/* ---------- CORS ---------- */

function corsHeaders(req: Request): Record<string, string> {
  const allowed = env("ALLOWED_ORIGINS", "*").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.get("origin") ?? "";
  const allow = allowed.includes("*") ? "*" : allowed.includes(origin) ? origin : allowed[0] ?? "";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function reply(req: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json; charset=utf-8" },
  });
}

/* ---------- أدوات ---------- */

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

function safeUrl(value: string): string {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

/** يتحقق أن النص Data URL لصورة PNG حقيقية وبحجم معقول، ويعيد Base64 فقط. */
export function extractPngBase64(dataUrl: unknown): string | null {
  const prefix = "data:image/png;base64,";
  if (typeof dataUrl !== "string" || !dataUrl.startsWith(prefix)) return null;

  const b64 = dataUrl.slice(prefix.length);
  if (b64.length === 0 || b64.length * 0.75 > MAX_IMAGE_BYTES) return null;

  try {
    const head = atob(b64.slice(0, 16));
    for (let i = 0; i < PNG_SIGNATURE.length; i++) {
      if (head.charCodeAt(i) !== PNG_SIGNATURE[i]) return null;
    }
  } catch {
    return null;
  }
  return b64;
}

/* ---------- التحقق من وجود العضو (اختياري: يفعَّل بضبط MEMBERS_TABLE) ---------- */

export const deps = {
  async verifyMember(number: string, email: string): Promise<boolean> {
    const table = env("MEMBERS_TABLE");
    if (!table) return true;

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const client = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

    const numberColumn = env("MEMBERS_NUMBER_COLUMN", "membership_number");
    const emailColumn = env("MEMBERS_EMAIL_COLUMN", "email");

    const { data, error } = await client
      .from(table)
      .select(numberColumn)
      .eq(numberColumn, number)
      .eq(emailColumn, email)
      .limit(1);

    if (error) {
      console.error("verifyMember error:", error.message);
      return false;
    }
    return Array.isArray(data) && data.length > 0;
  },
};

/* ---------- محتوى الرسالة ---------- */

export function buildEmail(name: string, number: string) {
  const website = safeUrl(env("WEBSITE_LINK", "https://nextstepai12-wq.github.io/nextstep-ai-landing/"));
  const community = safeUrl(env("COMMUNITY_LINK"));
  const n = escapeHtml(name);
  const num = escapeHtml(number);

  const button = (href: string, label: string, bg: string) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;margin:4px;padding:12px 22px;border-radius:12px;background:${bg};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px">${label}</a>`;

  const buttons = [
    community ? button(community, "انضم إلى مجموعة المجتمع", "#0b56c9") : "",
    website ? button(website, "زيارة موقع NextStep AI", "#0d1b3d") : "",
  ].join("");

  const subject = `أهلاً بك في مجتمع NextStep AI 🎉 — بطاقة عضويتك جاهزة`;

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<body style="margin:0;background:#eaf5fc;font-family:Tahoma,Arial,sans-serif;color:#0d1b3d">
  <div style="max-width:580px;margin:0 auto;padding:24px 14px">
    <div style="background:#0d1b3d;border-radius:20px 20px 0 0;padding:26px 20px;text-align:center;color:#ffffff">
      <div style="font-size:26px;font-weight:800;letter-spacing:.3px">NextStep AI</div>
      <div style="font-size:13px;opacity:.85;margin-top:4px" dir="ltr">Your Next Step. Smarter with AI.</div>
    </div>
    <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 20px 20px;line-height:1.9;font-size:15px">
      <h1 style="font-size:22px;margin:0 0 10px">أهلاً بك في مجتمعنا يا ${n} 🎉</h1>
      <p style="margin:0 0 10px">يسعدنا انضمامك إلى <strong>مجتمع NextStep AI</strong>، مساحتنا لتتعلّم وتبني وتكبر مع أشخاص يشاركونك الشغف بالذكاء الاصطناعي.</p>
      <p style="margin:0 0 6px">رقم عضويتك: <strong dir="ltr" style="color:#0b56c9">${num}</strong></p>
      <p style="margin:0 0 14px">بطاقتك الرسمية مرفقة بهذه الرسالة كصورة، ويمكنك حفظها ومشاركتها.</p>
      <div style="text-align:center;margin:18px 0">
        <img src="cid:membership-card" alt="بطاقة العضوية" width="300" style="max-width:100%;height:auto;border-radius:18px">
      </div>
      <div style="text-align:center;margin:18px 0 6px">${buttons}</div>
      <p style="margin:16px 0 0;font-size:13px;color:#5f7285">شارك بطاقتك على LinkedIn وادعُ أصدقاءك للانضمام إلينا.</p>
    </div>
    <p style="text-align:center;font-size:12px;color:#7a8ea1;margin:14px 0 0">وصلتك هذه الرسالة لأنك أنشأت بطاقة عضوية في مجتمع NextStep AI. إن لم تكن أنت، تجاهلها.</p>
  </div>
</body>
</html>`;

  const text = [
    `أهلاً بك في مجتمعنا يا ${name} 🎉`,
    "",
    "يسعدنا انضمامك إلى مجتمع NextStep AI.",
    `رقم عضويتك: ${number}`,
    "بطاقتك الرسمية مرفقة بهذه الرسالة كصورة.",
    community ? `\nانضم إلى المجتمع: ${community}` : "",
    website ? `موقعنا: ${website}` : "",
  ].filter((line) => line !== "").join("\n");

  return { subject, html, text };
}

/* ---------- المعالج الرئيسي ---------- */

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, { ok: false, error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply(req, { ok: false, error: "بيانات غير صالحة." }, 400);
  }

  const email = String(body.email ?? "").trim();
  const name = String(body.name ?? "").trim();
  const number = String(body.membership_number ?? "").trim();
  const imageB64 = extractPngBase64(body.image);

  if (!EMAIL_RE.test(email) || email.length > 254) return reply(req, { ok: false, error: "البريد الإلكتروني غير صحيح." }, 400);
  if (name.length < 1 || name.length > 80) return reply(req, { ok: false, error: "الاسم غير صالح." }, 400);
  if (!NUMBER_RE.test(number)) return reply(req, { ok: false, error: "رقم العضوية غير صالح." }, 400);
  if (!imageB64) return reply(req, { ok: false, error: "صورة البطاقة غير صالحة أو كبيرة جدًا." }, 400);

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(`email:${email.toLowerCase()}`, 3) || rateLimited(`ip:${ip}`, 20)) {
    return reply(req, { ok: false, error: "تم تجاوز عدد المحاولات. حاول لاحقًا." }, 429);
  }

  if (!(await deps.verifyMember(number, email))) {
    return reply(req, { ok: false, error: "لم نجد عضوية مطابقة لهذه البيانات." }, 403);
  }

  const apiKey = env("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return reply(req, { ok: false, error: "خدمة البريد غير مهيّأة بعد." }, 500);
  }

  const { subject, html, text } = buildEmail(name, number);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env("FROM_EMAIL", "NextStep AI <onboarding@resend.dev>"),
      to: [email],
      subject,
      html,
      text,
      attachments: [{
        filename: `NextStep-AI-${number}.png`,
        content: imageB64,
        content_id: "membership-card",
      }],
    }),
  });

  if (!response.ok) {
    console.error("Resend error:", response.status, await response.text());
    return reply(req, { ok: false, error: "تعذر إرسال الرسالة الآن. حاول لاحقًا." }, 502);
  }

  return reply(req, { ok: true });
}
