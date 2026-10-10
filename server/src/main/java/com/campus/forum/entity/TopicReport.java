package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("topic_report")
public class TopicReport {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long topicId;
    private String topicTitle;
    private Long reporterId;
    private String reporterName;
    private String reason;
    private String detail;
    private String status;
    private Long adminId;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
