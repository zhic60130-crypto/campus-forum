package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.AdminRoleRequest;
import com.campus.forum.service.AdminService;
import com.campus.forum.vo.PageVO;
import com.campus.forum.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminService adminService;

    @GetMapping
    public ApiResponse<PageVO<UserVO>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listUsers(q, page, size));
    }

    @PutMapping("/{id}/role")
    public ApiResponse<UserVO> updateRole(@PathVariable Long id,
                                          @Valid @RequestBody AdminRoleRequest request) {
        return ApiResponse.ok(adminService.updateUserRole(id, request.getRole()));
    }
}
