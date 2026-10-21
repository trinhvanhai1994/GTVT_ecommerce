/** @returns {string|null} path to redirect when already logged in */
export function homeForAuthenticatedUser({ isPlatformAdmin, isSeller, mustChangePassword }) {
  if (isPlatformAdmin) return "/admin";
  if (isSeller) return mustChangePassword ? "/change-password" : "/seller";
  return "/";
}
