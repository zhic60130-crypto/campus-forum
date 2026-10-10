package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.entity.Interact;
import com.campus.forum.entity.Topic;
import com.campus.forum.entity.TopicComment;
import com.campus.forum.mapper.InteractMapper;
import com.campus.forum.mapper.TopicCommentMapper;
import com.campus.forum.mapper.TopicMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InteractService {
    public static final String TYPE_TOPIC = "TOPIC";
    public static final String TYPE_COMMENT = "COMMENT";
    public static final String ACTION_LIKE = "LIKE";
    public static final String ACTION_FAVORITE = "FAVORITE";

    private final InteractStore store;
    private final TopicMapper topicMapper;
    private final TopicCommentMapper commentMapper;
    private final InteractMapper interactMapper;

    public static String key(String action, String targetType, Long targetId) {
        return "interact:" + action.toLowerCase() + ":" + targetType.toLowerCase() + ":" + targetId;
    }

    public Map<String, Object> toggleTopicLike(Long userId, Long topicId) {
        ensureTopic(topicId);
        boolean liked = store.toggle(key(ACTION_LIKE, TYPE_TOPIC, topicId), String.valueOf(userId));
        long count = store.size(key(ACTION_LIKE, TYPE_TOPIC, topicId));
        topicMapper.updateCounts(topicId, (int) count, (int) store.size(key(ACTION_FAVORITE, TYPE_TOPIC, topicId)));
        return result(liked, count, "liked", "likeCount");
    }

    public Map<String, Object> toggleTopicFavorite(Long userId, Long topicId) {
        ensureTopic(topicId);
        boolean favorited = store.toggle(key(ACTION_FAVORITE, TYPE_TOPIC, topicId), String.valueOf(userId));
        long count = store.size(key(ACTION_FAVORITE, TYPE_TOPIC, topicId));
        topicMapper.updateCounts(topicId, (int) store.size(key(ACTION_LIKE, TYPE_TOPIC, topicId)), (int) count);
        return result(favorited, count, "favorited", "favoriteCount");
    }

    public Map<String, Object> toggleCommentLike(Long userId, Long commentId) {
        TopicComment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException(404, "评论不存在");
        }
        boolean liked = store.toggle(key(ACTION_LIKE, TYPE_COMMENT, commentId), String.valueOf(userId));
        long count = store.size(key(ACTION_LIKE, TYPE_COMMENT, commentId));
        commentMapper.updateLikeCount(commentId, (int) count);
        return result(liked, count, "liked", "likeCount");
    }

    public boolean isLikedTopic(Long userId, Long topicId) {
        if (userId == null) return false;
        return store.contains(key(ACTION_LIKE, TYPE_TOPIC, topicId), String.valueOf(userId));
    }

    public boolean isFavoritedTopic(Long userId, Long topicId) {
        if (userId == null) return false;
        return store.contains(key(ACTION_FAVORITE, TYPE_TOPIC, topicId), String.valueOf(userId));
    }

    public boolean isLikedComment(Long userId, Long commentId) {
        if (userId == null) return false;
        return store.contains(key(ACTION_LIKE, TYPE_COMMENT, commentId), String.valueOf(userId));
    }

    public int topicLikeCount(Long topicId) {
        return (int) store.size(key(ACTION_LIKE, TYPE_TOPIC, topicId));
    }

    public int topicFavoriteCount(Long topicId) {
        return (int) store.size(key(ACTION_FAVORITE, TYPE_TOPIC, topicId));
    }

    public int commentLikeCount(Long commentId) {
        return (int) store.size(key(ACTION_LIKE, TYPE_COMMENT, commentId));
    }

    public void clearForTopic(Long topicId, java.util.List<Long> commentIds) {
        store.clear(key(ACTION_LIKE, TYPE_TOPIC, topicId));
        store.clear(key(ACTION_FAVORITE, TYPE_TOPIC, topicId));
        interactMapper.deleteByTarget(topicId, TYPE_TOPIC);
        clearForComments(commentIds);
    }

    public void clearForComments(java.util.List<Long> commentIds) {
        if (commentIds == null) {
            return;
        }
        for (Long commentId : commentIds) {
            if (commentId == null) continue;
            store.clear(key(ACTION_LIKE, TYPE_COMMENT, commentId));
            interactMapper.deleteByTarget(commentId, TYPE_COMMENT);
        }
    }

    /** 将 Redis/内存互动状态同步到 interact 表与计数字段 */
    @Transactional
    public void syncToDatabase() {
        for (String redisKey : store.keys("interact:*")) {
            String[] parts = redisKey.split(":");
            if (parts.length != 4) continue;
            String action = parts[1].toUpperCase();
            String targetType = parts[2].toUpperCase();
            Long targetId = Long.valueOf(parts[3]);
            for (String uid : store.members(redisKey)) {
                Long userId = Long.valueOf(uid);
                Long exists = interactMapper.selectCount(new LambdaQueryWrapper<Interact>()
                        .eq(Interact::getUserId, userId)
                        .eq(Interact::getTargetId, targetId)
                        .eq(Interact::getTargetType, targetType)
                        .eq(Interact::getActionType, action));
                if (exists == 0) {
                    Interact row = new Interact();
                    row.setUserId(userId);
                    row.setTargetId(targetId);
                    row.setTargetType(targetType);
                    row.setActionType(action);
                    row.setCreatedAt(LocalDateTime.now());
                    interactMapper.insert(row);
                }
            }
            if (TYPE_TOPIC.equals(targetType)) {
                topicMapper.updateCounts(targetId,
                        (int) store.size(key(ACTION_LIKE, TYPE_TOPIC, targetId)),
                        (int) store.size(key(ACTION_FAVORITE, TYPE_TOPIC, targetId)));
            } else if (TYPE_COMMENT.equals(targetType) && ACTION_LIKE.equalsIgnoreCase(action)) {
                commentMapper.updateLikeCount(targetId, (int) store.size(key(ACTION_LIKE, TYPE_COMMENT, targetId)));
            }
        }
    }

    private void ensureTopic(Long topicId) {
        Topic topic = topicMapper.selectById(topicId);
        if (topic == null) {
            throw new BusinessException(404, "帖子不存在");
        }
    }

    private Map<String, Object> result(boolean flag, long count, String flagKey, String countKey) {
        Map<String, Object> map = new HashMap<>();
        map.put(flagKey, flag);
        map.put(countKey, count);
        return map;
    }
}
