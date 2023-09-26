import { importImage } from "astro-imagetools/api";

export const getImageSrcForSocialPreview = (src: string) => {
  return importImage(`${src}?width=800&q=60&format=jpg`);
};

export const PersonalPhotoPath = "/src/assets/images/LeonPahole.png";
