import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb, getAdminBucket } from "@/lib/firebaseAdmin";
import { siteContent } from "@/lib/content";
import { getGalleryEntries, getServiceImages, getStylistAvatarOverride } from "@/lib/siteImages";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;
  return isValid;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — client resizes before upload, this just guards the raw request
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const [gallery, services, stylistAvatar] = await Promise.all([
      getGalleryEntries(),
      getServiceImages(),
      getStylistAvatarOverride(),
    ]);
    return NextResponse.json({
      gallery,
      services: siteContent.categories.map((c, i) => ({ slug: c.slug, name: c.name, url: services[i] })),
      stylistAvatar,
    });
  } catch (error) {
    console.error("Failed to load site images:", error);
    return NextResponse.json({ error: "Failed to load images." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const target = formData.get("target");

  if (!(file instanceof File) || typeof target !== "string") {
    return NextResponse.json({ error: "Missing file or target." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  const path = `uploads/${target}/${id}.${ext}`;

  try {
    const bucket = getAdminBucket();
    const blob = bucket.file(path);
    await blob.save(buffer, { metadata: { contentType: file.type } });
    await blob.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

    const db = getAdminDb();
    const docRef = db.collection("siteConfig").doc("images");

    if (target === "gallery") {
      const caption = String(formData.get("caption") ?? "").trim();
      const detail = String(formData.get("detail") ?? "").trim();
      const rating = Math.min(5, Math.max(1, Number(formData.get("rating")) || 5));
      const current = await getGalleryEntries();
      const next = [...current, { id, url, caption, rating, detail }];
      await docRef.set({ gallery: next }, { merge: true });
      return NextResponse.json({ ok: true, url, id });
    }

    if (target === "service") {
      const categorySlug = String(formData.get("categorySlug") ?? "");
      const category = siteContent.categories.find((c) => c.slug === categorySlug);
      if (!category) {
        return NextResponse.json({ error: "Unknown category." }, { status: 400 });
      }
      await docRef.set({ services: { [category.slug]: url } }, { merge: true });
      return NextResponse.json({ ok: true, url });
    }

    if (target === "stylist") {
      await docRef.set({ stylistAvatar: url }, { merge: true });
      return NextResponse.json({ ok: true, url });
    }

    return NextResponse.json({ error: "Unknown target." }, { status: 400 });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json({ error: "Failed to upload image." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    const current = await getGalleryEntries();
    const target = current.find((e) => e.id === body.id);
    const next = current.filter((e) => e.id !== body.id);
    await getAdminDb().collection("siteConfig").doc("images").set({ gallery: next }, { merge: true });

    // Best-effort — only our own uploads live under uploads/gallery/, local
    // /public defaults have no matching Storage object to clean up.
    if (target) {
      const match = target.url.match(/uploads\/gallery\/[^/]+$/);
      if (match) {
        await getAdminBucket()
          .file(match[0])
          .delete()
          .catch(() => {});
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    return NextResponse.json({ error: "Failed to delete image." }, { status: 500 });
  }
}
