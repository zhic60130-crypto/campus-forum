package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.TagRequest;
import com.campus.forum.service.TagAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tags")
@RequiredArgsConstructor
public class AdminTagController {
    private final TagAdminService tagAdminService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list() {
        return ApiResponse.ok(tagAdminService.list());
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> create(@Valid @RequestBody TagRequest request) {
        return ApiResponse.ok("已添加标签", tagAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable String id,
                                                   @Valid @RequestBody TagRequest request) {
        return ApiResponse.ok("已更新标签", tagAdminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable String id) {
        tagAdminService.delete(id);
        return ApiResponse.ok("已删除标签", null);
    }
}
