package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.LoginRequest;
import com.campus.forum.dto.RegisterRequest;
import com.campus.forum.entity.Account;
import com.campus.forum.mapper.AccountMapper;
import com.campus.forum.security.JwtAuthenticationFilter;
import com.campus.forum.security.JwtUtil;
import com.campus.forum.security.UserPrincipal;
import com.campus.forum.vo.LoginVO;
import com.campus.forum.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginVO register(RegisterRequest req) {
        Long byName = accountMapper.selectCount(new LambdaQueryWrapper<Account>()
                .eq(Account::getUsername, req.getUsername()));
        if (byName > 0) {
            throw new BusinessException("用户名已存在");
        }
        Long byEmail = accountMapper.selectCount(new LambdaQueryWrapper<Account>()
                .eq(Account::getEmail, req.getEmail()));
        if (byEmail > 0) {
            throw new BusinessException("邮箱已注册");
        }
        Account account = new Account();
        account.setUsername(req.getUsername().trim());
        account.setEmail(req.getEmail().trim());
        account.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        account.setAvatar("");
        account.setRole("USER");
        account.setCreatedAt(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());
        accountMapper.insert(account);
        return issueToken(account);
    }

    public LoginVO login(LoginRequest req) {
        Account account = accountMapper.selectOne(new LambdaQueryWrapper<Account>()
                .and(w -> w.eq(Account::getUsername, req.getUsername())
                        .or()
                        .eq(Account::getEmail, req.getUsername())));
        if (account == null || !passwordEncoder.matches(req.getPassword(), account.getPasswordHash())) {
            throw new BusinessException(401, "用户名或密码错误");
        }
        return issueToken(account);
    }

    public UserVO me(UserPrincipal principal) {
        Account account = accountMapper.selectById(principal.getId());
        if (account == null) {
            throw new BusinessException(401, "用户不存在");
        }
        return toUserVO(account);
    }

    private LoginVO issueToken(Account account) {
        UserPrincipal principal = JwtAuthenticationFilter.toPrincipal(account);
        String token = jwtUtil.createToken(principal);
        return LoginVO.builder()
                .token(token)
                .expire(jwtUtil.expireEpochMilli())
                .user(toUserVO(account))
                .build();
    }

    public static UserVO toUserVO(Account account) {
        return UserVO.builder()
                .id(String.valueOf(account.getId()))
                .username(account.getUsername())
                .email(account.getEmail())
                .avatar(account.getAvatar() == null ? "" : account.getAvatar())
                .bio(account.getBio() == null ? "" : account.getBio())
                .role(account.getRole())
                .build();
    }
}
