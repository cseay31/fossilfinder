// Shared HTML-escaping helper for backend functions that interpolate
// user-supplied values into email HTML bodies. Prevents HTML/CSS injection
// (phishing, content spoofing) by neutralizing special characters.
export function escapeHtml(str: unknown): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}