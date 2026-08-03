/**
 * Utility helper to share text/reports via native Web Share API on Mobile / PWA
 * or fallback to WhatsApp API without spawning blank windows/tabs.
 */
export async function shareTextOrWhatsApp(
  text: string,
  title = 'Laure Joyas',
  onFallbackCopy?: () => void
): Promise<boolean> {
  const encoded = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;

  // 1. Try Native Web Share API (Primary for Mobile iOS/Android/PWA)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
      });
      return true;
    } catch (e) {
      // User cancelled native share sheet
      if (e instanceof Error && (e.name === 'AbortError' || e.message.includes('Canceled'))) {
        return false;
      }
    }
  }

  // 2. Mobile fallback without Web Share: use location.href to prevent _blank empty tabs in PWA
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = whatsappUrl;
  } else {
    // 3. Desktop browser: open WhatsApp Web safely
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  if (onFallbackCopy) {
    onFallbackCopy();
  }

  return true;
}
