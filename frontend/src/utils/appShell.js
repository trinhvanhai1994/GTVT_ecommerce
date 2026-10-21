/** @returns {"platform"|"merchant"|"storefront"} */
export function resolveAppShell(pathname) {
  if (pathname.startsWith("/admin")) return "platform";
  if (pathname === "/change-password" || pathname === "/seller" || pathname.startsWith("/seller/")) {
    return "merchant";
  }
  return "storefront";
}
