package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.security.SecurityUtils;
import com.campus.forum.service.InteractService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/interact")
@RequiredArgsConstructor
public class InteractController {
    private final InteractService interactService;

    @PostMapping("/topic/{id}/like")
    public ApiResponse<Map<String, Object>> likeTopic(@PathVariable Long id) {
        return ApiResponse.ok(interactService.toggleTopicLike(SecurityUtils.requireUser().getId(), id));
    }

    @PostMapping("/topic/{id}/favorite")
    public ApiResponse<Map<String, Object>> favoriteTopic(@PathVariable Long id) {
        return ApiResponse.ok(interactService.toggleTopicFavorite(SecurityUtils.requireUser().getId(), id));
    }

    @PostMapping("/comment/{id}/like")
    public ApiResponse<Map<String, Object>> likeComment(@PathVariable Long id) {
        return ApiResponse.ok(interactService.toggleCommentLike(SecurityUtils.requireUser().getId(), id));
    }
}
