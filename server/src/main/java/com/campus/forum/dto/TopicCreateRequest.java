package com.campus.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TopicCreateRequest {
    @NotBlank(message = "标题不能为空")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "正文不能为空")
    private String content;

    @NotBlank(message = "分类不能为空")
    private String categoryId;

    private List<String> tagIds = new ArrayList<>();
    private List<String> images = new ArrayList<>();
}
