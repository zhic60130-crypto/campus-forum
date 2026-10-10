package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("account")
public class Account {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String email;
    @TableField("password_hash")
    private String passwordHash;
    private String avatar;
    private String bio;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
