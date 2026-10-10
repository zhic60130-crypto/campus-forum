package com.campus.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnnouncementRequest {
    @NotBlank(message = "公告内容不能为空")
    private String content;
    private Integer sort;
}
