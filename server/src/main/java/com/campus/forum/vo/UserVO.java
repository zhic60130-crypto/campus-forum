package com.campus.forum.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserVO {
    private String id;
    private String username;
    private String email;
    private String avatar;
    private String bio;
    private String role;
}
