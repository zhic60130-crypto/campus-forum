package com.campus.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordUpdateRequest {
    @NotBlank
    private String oldPassword;
    @NotBlank
    @Size(min = 6, max = 64)
    private String newPassword;
}
