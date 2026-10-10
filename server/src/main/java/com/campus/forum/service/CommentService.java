package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.CommentCreateRequest;
import com.campus.forum.entity.Account;
import com.campus.forum.entity.Topic;
import com.campus.forum.entity.TopicComment;
import com.campus.forum.mapper.AccountMapper;
import com.campus.forum.mapper.TopicCommentMapper;
import com.campus.forum.mapper.TopicMapper;
import com.campus.forum.security.UserPrincipal;
import com.campus.forum.vo.CommentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final TopicCommentMapper commentMapper;
    private final TopicMapper topicMapper;
    private final AccountMapper accountMapper;
    private final InteractService interactService;

    public List<CommentVO> listByTopic(Long topicId, Long viewerId) {
        List<TopicComment> comments = commentMapper.selectList(new LambdaQueryWrapper<TopicComment>()
                .eq(TopicComment::getTopicId, topicId)
                .orderByAsc(TopicComment::getCreatedAt));
        return comments.stream().map(c -> toVO(c, viewerId)).toList();
    }

    public CommentVO create(Long topicId, Long authorId, CommentCreateRequest req) {
        Topic topic = topicMapper.selectById(topicId);
        if (topic == null) {
            throw new BusinessException(404, "帖子不存在");
        }
        Long parentId = null;
        String replyToName = null;
        if (StringUtils.hasText(req.getParentId())) {
            TopicComment parent = commentMapper.selectById(Long.valueOf(req.getParentId()));
            if (parent == null || !parent.getTopicId().equals(topicId)) {
                throw new BusinessException("父评论不存在");
            }
            if (parent.getParentId() != null) {
                parentId = parent.getParentId();
                replyToName = authorName(parent.getAuthorId());
            } else {
                parentId = parent.getId();
                replyToName = StringUtils.hasText(req.getReplyToName())
                        ? req.getReplyToName()
                        : authorName(parent.getAuthorId());
            }
        }

        TopicComment comment = new TopicComment();
        comment.setTopicId(topicId);
        comment.setAuthorId(authorId);
        comment.setContent(req.getContent().trim());
        comment.setParentId(parentId);
        comment.setReplyToName(parentId == null ? null : replyToName);
        comment.setLikeCount(0);
        comment.setCreatedAt(LocalDateTime.now());
        commentMapper.insert(comment);
        return toVO(comment, authorId);
    }

    @Transactional
    public void deleteByUser(Long topicId, Long commentId, UserPrincipal user) {
        TopicComment comment = commentMapper.selectById(commentId);
        if (comment == null || !comment.getTopicId().equals(topicId)) {
            throw new BusinessException(404, "评论不存在");
        }
        boolean admin = user != null && "ADMIN".equalsIgnoreCase(user.getRole());
        if (!admin && (user == null || !comment.getAuthorId().equals(user.getId()))) {
            throw new BusinessException(403, "只能删除自己的评论");
        }

        List<Long> toRemove = new ArrayList<>();
        toRemove.add(commentId);
        if (comment.getParentId() == null) {
            List<TopicComment> children = commentMapper.selectList(new LambdaQueryWrapper<TopicComment>()
                    .eq(TopicComment::getTopicId, topicId)
                    .eq(TopicComment::getParentId, commentId));
            for (TopicComment child : children) {
                toRemove.add(child.getId());
            }
        }
        interactService.clearForComments(toRemove);
        for (Long id : toRemove) {
            commentMapper.deleteById(id);
        }
    }

    public CommentVO toVO(TopicComment comment, Long viewerId) {
        int likeCount = interactService.commentLikeCount(comment.getId());
        if (likeCount == 0) {
            likeCount = comment.getLikeCount() == null ? 0 : comment.getLikeCount();
        }
        return CommentVO.builder()
                .id(String.valueOf(comment.getId()))
                .postId(String.valueOf(comment.getTopicId()))
                .authorId(String.valueOf(comment.getAuthorId()))
                .authorName(authorName(comment.getAuthorId()))
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt() == null ? "" : comment.getCreatedAt().format(ISO))
                .likeCount(likeCount)
                .liked(interactService.isLikedComment(viewerId, comment.getId()))
                .parentId(comment.getParentId() == null ? null : String.valueOf(comment.getParentId()))
                .replyToName(comment.getReplyToName())
                .build();
    }

    private String authorName(Long authorId) {
        Account author = accountMapper.selectById(authorId);
        return author == null ? "未知" : author.getUsername();
    }
}
