package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.service.AdminService;
import com.campus.forum.vo.PageVO;
import com.campus.forum.vo.TopicVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/topics")
@RequiredArgsConstructor
public class AdminTopicController {
    private final AdminService adminService;

    @GetMapping
    public ApiResponse<PageVO<TopicVO>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listTopics(q, page, size));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        adminService.deleteTopic(id);
        return ApiResponse.ok("已删除帖子", null);
    }
}
