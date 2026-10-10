package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.TopicCreateRequest;
import com.campus.forum.entity.Account;
import com.campus.forum.entity.Tag;
import com.campus.forum.entity.Topic;
import com.campus.forum.entity.TopicComment;
import com.campus.forum.entity.TopicReport;
import com.campus.forum.entity.TopicTag;
import com.campus.forum.mapper.AccountMapper;
import com.campus.forum.mapper.TagMapper;
import com.campus.forum.mapper.TopicCommentMapper;
import com.campus.forum.mapper.TopicMapper;
import com.campus.forum.mapper.TopicReportMapper;
import com.campus.forum.mapper.TopicTagMapper;
import com.campus.forum.security.UserPrincipal;
import com.campus.forum.util.JsonUtils;
import com.campus.forum.vo.PageVO;
import com.campus.forum.vo.TopicVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicService {
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final TopicMapper topicMapper;
    private final TopicTagMapper topicTagMapper;
    private final TopicCommentMapper commentMapper;
    private final TopicReportMapper reportMapper;
    private final AccountMapper accountMapper;
    private final TagMapper tagMapper;
    private final TagAdminService tagAdminService;
    private final InteractService interactService;

    public PageVO<TopicVO> list(String categoryId, String tagId, String q, String sort,
                                int page, int size, Long viewerId) {
        int p = Math.max(page, 1);
        int s = Math.min(Math.max(size, 1), 50);

        LambdaQueryWrapper<Topic> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(categoryId) && !"all".equals(categoryId)) {
            wrapper.eq(Topic::getCategoryId, categoryId);
        }
        if (StringUtils.hasText(q)) {
            String keyword = q.trim();
            wrapper.and(w -> w.like(Topic::getTitle, keyword).or().like(Topic::getContent, keyword));
        }
        List<Topic> topics = topicMapper.selectList(wrapper);

        if (StringUtils.hasText(tagId)) {
            if (topics.isEmpty()) {
                return new PageVO<>(List.of(), 0, p, s);
            }
            Set<Long> ids = topics.stream().map(Topic::getId).collect(Collectors.toSet());
            List<TopicTag> tags = topicTagMapper.selectList(new LambdaQueryWrapper<TopicTag>()
                    .eq(TopicTag::getTagId, tagId)
                    .in(TopicTag::getTopicId, ids));
            Set<Long> matched = tags.stream().map(TopicTag::getTopicId).collect(Collectors.toSet());
            topics = topics.stream().filter(t -> matched.contains(t.getId())).collect(Collectors.toList());
        }

        topics.sort((a, b) -> {
            if ("latest".equals(sort)) {
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            }
            int scoreA = liveLike(a) * 2 + liveFavorite(a);
            int scoreB = liveLike(b) * 2 + liveFavorite(b);
            if (scoreB != scoreA) return Integer.compare(scoreB, scoreA);
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        long total = topics.size();
        int from = Math.min((p - 1) * s, topics.size());
        int to = Math.min(from + s, topics.size());
        List<TopicVO> records = topics.subList(from, to).stream()
                .map(t -> toVO(t, viewerId))
                .toList();
        return new PageVO<>(records, total, p, s);
    }

    public TopicVO detail(Long id, Long viewerId) {
        Topic topic = topicMapper.selectById(id);
        if (topic == null) {
            throw new BusinessException(404, "帖子不存在");
        }
        return toVO(topic, viewerId);
    }

    @Transactional
    public TopicVO create(Long authorId, TopicCreateRequest req) {
        Account author = accountMapper.selectById(authorId);
        if (author == null) {
            throw new BusinessException(401, "用户不存在");
        }
        List<String> tagIds = resolveTagIds(req.getTagIds());
        List<String> images = Optional.ofNullable(req.getImages()).orElse(List.of()).stream()
                .filter(StringUtils::hasText)
                .toList();

        Topic topic = new Topic();
        topic.setAuthorId(authorId);
        topic.setTitle(req.getTitle().trim());
        topic.setContent(req.getContent().trim());
        topic.setCategoryId(req.getCategoryId());
        topic.setImagesJson(JsonUtils.toJson(images));
        topic.setLikeCount(0);
        topic.setFavoriteCount(0);
        topic.setCreatedAt(LocalDateTime.now());
        topic.setUpdatedAt(LocalDateTime.now());
        topicMapper.insert(topic);

        for (String tagId : tagIds) {
            TopicTag tt = new TopicTag();
            tt.setTopicId(topic.getId());
            tt.setTagId(tagId);
            topicTagMapper.insert(tt);
        }
        return toVO(topic, authorId);
    }

    @Transactional
    public void deleteByUser(Long id, UserPrincipal user) {
        Topic topic = topicMapper.selectById(id);
        if (topic == null) {
            throw new BusinessException(404, "帖子不存在");
        }
        boolean admin = user != null && "ADMIN".equalsIgnoreCase(user.getRole());
        if (!admin && (user == null || !topic.getAuthorId().equals(user.getId()))) {
            throw new BusinessException(403, "只能删除自己的帖子");
        }
        removeTopic(id, user == null ? null : user.getId(), admin ? "管理员删除" : "作者删除");
    }

    @Transactional
    public void removeTopic(Long id) {
        removeTopic(id, null, "帖子已删除");
    }

    @Transactional
    public void removeTopic(Long id, Long operatorId, String note) {
        Topic topic = topicMapper.selectById(id);
        if (topic == null) {
            throw new BusinessException(404, "帖子不存在");
        }
        List<TopicComment> comments = commentMapper.selectList(
                new LambdaQueryWrapper<TopicComment>().eq(TopicComment::getTopicId, id));
        List<Long> commentIds = comments.stream().map(TopicComment::getId).toList();
        interactService.clearForTopic(id, commentIds);

        LocalDateTime now = LocalDateTime.now();
        List<TopicReport> pending = reportMapper.selectList(new LambdaQueryWrapper<TopicReport>()
                .eq(TopicReport::getTopicId, id)
                .eq(TopicReport::getStatus, "PENDING"));
        for (TopicReport item : pending) {
            item.setStatus("RESOLVED");
            item.setAdminId(operatorId);
            item.setAdminNote(StringUtils.hasText(note) ? note : "原帖已删除");
            item.setResolvedAt(now);
            reportMapper.updateById(item);
        }

        commentMapper.delete(new LambdaQueryWrapper<TopicComment>().eq(TopicComment::getTopicId, id));
        topicTagMapper.delete(new LambdaQueryWrapper<TopicTag>().eq(TopicTag::getTopicId, id));
        topicMapper.deleteById(id);
    }

    public PageVO<TopicVO> mine(Long userId, int page, int size) {
        int p = Math.max(page, 1);
        int s = Math.min(Math.max(size, 1), 50);
        List<Topic> all = topicMapper.selectList(new LambdaQueryWrapper<Topic>()
                .eq(Topic::getAuthorId, userId)
                .orderByDesc(Topic::getCreatedAt));
        long total = all.size();
        int from = Math.min((p - 1) * s, all.size());
        int to = Math.min(from + s, all.size());
        List<TopicVO> records = all.subList(from, to).stream().map(t -> toVO(t, userId)).toList();
        return new PageVO<>(records, total, p, s);
    }

    public PageVO<TopicVO> favorites(Long userId, int page, int size) {
        int p = Math.max(page, 1);
        int s = Math.min(Math.max(size, 1), 50);
        List<Topic> all = topicMapper.selectList(null);
        List<Topic> favorited = all.stream()
                .filter(t -> interactService.isFavoritedTopic(userId, t.getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
        long total = favorited.size();
        int from = Math.min((p - 1) * s, favorited.size());
        int to = Math.min(from + s, favorited.size());
        List<TopicVO> records = favorited.subList(from, to).stream().map(t -> toVO(t, userId)).toList();
        return new PageVO<>(records, total, p, s);
    }

    public List<TopicVO> hot(Long viewerId) {
        List<Topic> topics = topicMapper.selectList(null);
        return topics.stream()
                .sorted((a, b) -> Integer.compare(liveLike(b), liveLike(a)))
                .limit(5)
                .map(t -> toVO(t, viewerId))
                .toList();
    }

    public Map<String, Integer> categoryCounts() {
        Map<String, Integer> map = new HashMap<>();
        for (var row : topicTagMapper.countByCategory()) {
            Object k = row.get("k");
            if (k == null) k = row.get("K");
            Object c = row.get("c");
            if (c == null) c = row.get("C");
            if (k != null && c != null) {
                map.put(String.valueOf(k), ((Number) c).intValue());
            }
        }
        return map;
    }

    public Map<String, Integer> tagCounts() {
        Map<String, Integer> map = new HashMap<>();
        for (var row : topicTagMapper.countByTag()) {
            Object k = row.get("k");
            if (k == null) k = row.get("K");
            Object c = row.get("c");
            if (c == null) c = row.get("C");
            if (k != null && c != null) {
                map.put(String.valueOf(k), ((Number) c).intValue());
            }
        }
        return map;
    }

    private List<String> resolveTagIds(List<String> raw) {
        List<String> resolved = new ArrayList<>();
        if (raw == null) {
            return resolved;
        }
        for (String item : raw) {
            if (resolved.size() >= 5) {
                break;
            }
            if (!StringUtils.hasText(item)) {
                continue;
            }
            String value = item.trim().replaceFirst("^#+", "").trim();
            if (!StringUtils.hasText(value)) {
                continue;
            }
            if (value.length() > 12) {
                throw new BusinessException("标签最多 12 个字");
            }
            Tag byId = tagMapper.selectById(value);
            if (byId != null) {
                if (!resolved.contains(byId.getId())) {
                    resolved.add(byId.getId());
                }
                continue;
            }
            Tag byLabel = tagMapper.selectOne(new LambdaQueryWrapper<Tag>().eq(Tag::getLabel, value));
            if (byLabel != null) {
                if (!resolved.contains(byLabel.getId())) {
                    resolved.add(byLabel.getId());
                }
                continue;
            }
            Tag created = new Tag();
            created.setId(tagAdminService.newTagId(value));
            created.setLabel(value);
            tagMapper.insert(created);
            resolved.add(created.getId());
        }
        return resolved;
    }

    public TopicVO toVO(Topic topic, Long viewerId) {
        Account author = accountMapper.selectById(topic.getAuthorId());
        List<String> tagIds = topicTagMapper.findTagIds(topic.getId());
        int storeLike = interactService.topicLikeCount(topic.getId());
        int storeFav = interactService.topicFavoriteCount(topic.getId());
        int likeCount = storeLike > 0 || interactService.isLikedTopic(viewerId, topic.getId())
                ? storeLike : nz(topic.getLikeCount());
        int favoriteCount = storeFav > 0 || interactService.isFavoritedTopic(viewerId, topic.getId())
                ? storeFav : nz(topic.getFavoriteCount());
        return TopicVO.builder()
                .id(String.valueOf(topic.getId()))
                .authorId(String.valueOf(topic.getAuthorId()))
                .authorName(author == null ? "未知" : author.getUsername())
                .createdAt(topic.getCreatedAt() == null ? "" : topic.getCreatedAt().format(ISO))
                .categoryId(topic.getCategoryId())
                .tagIds(tagIds)
                .title(topic.getTitle())
                .summary(topic.getContent())
                .images(JsonUtils.fromJsonList(topic.getImagesJson()))
                .likeCount(likeCount)
                .favoriteCount(favoriteCount)
                .liked(interactService.isLikedTopic(viewerId, topic.getId()))
                .favorited(interactService.isFavoritedTopic(viewerId, topic.getId()))
                .build();
    }

    private int liveLike(Topic t) {
        int store = interactService.topicLikeCount(t.getId());
        return store > 0 ? store : nz(t.getLikeCount());
    }

    private int liveFavorite(Topic t) {
        int store = interactService.topicFavoriteCount(t.getId());
        return store > 0 ? store : nz(t.getFavoriteCount());
    }

    private int nz(Integer v) {
        return v == null ? 0 : v;
    }
}
