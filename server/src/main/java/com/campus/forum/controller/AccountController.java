package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.PasswordUpdateRequest;
import com.campus.forum.dto.ProfileUpdateRequest;
import com.campus.forum.security.SecurityUtils;
import com.campus.forum.service.AccountService;
import com.campus.forum.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @PutMapping("/profile")
    public ApiResponse<UserVO> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ApiResponse.ok(accountService.updateProfile(SecurityUtils.requireUser(), request));
    }

    @PutMapping("/password")
    public ApiResponse<Void> updatePassword(@Valid @RequestBody PasswordUpdateRequest request) {
        accountService.updatePassword(SecurityUtils.requireUser(), request);
        return ApiResponse.ok("密码已更新", null);
    }
}
