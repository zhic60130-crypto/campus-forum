package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.ReportResolveRequest;
import com.campus.forum.dto.TopicReportCreateRequest;
import com.campus.forum.entity.Account;
import com.campus.forum.entity.Topic;
import com.campus.forum.entity.TopicReport;
import com.campus.forum.mapper.AccountMapper;
import com.campus.forum.mapper.TopicMapper;
import com.campus.forum.mapper.TopicReportMapper;
import com.campus.forum.vo.PageVO;
import com.campus.forum.vo.TopicReportVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReportService {
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final Set<String> REASONS = Set.of("SPAM", "ABUSE", "ILLEGAL", "OTHER");
    private static final Map<String, String> REASON_LABELS = Map.of(
            "SPAM", "垃圾广告",
            "ABUSE", "辱骂攻击",
            "ILLEGAL", "违法违规",
            "OTHER", "其他"
    );
    private static final Map<String, String> STATUS_LABELS = Map.of(
            "PENDING", "待处理",
            "RESOLVED", "已删帖",
            "DISMISSED", "已忽略"
    );

    private final TopicReportMapper reportMapper;
    private final TopicMapper topicMapper;
    private final AccountMapper accountMapper;
    private final TopicService topicService;

    @Transactional
    public TopicReportVO create(Long topicId, Long reporterId, TopicReportCreateRequest request) {
        Topic topic = topicMapper.selectById(topicId);
        if (topic == null) {
            throw new BusinessException(404, "帖子不存在");
        }
        if (topic.getAuthorId().equals(reporterId)) {
            throw new BusinessException("不能举报自己的帖子");
        }

        String reason = normalizeReason(request.getReason());
        TopicReport existing = reportMapper.selectOne(new LambdaQueryWrapper<TopicReport>()
                .eq(TopicReport::getReporterId, reporterId)
                .eq(TopicReport::getTopicId, topicId)
                .last("LIMIT 1"));
        if (existing != null) {
            throw new BusinessException(409, "您已举报过该帖子");
        }

        Account reporter = accountMapper.selectById(reporterId);
        if (reporter == null) {
            throw new BusinessException(401, "用户不存在");
        }

        TopicReport row = new TopicReport();
        row.setTopicId(topicId);
        row.setTopicTitle(topic.getTitle());
        row.setReporterId(reporterId);
        row.setReporterName(reporter.getUsername());
        row.setReason(reason);
        row.setDetail(request.getDetail() == null ? "" : request.getDetail().trim());
        row.setStatus("PENDING");
        row.setAdminNote("");
        row.setCreatedAt(LocalDateTime.now());
        reportMapper.insert(row);
        return toVO(row);
    }

    public PageVO<TopicReportVO> list(String status, int page, int size) {
        int p = Math.max(page, 1);
        int s = Math.min(Math.max(size, 1), 100);
        LambdaQueryWrapper<TopicReport> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status.trim())) {
            wrapper.eq(TopicReport::getStatus, status.trim().toUpperCase(Locale.ROOT));
        }
        wrapper.orderByDesc(TopicReport::getCreatedAt);
        List<TopicReport> all = reportMapper.selectList(wrapper);
        long total = all.size();
        int from = Math.min((p - 1) * s, all.size());
        int to = Math.min(from + s, all.size());
        List<TopicReportVO> records = all.subList(from, to).stream().map(this::toVO).toList();
        return new PageVO<>(records, total, p, s);
    }

    @Transactional
    public TopicReportVO resolve(Long reportId, Long adminId, ReportResolveRequest request) {
        TopicReport report = reportMapper.selectById(reportId);
        if (report == null) {
            throw new BusinessException(404, "举报不存在");
        }
        if (!"PENDING".equals(report.getStatus())) {
            throw new BusinessException("该举报已处理");
        }

        String action = request.getAction() == null ? "" : request.getAction().trim().toUpperCase(Locale.ROOT);
        String note = request.getAdminNote() == null ? "" : request.getAdminNote().trim();
        LocalDateTime now = LocalDateTime.now();

        if ("DISMISS".equals(action)) {
            report.setStatus("DISMISSED");
            report.setAdminId(adminId);
            report.setAdminNote(note);
            report.setResolvedAt(now);
            reportMapper.updateById(report);
            return toVO(report);
        }

        if ("DELETE_TOPIC".equals(action)) {
            Long topicId = report.getTopicId();
            List<TopicReport> pending = reportMapper.selectList(new LambdaQueryWrapper<TopicReport>()
                    .eq(TopicReport::getTopicId, topicId)
                    .eq(TopicReport::getStatus, "PENDING"));
            for (TopicReport item : pending) {
                item.setStatus("RESOLVED");
                item.setAdminId(adminId);
                item.setAdminNote(StringUtils.hasText(note) ? note : "违规内容已删除");
                item.setResolvedAt(now);
                reportMapper.updateById(item);
            }
            if (topicMapper.selectById(topicId) != null) {
                topicService.removeTopic(topicId, adminId, StringUtils.hasText(note) ? note : "违规内容已删除");
            }
            TopicReport updated = reportMapper.selectById(reportId);
            return toVO(updated != null ? updated : report);
        }

        throw new BusinessException("处理方式仅支持 DISMISS / DELETE_TOPIC");
    }

    private String normalizeReason(String reason) {
        String normalized = reason == null ? "" : reason.trim().toUpperCase(Locale.ROOT);
        if (!REASONS.contains(normalized)) {
            throw new BusinessException("无效的举报原因");
        }
        return normalized;
    }

    private TopicReportVO toVO(TopicReport row) {
        TopicReportVO vo = new TopicReportVO();
        vo.setId(String.valueOf(row.getId()));
        vo.setTopicId(String.valueOf(row.getTopicId()));
        vo.setTopicTitle(row.getTopicTitle());
        vo.setTopicExists(topicMapper.selectById(row.getTopicId()) != null);
        vo.setReporterId(String.valueOf(row.getReporterId()));
        vo.setReporterName(row.getReporterName());
        vo.setReason(row.getReason());
        vo.setReasonLabel(REASON_LABELS.getOrDefault(row.getReason(), row.getReason()));
        vo.setDetail(row.getDetail() == null ? "" : row.getDetail());
        vo.setStatus(row.getStatus());
        vo.setStatusLabel(STATUS_LABELS.getOrDefault(row.getStatus(), row.getStatus()));
        vo.setAdminNote(row.getAdminNote() == null ? "" : row.getAdminNote());
        vo.setCreatedAt(row.getCreatedAt() == null ? null : ISO.format(row.getCreatedAt()));
        vo.setResolvedAt(row.getResolvedAt() == null ? null : ISO.format(row.getResolvedAt()));
        return vo;
    }
}
