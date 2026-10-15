package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("category")
public class Category {
    @TableId
    private String id;
    private String label;
    private String color;
    private String icon;
    @TableField("desc_text")
    private String descText;
    private Integer sort;
}
