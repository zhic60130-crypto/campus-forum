package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.AnnouncementRequest;
import com.campus.forum.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class AdminAnnouncementController {
    private final AdminService adminService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list() {
        return ApiResponse.ok(adminService.listAnnouncements());
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> create(@Valid @RequestBody AnnouncementRequest request) {
        return ApiResponse.ok(adminService.createAnnouncement(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable Long id,
                                                   @Valid @RequestBody AnnouncementRequest request) {
        return ApiResponse.ok(adminService.updateAnnouncement(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        adminService.deleteAnnouncement(id);
        return ApiResponse.ok("已删除公告", null);
    }
}
