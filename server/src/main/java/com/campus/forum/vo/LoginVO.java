package com.campus.forum.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginVO {
    private String token;
    private long expire;
    private UserVO user;
}
