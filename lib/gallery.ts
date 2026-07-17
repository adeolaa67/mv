import { getPublicImages } from "./images";

export function getGalleryImages(): string[] {
  return getPublicImages("gallery");
}
