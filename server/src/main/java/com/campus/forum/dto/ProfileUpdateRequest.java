package com.campus.forum.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @Size(min = 3, max = 32)
    private String username;
    @Email
    private String email;
    private String avatar;
    @Size(max = 200, message = "个人简介最多 200 字")
    private String bio;
}
