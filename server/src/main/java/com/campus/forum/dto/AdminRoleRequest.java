package com.campus.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminRoleRequest {
    @NotBlank(message = "角色不能为空")
    private String role;
}
