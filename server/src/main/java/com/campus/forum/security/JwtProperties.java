package com.campus.forum.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "forum.jwt")
public class JwtProperties {
    private String secret;
    private long expireHours = 24;
}
