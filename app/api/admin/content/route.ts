import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { siteContent as defaultContent } from "@/lib/content";
import { getEffectiveSiteContent } from "@/lib/siteContentOverrides";
import { SiteContentOverrides } from "@/lib/types";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;
  return isValid;
}

// GET returns the *effective* content (defaults merged with any saved
// overrides) so the admin form is always pre-filled with what's actually
// live on the site, not just the diff.
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const content = await getEffectiveSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Failed to load site content:", error);
    return NextResponse.json({ error: "Failed to load content." }, { status: 500 });
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: SiteContentOverrides;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.brand && (!isNonEmptyString(body.brand.tagline) || !isNonEmptyString(body.brand.location))) {
    return NextResponse.json({ error: "Tagline and location can't be empty." }, { status: 400 });
  }
  if (body.stylist && !isNonEmptyString(body.stylist.bio)) {
    return NextResponse.json({ error: "Bio can't be empty." }, { status: 400 });
  }
  if (body.hours) {
    if (
      body.hours.length !== defaultContent.hours.length ||
      !body.hours.every((h) => isNonEmptyString(h.label) && isNonEmptyString(h.time))
    ) {
      return NextResponse.json({ error: "Invalid hours." }, { status: 400 });
    }
  }
  if (body.contact) {
    if (
      body.contact.length !== defaultContent.contact.length ||
      !body.contact.every((c) => isNonEmptyString(c.label))
    ) {
      return NextResponse.json({ error: "Invalid contact info." }, { status: 400 });
    }
  }
  if (body.policies) {
    if (
      body.policies.length !== defaultContent.policies.length ||
      !body.policies.every((p) => isNonEmptyString(p.title) && isNonEmptyString(p.body))
    ) {
      return NextResponse.json({ error: "Invalid policies." }, { status: 400 });
    }
  }
  if (body.purchaseGuide) {
    if (
      body.purchaseGuide.length !== defaultContent.purchaseGuide.length ||
      !body.purchaseGuide.every((s) => isNonEmptyString(s.title) && isNonEmptyString(s.body))
    ) {
      return NextResponse.json({ error: "Invalid purchase guide." }, { status: 400 });
    }
  }
  if (body.services) {
    if (
      body.services.length !== defaultContent.services.length ||
      !body.services.every(
        (s) =>
          isNonEmptyString(s.name) &&
          isNonEmptyString(s.description) &&
          isNonEmptyString(s.care) &&
          isNonEmptyString(s.duration) &&
          isNonEmptyString(s.priceFrom),
      )
    ) {
      return NextResponse.json({ error: "Invalid services." }, { status: 400 });
    }
  }

  try {
    await getAdminDb().collection("siteConfig").doc("overrides").set(
      { ...body, updatedAt: new Date() },
      { merge: true },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save site content overrides:", error);
    return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
  }
}
