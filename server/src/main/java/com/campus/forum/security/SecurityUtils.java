package com.campus.forum.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {
    }

    public static UserPrincipal currentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        return principal;
    }

    public static UserPrincipal requireUser() {
        UserPrincipal user = currentUserOrNull();
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("未登录");
        }
        return user;
    }

    public static Long currentUserIdOrNull() {
        UserPrincipal user = currentUserOrNull();
        return user == null ? null : user.getId();
    }
}
