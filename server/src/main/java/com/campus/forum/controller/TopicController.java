package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.CommentCreateRequest;
import com.campus.forum.dto.TopicCreateRequest;
import com.campus.forum.dto.TopicReportCreateRequest;
import com.campus.forum.security.SecurityUtils;
import com.campus.forum.service.CommentService;
import com.campus.forum.service.ReportService;
import com.campus.forum.service.TopicService;
import com.campus.forum.vo.CommentVO;
import com.campus.forum.vo.PageVO;
import com.campus.forum.vo.TopicReportVO;
import com.campus.forum.vo.TopicVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {
    private final TopicService topicService;
    private final CommentService commentService;
    private final ReportService reportService;

    @GetMapping
    public ApiResponse<PageVO<TopicVO>> list(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String tagId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "hot") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(topicService.list(categoryId, tagId, q, sort, page, size, SecurityUtils.currentUserIdOrNull()));
    }

    @GetMapping("/mine")
    public ApiResponse<PageVO<TopicVO>> mine(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(topicService.mine(SecurityUtils.requireUser().getId(), page, size));
    }

    @GetMapping("/favorites")
    public ApiResponse<PageVO<TopicVO>> favorites(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(topicService.favorites(SecurityUtils.requireUser().getId(), page, size));
    }

    @GetMapping("/hot")
    public ApiResponse<List<TopicVO>> hot() {
        return ApiResponse.ok(topicService.hot(SecurityUtils.currentUserIdOrNull()));
    }

    @GetMapping("/{id}")
    public ApiResponse<TopicVO> detail(@PathVariable Long id) {
        return ApiResponse.ok(topicService.detail(id, SecurityUtils.currentUserIdOrNull()));
    }

    @PostMapping
    public ApiResponse<TopicVO> create(@Valid @RequestBody TopicCreateRequest request) {
        return ApiResponse.ok(topicService.create(SecurityUtils.requireUser().getId(), request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        topicService.deleteByUser(id, SecurityUtils.requireUser());
        return ApiResponse.ok("已删除帖子", null);
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<List<CommentVO>> comments(@PathVariable Long id) {
        return ApiResponse.ok(commentService.listByTopic(id, SecurityUtils.currentUserIdOrNull()));
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<CommentVO> createComment(@PathVariable Long id,
                                                @Valid @RequestBody CommentCreateRequest request) {
        return ApiResponse.ok(commentService.create(id, SecurityUtils.requireUser().getId(), request));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long id, @PathVariable Long commentId) {
        commentService.deleteByUser(id, commentId, SecurityUtils.requireUser());
        return ApiResponse.ok("已删除评论", null);
    }

    @PostMapping("/{id}/report")
    public ApiResponse<TopicReportVO> report(@PathVariable Long id,
                                             @Valid @RequestBody TopicReportCreateRequest request) {
        return ApiResponse.ok(
                "举报已提交",
                reportService.create(id, SecurityUtils.requireUser().getId(), request));
    }
}
