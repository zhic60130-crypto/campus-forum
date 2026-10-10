package com.campus.forum.security;

import com.campus.forum.entity.Account;
import com.campus.forum.mapper.AccountMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final AccountMapper accountMapper;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, AccountMapper accountMapper) {
        this.jwtUtil = jwtUtil;
        this.accountMapper = accountMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtUtil.parse(token);
                Long userId = Long.valueOf(claims.getSubject());
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    Account account = accountMapper.selectById(userId);
                    if (account != null) {
                        UserPrincipal principal = toPrincipal(account);
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }

    public static UserPrincipal toPrincipal(Account account) {
        return new UserPrincipal(
                account.getId(),
                account.getUsername(),
                account.getEmail(),
                account.getPasswordHash(),
                account.getRole(),
                account.getAvatar()
        );
    }
}
