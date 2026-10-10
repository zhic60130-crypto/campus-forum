package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.ReportResolveRequest;
import com.campus.forum.security.SecurityUtils;
import com.campus.forum.service.ReportService;
import com.campus.forum.vo.PageVO;
import com.campus.forum.vo.TopicReportVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {
    private final ReportService reportService;

    @GetMapping
    public ApiResponse<PageVO<TopicReportVO>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(reportService.list(status, page, size));
    }

    @PutMapping("/{id}/resolve")
    public ApiResponse<TopicReportVO> resolve(@PathVariable Long id,
                                              @Valid @RequestBody ReportResolveRequest request) {
        return ApiResponse.ok(
                "已处理",
                reportService.resolve(id, SecurityUtils.requireUser().getId(), request));
    }
}
