package com.campus.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TagRequest {
    @NotBlank(message = "标签名称不能为空")
    @Size(max = 12, message = "标签最多 12 个字")
    private String label;
}
