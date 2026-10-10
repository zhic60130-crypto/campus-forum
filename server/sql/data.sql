USE campus_forum;

INSERT INTO account (id, username, email, password_hash, avatar, role) VALUES
(1, 'admin', 'admin@demo.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '', 'ADMIN'),
(2, 'pixel', 'pixel@demo.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '', 'USER'),
(3, 'nova', 'nova@demo.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '', 'USER');
-- password for all seed users: 123456

INSERT INTO category (id, label, color, icon, desc_text, sort) VALUES
('daily', '日常闲聊', '#409EFF', 'ChatDotRound', '生活琐事与轻松话题', 1),
('friend', '真诚交友', '#9B6DFF', 'User', '找搭子、扩人脉', 2),
('feedback', '问题反馈', '#F56C6C', 'Warning', '吐槽与改进建议', 3),
('hobby', '兴趣爱好', '#67C23A', 'MagicStick', '兴趣圈层与作品分享', 4),
('resource', '资源互助', '#E6A23C', 'FolderOpened', '资料、工具与互助求援', 5);

INSERT INTO tag (id, label) VALUES
('campus', '校园生活'),
('food', '美食'),
('study', '学习'),
('sport', '运动'),
('help', '求助'),
('share', '分享'),
('hobby', '兴趣');

INSERT INTO topic (id, author_id, title, content, category_id, images_json, like_count, favorite_count, created_at) VALUES
(1, 1, '论坛上线啦，先聊聊最近在忙什么', '欢迎来到普通论坛原型。这里可以发帖、点赞、收藏，后续会接上真实后端。', 'daily', '[]', 12, 4, '2026-03-01 10:00:00'),
(2, 2, '求推荐靠谱的学习资料整理方式', '最近笔记越堆越多，有没有好用的分类/标签方案？欢迎分享经验。', 'resource', '[]', 8, 6, '2026-03-02 14:30:00'),
(3, 3, '周末有没有一起打球的搭子', '羽毛球或跑步都行，有兴趣的留言约时间。', 'friend', '[]', 5, 2, '2026-03-03 09:15:00'),
(4, 2, '关于首页加载慢的一点反馈', '偶发首屏白一下，刷新后又正常。方便的话排查一下缓存策略。', 'feedback', '[]', 3, 1, '2026-03-04 16:40:00'),
(5, 1, '分享一张最近拍的天空', '傍晚的云层颜色很好看，随手记录一下。', 'hobby', '["https://picsum.photos/id/1015/800/500"]', 15, 7, '2026-03-05 18:20:00');

INSERT INTO topic_tag (topic_id, tag_id) VALUES
(1, 'share'), (1, 'campus'),
(2, 'study'), (2, 'help'),
(3, 'sport'), (3, 'campus'),
(4, 'help'),
(5, 'hobby'), (5, 'share');

INSERT INTO topic_comment (id, topic_id, author_id, content, parent_id, reply_to_name, like_count, created_at) VALUES
(1, 1, 2, '支持！期待更多板块。', NULL, NULL, 2, '2026-03-01 11:00:00'),
(2, 1, 3, '同问，大家最近都在学什么？', NULL, NULL, 1, '2026-03-01 12:00:00'),
(3, 1, 1, '我在补前端工程化，一起加油。', 2, 'nova', 0, '2026-03-01 12:30:00'),
(4, 2, 1, '可以试试「项目 / 主题 / 日期」三层文件夹。', NULL, NULL, 3, '2026-03-02 15:00:00');

INSERT INTO banner (id, title, subtitle, image_url, link, enabled, sort) VALUES
(1, '欢迎来到 Forum', '分享想法，结识同好', 'https://picsum.photos/id/1015/1200/360', '', 1, 1),
(2, '本周话题征集', '写下你最近在聊的事', 'https://picsum.photos/id/1036/1200/360', '', 1, 2),
(3, '发帖小贴士', '标题清晰、分类准确，更容易被看见', 'https://picsum.photos/id/1043/1200/360', '', 1, 3);

INSERT INTO announcement (content, sort) VALUES
('文明发言，禁止违法违规、人身攻击与广告引流。', 1),
('发帖请选择合适分类与标签，标题与内容尽量清晰完整。', 2),
('本站已接入 JWT 后端，演示账号 admin / 123456。', 3);

INSERT INTO friend_link (name, url, sort) VALUES
('JS Design', 'https://js.design/', 1),
('VForm', 'https://www.vform666.com/', 2);
