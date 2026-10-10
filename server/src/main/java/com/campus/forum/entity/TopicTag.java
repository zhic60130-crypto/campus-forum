package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("topic_tag")
public class TopicTag {
    private Long topicId;
    private String tagId;
}
