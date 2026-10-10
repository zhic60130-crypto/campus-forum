package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.service.BannerService;
import com.campus.forum.vo.BannerVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerVO>> list() {
        return ApiResponse.ok(bannerService.listActive());
    }
}
