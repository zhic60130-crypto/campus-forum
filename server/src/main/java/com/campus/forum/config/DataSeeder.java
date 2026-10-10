package com.campus.forum.config;

import com.campus.forum.entity.*;
import com.campus.forum.mapper.*;
import com.campus.forum.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {
    private final AccountMapper accountMapper;
    private final TagMapper tagMapper;
    private final TopicMapper topicMapper;
    private final TopicTagMapper topicTagMapper;
    private final TopicCommentMapper commentMapper;
    private final BannerMapper bannerMapper;
    private final AnnouncementMapper announcementMapper;
    private final FriendLinkMapper friendLinkMapper;
    private final PasswordEncoder passwordEncoder;

    private static final String[][] DEFAULT_TAGS = {
            {"campus", "校园生活"},
            {"food", "美食"},
            {"study", "学习"},
            {"sport", "运动"},
            {"help", "求助"},
            {"share", "分享"},
            {"hobby", "兴趣"},
    };

    @Override
    public void run(ApplicationArguments args) {
        ensureDefaultTags();
        if (accountMapper.selectCount(null) > 0) {
            return;
        }
        log.info("Seeding demo data...");
        String hash = passwordEncoder.encode("password123");

        Account admin = account("admin", "admin@demo.local", hash, "ADMIN");
        Account pixel = account("pixel", "pixel@demo.local", hash, "USER");
        Account nova = account("nova", "nova@demo.local", hash, "USER");
        accountMapper.insert(admin);
        accountMapper.insert(pixel);
        accountMapper.insert(nova);

        // like/favorite 计数以互动存储为准，种子数据从 0 起便于演示点赞
        Topic t1 = topic(admin.getId(), "论坛上线啦，先聊聊最近在忙什么",
                "欢迎来到普通论坛。这里可以发帖、点赞、收藏。", "daily", List.of(), 0, 0);
        Topic t2 = topic(pixel.getId(), "求推荐靠谱的学习资料整理方式",
                "最近笔记越堆越多，有没有好用的分类/标签方案？", "resource", List.of(), 0, 0);
        Topic t3 = topic(nova.getId(), "周末有没有一起打球的搭子",
                "羽毛球或跑步都行，有兴趣的留言约时间。", "friend", List.of(), 0, 0);
        Topic t4 = topic(pixel.getId(), "关于首页加载慢的一点反馈",
                "偶发首屏白一下，刷新后又正常。", "feedback", List.of(), 0, 0);
        Topic t5 = topic(admin.getId(), "分享一张最近拍的天空",
                "傍晚的云层颜色很好看，随手记录一下。", "hobby",
                List.of("https://picsum.photos/id/1015/800/500"), 0, 0);
        topicMapper.insert(t1);
        topicMapper.insert(t2);
        topicMapper.insert(t3);
        topicMapper.insert(t4);
        topicMapper.insert(t5);

        link(t1.getId(), "share");
        link(t1.getId(), "campus");
        link(t2.getId(), "study");
        link(t2.getId(), "help");
        link(t3.getId(), "sport");
        link(t3.getId(), "campus");
        link(t4.getId(), "help");
        link(t5.getId(), "hobby");
        link(t5.getId(), "share");

        comment(t1.getId(), pixel.getId(), "支持！期待更多板块。", null, null, 2);
        TopicComment c2 = comment(t1.getId(), nova.getId(), "同问，大家最近都在学什么？", null, null, 1);
        comment(t1.getId(), admin.getId(), "我在补前端工程化，一起加油。", c2.getId(), "nova", 0);
        comment(t2.getId(), admin.getId(), "可以试试「项目 / 主题 / 日期」三层文件夹。", null, null, 3);

        banner("欢迎来到 Forum", "分享想法，结识同好", "https://picsum.photos/id/1015/1200/360", 1);
        banner("本周话题征集", "写下你最近在聊的事", "https://picsum.photos/id/1036/1200/360", 2);
        banner("发帖小贴士", "标题清晰、分类准确，更容易被看见", "https://picsum.photos/id/1043/1200/360", 3);

        if (announcementMapper.selectCount(null) == 0) {
            announcement("文明发言，禁止违法违规、人身攻击与广告引流。", 1);
            announcement("发帖请选择合适分类与标签，标题与内容尽量清晰完整。", 2);
            announcement("演示账号 admin / password123（也可用 pixel、nova）。", 3);
        }
        if (friendLinkMapper.selectCount(null) == 0) {
            friend("JS Design", "https://js.design/", 1);
            friend("VForm", "https://www.vform666.com/", 2);
        }
        log.info("Demo data ready. admin / password123");
    }

    /**
     * 保证内置标签始终存在（管理端误删后重启可恢复；不覆盖有关联的自定义标签）。
     */
    private void ensureDefaultTags() {
        int added = 0;
        int cleaned = 0;
        for (String[] row : DEFAULT_TAGS) {
            String id = row[0];
            String label = row[1];
            if (tagMapper.selectById(id) == null) {
                Tag byLabel = tagMapper.selectOne(
                        new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Tag>()
                                .eq(Tag::getLabel, label)
                                .last("LIMIT 1"));
                if (byLabel != null) {
                    // 同名但 id 不同：无关联时可回收为内置 id，否则跳过
                    if (!id.equals(byLabel.getId()) && topicTagMapper.countByTagId(byLabel.getId()) == 0) {
                        tagMapper.deleteById(byLabel.getId());
                        cleaned++;
                    } else {
                        continue;
                    }
                }
                Tag tag = new Tag();
                tag.setId(id);
                tag.setLabel(label);
                tagMapper.insert(tag);
                added++;
            }
            // 清理同名单重复 id（例如曾用中文作 id 又恢复了内置英文 id）
            var duplicates = tagMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Tag>()
                            .eq(Tag::getLabel, label));
            for (Tag dup : duplicates) {
                if (!id.equals(dup.getId()) && topicTagMapper.countByTagId(dup.getId()) == 0) {
                    tagMapper.deleteById(dup.getId());
                    cleaned++;
                }
            }
        }
        if (added > 0 || cleaned > 0) {
            log.info("Default tags: restored {}, cleaned {}", added, cleaned);
        }
    }

    private Account account(String username, String email, String hash, String role) {
        Account a = new Account();
        a.setUsername(username);
        a.setEmail(email);
        a.setPasswordHash(hash);
        a.setAvatar("");
        a.setBio("");
        a.setRole(role);
        a.setCreatedAt(LocalDateTime.now());
        a.setUpdatedAt(LocalDateTime.now());
        return a;
    }

    private Topic topic(Long authorId, String title, String content, String categoryId,
                        List<String> images, int likes, int favs) {
        Topic t = new Topic();
        t.setAuthorId(authorId);
        t.setTitle(title);
        t.setContent(content);
        t.setCategoryId(categoryId);
        t.setImagesJson(JsonUtils.toJson(images));
        t.setLikeCount(likes);
        t.setFavoriteCount(favs);
        t.setCreatedAt(LocalDateTime.now().minusDays(likes % 5 + 1));
        t.setUpdatedAt(LocalDateTime.now());
        return t;
    }

    private void link(Long topicId, String tagId) {
        TopicTag tt = new TopicTag();
        tt.setTopicId(topicId);
        tt.setTagId(tagId);
        topicTagMapper.insert(tt);
    }

    private TopicComment comment(Long topicId, Long authorId, String content,
                                 Long parentId, String replyTo, int likes) {
        TopicComment c = new TopicComment();
        c.setTopicId(topicId);
        c.setAuthorId(authorId);
        c.setContent(content);
        c.setParentId(parentId);
        c.setReplyToName(replyTo);
        c.setLikeCount(likes);
        c.setCreatedAt(LocalDateTime.now());
        commentMapper.insert(c);
        return c;
    }

    private void banner(String title, String subtitle, String url, int sort) {
        Banner b = new Banner();
        b.setTitle(title);
        b.setSubtitle(subtitle);
        b.setImageUrl(url);
        b.setLink("");
        b.setEnabled(true);
        b.setSort(sort);
        b.setCreatedAt(LocalDateTime.now());
        b.setUpdatedAt(LocalDateTime.now());
        bannerMapper.insert(b);
    }

    private void announcement(String content, int sort) {
        Announcement a = new Announcement();
        a.setContent(content);
        a.setSort(sort);
        announcementMapper.insert(a);
    }

    private void friend(String name, String url, int sort) {
        FriendLink f = new FriendLink();
        f.setName(name);
        f.setUrl(url);
        f.setSort(sort);
        friendLinkMapper.insert(f);
    }
}
