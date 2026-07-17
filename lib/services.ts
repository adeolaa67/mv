import { getPublicImages } from "./images";

export function getServiceImages(): string[] {
  return getPublicImages("services");
}
