package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.PasswordUpdateRequest;
import com.campus.forum.dto.ProfileUpdateRequest;
import com.campus.forum.entity.Account;
import com.campus.forum.mapper.AccountMapper;
import com.campus.forum.security.UserPrincipal;
import com.campus.forum.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;

    public UserVO updateProfile(UserPrincipal principal, ProfileUpdateRequest req) {
        Account account = accountMapper.selectById(principal.getId());
        if (account == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (StringUtils.hasText(req.getUsername()) && !req.getUsername().equals(account.getUsername())) {
            Long exists = accountMapper.selectCount(new LambdaQueryWrapper<Account>()
                    .eq(Account::getUsername, req.getUsername())
                    .ne(Account::getId, account.getId()));
            if (exists > 0) {
                throw new BusinessException("用户名已被占用");
            }
            account.setUsername(req.getUsername().trim());
        }
        if (StringUtils.hasText(req.getEmail()) && !req.getEmail().equals(account.getEmail())) {
            Long exists = accountMapper.selectCount(new LambdaQueryWrapper<Account>()
                    .eq(Account::getEmail, req.getEmail())
                    .ne(Account::getId, account.getId()));
            if (exists > 0) {
                throw new BusinessException("邮箱已被占用");
            }
            account.setEmail(req.getEmail().trim());
        }
        if (req.getAvatar() != null) {
            account.setAvatar(req.getAvatar());
        }
        if (req.getBio() != null) {
            account.setBio(req.getBio().trim());
        }
        account.setUpdatedAt(LocalDateTime.now());
        accountMapper.updateById(account);
        return AuthService.toUserVO(account);
    }

    public void updatePassword(UserPrincipal principal, PasswordUpdateRequest req) {
        Account account = accountMapper.selectById(principal.getId());
        if (account == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (!passwordEncoder.matches(req.getOldPassword(), account.getPasswordHash())) {
            throw new BusinessException("原密码不正确");
        }
        account.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        account.setUpdatedAt(LocalDateTime.now());
        accountMapper.updateById(account);
    }
}
