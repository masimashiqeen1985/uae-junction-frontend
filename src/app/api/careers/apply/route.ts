// src/app/api/careers/apply/route.ts
// Server endpoint for the careers application form. Best-practice baseline:
// validates fields, restricts resume type/size, honeypot check. Plug in your
// real delivery (email/ATS/storage) where marked TODO. Never trust the client.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ROLES = new Set([
  "Graphic Designer",
  "Social Media Sales & Marketing",
  "SEO Specialist",
  "Junior Web & App Developer",
  "Speculative / Other",
]);

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    // Honeypot — silently accept to not tip off bots.
    if (fd.get("company")) return NextResponse.json({ ok: true });

    const role = String(fd.get("role") || "");
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const mobile = String(fd.get("mobile") || "").trim();
    const consent = fd.get("consent");
    const resume = fd.get("resume");

    if (!ROLES.has(role)) return bad("Invalid role.");
    if (name.length < 2) return bad("Name is required.");
    if (!isEmail(email)) return bad("Valid email is required.");
    if (mobile.length < 6) return bad("Valid mobile number is required.");
    if (!consent) return bad("Consent is required.");
    if (!(resume instanceof File)) return bad("Resume is required.");
    if (resume.size > MAX_BYTES) return bad("Resume exceeds 5 MB.");
    if (!ALLOWED.has(resume.type)) return bad("Resume must be PDF, DOC or DOCX.");

    // TODO: deliver the application. Options:
    //  - Email via Resend/SendGrid to careers@theuaejunction.com (attach resume buffer)
    //  - Push to your ATS / Google Sheet / database
    //  - Store the file in object storage (S3/R2) and email a link
    // const buf = Buffer.from(await resume.arrayBuffer());

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

function bad(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}
