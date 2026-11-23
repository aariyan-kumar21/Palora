const SITE_NAME = "Palora";
const WHATSAPP_NUMBER = ""; // TODO: business WhatsApp number, digits only with country code
const INSTAGRAM_URL = "https://www.instagram.com/palora.giftsstore";
const INSTAGRAM_HANDLE = "palora.giftsstore";
const EMAIL = ""; // optional

function hasWhatsApp() {
  return !!WHATSAPP_NUMBER;
}

function waLink(text) {
  return hasWhatsApp()
    ? "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text || "")
    : "";
}
