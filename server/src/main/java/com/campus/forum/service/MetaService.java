package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.entity.Announcement;
import com.campus.forum.entity.Category;
import com.campus.forum.entity.FriendLink;
import com.campus.forum.entity.Tag;
import com.campus.forum.mapper.AnnouncementMapper;
import com.campus.forum.mapper.CategoryMapper;
import com.campus.forum.mapper.FriendLinkMapper;
import com.campus.forum.mapper.TagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MetaService {
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final AnnouncementMapper announcementMapper;
    private final FriendLinkMapper friendLinkMapper;
    private final TopicService topicService;

    public List<Map<String, Object>> categories() {
        Map<String, Integer> counts = topicService.categoryCounts();
        return categoryMapper.selectList(new LambdaQueryWrapper<Category>().orderByAsc(Category::getSort))
                .stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", c.getId());
                    m.put("label", c.getLabel());
                    m.put("color", c.getColor());
                    m.put("icon", c.getIcon());
                    m.put("desc", c.getDescText());
                    m.put("count", counts.getOrDefault(c.getId(), 0));
                    return m;
                })
                .toList();
    }

    public List<Map<String, Object>> tags() {
        Map<String, Integer> counts = topicService.tagCounts();
        return tagMapper.selectList(new LambdaQueryWrapper<Tag>().orderByAsc(Tag::getId)).stream()
                .map(t -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", t.getId());
                    m.put("label", t.getLabel());
                    m.put("count", counts.getOrDefault(t.getId(), 0));
                    return m;
                })
                .toList();
    }

    public List<String> announcements() {
        return announcementMapper.selectList(new LambdaQueryWrapper<Announcement>().orderByAsc(Announcement::getSort))
                .stream()
                .map(Announcement::getContent)
                .toList();
    }

    public List<Map<String, String>> friendLinks() {
        return friendLinkMapper.selectList(new LambdaQueryWrapper<FriendLink>().orderByAsc(FriendLink::getSort))
                .stream()
                .map(f -> Map.of("name", f.getName(), "url", f.getUrl()))
                .toList();
    }
}
