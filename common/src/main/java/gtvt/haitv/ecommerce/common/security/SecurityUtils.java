package gtvt.haitv.ecommerce.common.security;

import gtvt.haitv.ecommerce.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthenticatedUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized");
        }
        return user;
    }

    public static Long currentUserId() {
        return currentUser().getUserId();
    }

    public static boolean isAdmin() {
        return "ADMIN".equals(currentUser().getRole());
    }

    public static void requireOwnerOrAdmin(Long resourceUserId) {
        AuthenticatedUser user = currentUser();
        if (!"ADMIN".equals(user.getRole()) && !user.getUserId().equals(resourceUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
        }
    }
}
