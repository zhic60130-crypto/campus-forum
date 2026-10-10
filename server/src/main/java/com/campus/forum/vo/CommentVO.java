package com.campus.forum.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentVO {
    private String id;
    private String postId;
    private String authorId;
    private String authorName;
    private String content;
    private String createdAt;
    private int likeCount;
    private boolean liked;
    private String parentId;
    private String replyToName;
}
