package com.campus.forum.vo;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TopicVO {
    private String id;
    private String authorId;
    private String authorName;
    private String createdAt;
    private String categoryId;
    private List<String> tagIds;
    private String title;
    private String summary;
    private List<String> images;
    private int likeCount;
    private int favoriteCount;
    private boolean liked;
    private boolean favorited;
}
