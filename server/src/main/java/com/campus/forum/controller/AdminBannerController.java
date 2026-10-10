package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.BannerRequest;
import com.campus.forum.service.BannerService;
import com.campus.forum.vo.BannerVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {
    private final BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerVO>> list() {
        return ApiResponse.ok(bannerService.listAll());
    }

    @PostMapping
    public ApiResponse<BannerVO> create(@Valid @RequestBody BannerRequest request) {
        return ApiResponse.ok(bannerService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<BannerVO> update(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        return ApiResponse.ok(bannerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        bannerService.remove(id);
        return ApiResponse.ok("已删除", null);
    }

    @PostMapping("/{id}/toggle")
    public ApiResponse<BannerVO> toggle(@PathVariable Long id) {
        return ApiResponse.ok(bannerService.toggle(id));
    }
}
