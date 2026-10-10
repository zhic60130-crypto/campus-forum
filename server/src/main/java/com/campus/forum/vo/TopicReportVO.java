package com.campus.forum.vo;

import lombok.Data;

@Data
public class TopicReportVO {
    private String id;
    private String topicId;
    private String topicTitle;
    private boolean topicExists;
    private String reporterId;
    private String reporterName;
    private String reason;
    private String reasonLabel;
    private String detail;
    private String status;
    private String statusLabel;
    private String adminNote;
    private String createdAt;
    private String resolvedAt;
}
