const drawing = `<defs>
<linearGradient id="hand-blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#236deb"/><stop offset="1" stop-color="#4c94f3"/></linearGradient><linearGradient id="hand-light" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#afd9ff"/><stop offset="1" stop-color="#70b3ff"/></linearGradient>
<symbol id="handshake" viewBox="0 0 66 54"><path fill="url(#hand-blue)" d="M6 28C-3 20 0 9 8 5c7-4 13-2 19 3l6 5-12 14-7 8z"/><path fill="url(#hand-light)" d="M33 8c8-7 17-7 25-1 8 6 10 15 4 22l-7 8-21-20-10 8c-3 2-7 1-8-2-1-2 0-4 2-6z"/><path d="m31 18 24 22c3 3 0 7-3 6L32 29m16 14c3 3 0 7-3 5L27 33m14 13c2 3-1 7-4 4L23 37m11 11c1 4-3 5-5 3L14 37" fill="url(#hand-blue)" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><g fill="url(#hand-light)" stroke="white" stroke-width="1.6"><rect x="8" y="28" width="8" height="13" rx="4" transform="rotate(42 12 34)"/><rect x="15" y="33" width="8" height="14" rx="4" transform="rotate(42 19 40)"/><rect x="22" y="38" width="8" height="13" rx="4" transform="rotate(42 26 44)"/><rect x="29" y="43" width="7" height="10" rx="3.5" transform="rotate(42 32 48)"/></g><path d="m18 17 12-9c3-2 5-2 8 0" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="arrow" viewBox="0 0 24 24"><path d="M4 12h15m-6-7 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="check" viewBox="0 0 24 24"><path d="m4 12 5 5L20 5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="lock" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="shield" viewBox="0 0 24 24"><path d="M12 3c3 2 5 2 8 2v7c0 5-5 8-8 10-3-2-8-5-8-10V5c3 0 5 0 8-2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="document" viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6zM14 3v6h5M9 13h7M9 17h7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
</defs><use href="#handshake"/>`;
export function BrandMark() {
  return (
    <svg
      viewBox="0 0 66 54"
      aria-hidden="true"
      className="cl-brand-mark"
      dangerouslySetInnerHTML={{ __html: drawing }}
    />
  );
}
