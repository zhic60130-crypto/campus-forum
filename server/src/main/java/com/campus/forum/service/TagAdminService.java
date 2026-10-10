package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.TagRequest;
import com.campus.forum.entity.Tag;
import com.campus.forum.mapper.TagMapper;
import com.campus.forum.mapper.TopicTagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TagAdminService {
    private final TagMapper tagMapper;
    private final TopicTagMapper topicTagMapper;

    public List<Map<String, Object>> list() {
        Map<String, Integer> counts = new HashMap<>();
        for (var row : topicTagMapper.countByTag()) {
            Object k = row.get("k");
            if (k == null) k = row.get("K");
            Object c = row.get("c");
            if (c == null) c = row.get("C");
            if (k != null && c != null) {
                counts.put(String.valueOf(k), ((Number) c).intValue());
            }
        }
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

    @Transactional
    public Map<String, Object> create(TagRequest request) {
        String label = normalizeLabel(request.getLabel());
        ensureUniqueLabel(label, null);
        Tag tag = new Tag();
        tag.setId(newTagId(label));
        tag.setLabel(label);
        tagMapper.insert(tag);
        return toMap(tag, 0);
    }

    @Transactional
    public Map<String, Object> update(String id, TagRequest request) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new BusinessException(404, "标签不存在");
        }
        String label = normalizeLabel(request.getLabel());
        ensureUniqueLabel(label, id);
        tag.setLabel(label);
        tagMapper.updateById(tag);
        return toMap(tag, (int) topicTagMapper.countByTagId(id));
    }

    /**
     * 删除标签：先清空帖子关联，再删除标签本身。
     */
    @Transactional
    public void delete(String id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new BusinessException(404, "标签不存在");
        }
        topicTagMapper.deleteByTagId(id);
        tagMapper.deleteById(id);
    }

    public long usageCount(String id) {
        return topicTagMapper.countByTagId(id);
    }

    private String normalizeLabel(String raw) {
        String label = raw == null ? "" : raw.trim().replaceFirst("^#+", "").trim();
        if (!StringUtils.hasText(label)) {
            throw new BusinessException("标签名称不能为空");
        }
        if (label.length() > 12) {
            throw new BusinessException("标签最多 12 个字");
        }
        return label;
    }

    private void ensureUniqueLabel(String label, String excludeId) {
        Tag existing = tagMapper.selectOne(new LambdaQueryWrapper<Tag>().eq(Tag::getLabel, label));
        if (existing != null && (excludeId == null || !existing.getId().equals(excludeId))) {
            throw new BusinessException("标签名称已存在");
        }
    }

    public String newTagId(String label) {
        String slug = label.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "");
        if (!StringUtils.hasText(slug)) {
            slug = "t" + Integer.toHexString(label.hashCode());
        }
        if (slug.length() > 28) {
            slug = slug.substring(0, 28);
        }
        String id = slug;
        int i = 1;
        while (tagMapper.selectById(id) != null) {
            id = slug.substring(0, Math.min(slug.length(), 26)) + i;
            i++;
        }
        return id;
    }

    private Map<String, Object> toMap(Tag tag, int count) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", tag.getId());
        m.put("label", tag.getLabel());
        m.put("count", count);
        return m;
    }
}
