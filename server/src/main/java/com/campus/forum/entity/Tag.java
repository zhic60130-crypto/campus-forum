package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("tag")
public class Tag {
    @TableId
    private String id;
    private String label;
}
