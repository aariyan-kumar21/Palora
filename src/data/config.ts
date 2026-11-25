export const SITE_NAME = "Palora";
export const WHATSAPP_NUMBER = "918248105952"; // TODO: business WhatsApp number, digits only with country code
export const INSTAGRAM_URL = "https://www.instagram.com/palora.giftsstore";
export const INSTAGRAM_HANDLE = "palora.giftsstore";
export const EMAIL = ""; // optional

export function hasWhatsApp(): boolean {
  return !!WHATSAPP_NUMBER;
}

export function waLink(text?: string): string {
  return hasWhatsApp()
    ? "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text || "")
    : "";
}
