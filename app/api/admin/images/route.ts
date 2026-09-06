import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { siteContent } from "@/lib/content";
import { getGalleryEntries, getServiceImages, getStylistAvatarOverride, getShopBannerImage } from "@/lib/siteImages";
import { AUTO_GALLERY_REVIEWS } from "@/lib/galleryReviewPool";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;
  return isValid;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — client resizes before upload, this just guards the raw request
const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40MB — videos aren't resized client-side, so the cap is higher
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const [gallery, services, stylistAvatar, shopBanner] = await Promise.all([
      getGalleryEntries(),
      getServiceImages(),
      getStylistAvatarOverride(),
      getShopBannerImage(),
    ]);
    return NextResponse.json({
      gallery,
      services: siteContent.categories.map((c, i) => ({ slug: c.slug, name: c.name, url: services[i] })),
      stylistAvatar,
      shopBanner,
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

  const isVideoTarget = target === "wigProductVideo";
  const ext = isVideoTarget ? ALLOWED_VIDEO_TYPES[file.type] : ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: isVideoTarget ? "Only MP4, WebM, or MOV videos are allowed." : "Only JPEG, PNG, or WebP images are allowed." },
      { status: 400 },
    );
  }
  if (file.size > (isVideoTarget ? MAX_VIDEO_BYTES : MAX_BYTES)) {
    return NextResponse.json({ error: isVideoTarget ? "Video is too large." : "Image is too large." }, { status: 400 });
  }

  const id = randomUUID();
  const path = `uploads/${target}/${id}.${ext}`;

  try {
    const blob = await put(path, file, { access: "public", contentType: file.type });
    const url = blob.url;

    const db = getAdminDb();
    const docRef = db.collection("siteConfig").doc("images");

    if (target === "gallery") {
      const current = await getGalleryEntries();
      // Cycle through the review pool by position so consecutive uploads
      // don't repeat the same review until the pool wraps around.
      const review = AUTO_GALLERY_REVIEWS[current.length % AUTO_GALLERY_REVIEWS.length];
      const next = [...current, { id, url, ...review }];
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

    if (target === "shopBanner") {
      await docRef.set({ shopBanner: url }, { merge: true });
      return NextResponse.json({ ok: true, url });
    }

    if (target === "wigProduct") {
      const productId = String(formData.get("productId") ?? "");
      const productDoc = await db.collection("wigProducts").doc(productId).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: "Unknown product." }, { status: 400 });
      }
      await productDoc.ref.set({ imageUrl: url }, { merge: true });
      return NextResponse.json({ ok: true, url });
    }

    if (target === "wigProductVideo") {
      const productId = String(formData.get("productId") ?? "");
      const productDoc = await db.collection("wigProducts").doc(productId).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: "Unknown product." }, { status: 400 });
      }
      await productDoc.ref.set({ videoUrl: url }, { merge: true });
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

  let body: { id?: string; target?: string; productId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.target === "wigProductVideo" && body.productId) {
    try {
      const db = getAdminDb();
      const productDoc = await db.collection("wigProducts").doc(body.productId).get();
      const videoUrl = productDoc.data()?.videoUrl;
      await productDoc.ref.set({ videoUrl: "" }, { merge: true });
      if (typeof videoUrl === "string" && videoUrl.includes("/uploads/wigProductVideo/")) {
        await del(videoUrl).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Failed to remove product video:", error);
      return NextResponse.json({ error: "Failed to remove video." }, { status: 500 });
    }
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    const current = await getGalleryEntries();
    const target = current.find((e) => e.id === body.id);
    const next = current.filter((e) => e.id !== body.id);
    await getAdminDb().collection("siteConfig").doc("images").set({ gallery: next }, { merge: true });

    // Best-effort — only our own uploads live in Blob storage, local
    // /public defaults have no matching object to clean up.
    if (target && target.url.includes("/uploads/gallery/")) {
      await del(target.url).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    return NextResponse.json({ error: "Failed to delete image." }, { status: 500 });
  }
}
