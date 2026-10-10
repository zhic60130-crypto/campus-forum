package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("topic_comment")
public class TopicComment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long topicId;
    private Long authorId;
    private String content;
    private Long parentId;
    private String replyToName;
    private Integer likeCount;
    private LocalDateTime createdAt;
}
