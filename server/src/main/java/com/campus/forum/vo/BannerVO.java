package com.campus.forum.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BannerVO {
    private String id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String link;
    private boolean enabled;
    private int sort;
}
