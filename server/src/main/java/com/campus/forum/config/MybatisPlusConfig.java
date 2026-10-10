package com.campus.forum.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.campus.forum.mapper")
public class MybatisPlusConfig {
}
