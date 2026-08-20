export type WigVariant = { id: string; length: string; texture: string; lace: string; pricePence: number };
export type WigProduct = { id: string; name: string; description: string; imageUrl: string; variants: WigVariant[] };

// Fixed 4 product slots, same fixed-count pattern as the 5 service categories
// — the admin edits these 4, doesn't add/remove products. Pure types/consts
// here (no firebaseAdmin import) so client components can safely import
// this module — the Firestore reads live in wigProductsServer.ts instead.
export const WIG_PRODUCT_IDS = ["1", "2", "3", "4"];
