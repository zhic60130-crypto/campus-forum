package com.campus.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BannerRequest {
    @NotBlank(message = "标题不能为空")
    private String title;
    private String subtitle;
    @NotBlank(message = "图片地址不能为空")
    private String imageUrl;
    private String link;
    private Boolean enabled;
    private Integer sort;
}
