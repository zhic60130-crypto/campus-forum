package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.service.MetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
public class MetaController {
    private final MetaService metaService;

    @GetMapping("/categories")
    public ApiResponse<List<Map<String, Object>>> categories() {
        return ApiResponse.ok(metaService.categories());
    }

    @GetMapping("/tags")
    public ApiResponse<List<Map<String, Object>>> tags() {
        return ApiResponse.ok(metaService.tags());
    }

    @GetMapping("/announcements")
    public ApiResponse<List<String>> announcements() {
        return ApiResponse.ok(metaService.announcements());
    }

    @GetMapping("/friend-links")
    public ApiResponse<List<Map<String, String>>> friendLinks() {
        return ApiResponse.ok(metaService.friendLinks());
    }
}
