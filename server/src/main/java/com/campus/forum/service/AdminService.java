package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.AnnouncementRequest;
import com.campus.forum.entity.Account;
import com.campus.forum.entity.Announcement;
import com.campus.forum.entity.Topic;
import com.campus.forum.mapper.AccountMapper;
import com.campus.forum.mapper.AnnouncementMapper;
import com.campus.forum.mapper.TopicMapper;
import com.campus.forum.vo.PageVO;
import com.campus.forum.vo.TopicVO;
import com.campus.forum.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final TopicMapper topicMapper;
    private final AccountMapper accountMapper;
    private final AnnouncementMapper announcementMapper;
    private final TopicService topicService;

    public PageVO<TopicVO> listTopics(String q, int page, int size) {
        int p = Math.max(page, 1);
        int s = Math.min(Math.max(size, 1), 100);
        LambdaQueryWrapper<Topic> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(q)) {
            String keyword = q.trim();
            wrapper.and(w -> w.like(Topic::getTitle, keyword).or().like(Topic::getContent, keyword));
        }
        wrapper.orderByDesc(Topic::getCreatedAt);
        List<Topic> all = topicMapper.selectList(wrapper);
        long total = all.size();
        int from = Math.min((p - 1) * s, all.size());
        int to = Math.min(from + s, all.size());
        List<TopicVO> records = all.subList(from, to).stream()
                .map(t -> topicService.toVO(t, null))
                .toList();
        return new PageVO<>(records, total, p, s);
    }

    @Transactional
    public void deleteTopic(Long id) {
        topicService.removeTopic(id);
    }

    public PageVO<UserVO> listUsers(String q, int page, int size) {
        int p = Math.max(page, 1);
        int s = Math.min(Math.max(size, 1), 100);
        LambdaQueryWrapper<Account> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(q)) {
            String keyword = q.trim();
            wrapper.and(w -> w.like(Account::getUsername, keyword).or().like(Account::getEmail, keyword));
        }
        wrapper.orderByAsc(Account::getId);
        List<Account> all = accountMapper.selectList(wrapper);
        long total = all.size();
        int from = Math.min((p - 1) * s, all.size());
        int to = Math.min(from + s, all.size());
        List<UserVO> records = all.subList(from, to).stream().map(AuthService::toUserVO).toList();
        return new PageVO<>(records, total, p, s);
    }

    public UserVO updateUserRole(Long id, String role) {
        String normalized = role == null ? "" : role.trim().toUpperCase();
        if (!"ADMIN".equals(normalized) && !"USER".equals(normalized)) {
            throw new BusinessException("角色仅支持 ADMIN / USER");
        }
        Account account = accountMapper.selectById(id);
        if (account == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if ("ADMIN".equals(account.getRole()) && "USER".equals(normalized)) {
            Long adminCount = accountMapper.selectCount(new LambdaQueryWrapper<Account>()
                    .eq(Account::getRole, "ADMIN"));
            if (adminCount <= 1) {
                throw new BusinessException("至少保留一名管理员");
            }
        }
        account.setRole(normalized);
        accountMapper.updateById(account);
        return AuthService.toUserVO(account);
    }

    public List<Map<String, Object>> listAnnouncements() {
        return announcementMapper.selectList(new LambdaQueryWrapper<Announcement>()
                        .orderByAsc(Announcement::getSort)
                        .orderByAsc(Announcement::getId))
                .stream()
                .map(this::toAnnouncementMap)
                .toList();
    }

    public Map<String, Object> createAnnouncement(AnnouncementRequest request) {
        Announcement row = new Announcement();
        row.setContent(request.getContent().trim());
        row.setSort(request.getSort() == null ? 99 : request.getSort());
        announcementMapper.insert(row);
        return toAnnouncementMap(row);
    }

    public Map<String, Object> updateAnnouncement(Long id, AnnouncementRequest request) {
        Announcement row = announcementMapper.selectById(id);
        if (row == null) {
            throw new BusinessException(404, "公告不存在");
        }
        row.setContent(request.getContent().trim());
        if (request.getSort() != null) {
            row.setSort(request.getSort());
        }
        announcementMapper.updateById(row);
        return toAnnouncementMap(row);
    }

    public void deleteAnnouncement(Long id) {
        announcementMapper.deleteById(id);
    }

    private Map<String, Object> toAnnouncementMap(Announcement row) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(row.getId()));
        map.put("content", row.getContent());
        map.put("sort", row.getSort() == null ? 0 : row.getSort());
        return map;
    }
}
