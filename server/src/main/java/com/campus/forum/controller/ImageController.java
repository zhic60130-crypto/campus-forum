package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/image")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @PostMapping("/upload")
    public ApiResponse<Map<String, String>> upload(@RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(imageService.upload(file));
    }
}
