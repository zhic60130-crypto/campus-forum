CREATE DATABASE IF NOT EXISTS campus_forum DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_forum;

CREATE TABLE IF NOT EXISTS account (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(64)  NOT NULL UNIQUE,
    email         VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    avatar        VARCHAR(512) DEFAULT '',
    bio           VARCHAR(500) DEFAULT '',
    role          VARCHAR(32)  NOT NULL DEFAULT 'USER',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS category (
    id    VARCHAR(32) PRIMARY KEY,
    label VARCHAR(64)  NOT NULL,
    color VARCHAR(32)  NOT NULL,
    icon  VARCHAR(64)  NOT NULL,
    desc_text VARCHAR(255) DEFAULT NULL,
    sort  INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tag (
    id    VARCHAR(32) PRIMARY KEY,
    label VARCHAR(64) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topic (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id      BIGINT       NOT NULL,
    title          VARCHAR(200) NOT NULL,
    content        TEXT         NOT NULL,
    category_id    VARCHAR(32)  NOT NULL,
    images_json    JSON         NULL,
    like_count     INT          NOT NULL DEFAULT 0,
    favorite_count INT          NOT NULL DEFAULT 0,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_topic_category (category_id),
    INDEX idx_topic_author (author_id),
    INDEX idx_topic_created (created_at),
    CONSTRAINT fk_topic_author FOREIGN KEY (author_id) REFERENCES account(id),
    CONSTRAINT fk_topic_category FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topic_tag (
    topic_id BIGINT      NOT NULL,
    tag_id   VARCHAR(32) NOT NULL,
    PRIMARY KEY (topic_id, tag_id),
    CONSTRAINT fk_tt_topic FOREIGN KEY (topic_id) REFERENCES topic(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_tag FOREIGN KEY (tag_id) REFERENCES tag(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topic_comment (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    topic_id     BIGINT       NOT NULL,
    author_id    BIGINT       NOT NULL,
    content      TEXT         NOT NULL,
    parent_id    BIGINT       NULL,
    reply_to_name VARCHAR(64) NULL,
    like_count   INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comment_topic (topic_id),
    CONSTRAINT fk_comment_topic FOREIGN KEY (topic_id) REFERENCES topic(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES account(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS interact (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    target_id   BIGINT      NOT NULL,
    target_type VARCHAR(32) NOT NULL,
    action_type VARCHAR(32) NOT NULL,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_interact (user_id, target_id, target_type, action_type),
    INDEX idx_interact_target (target_type, target_id, action_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banner (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    title      VARCHAR(128) NOT NULL,
    subtitle   VARCHAR(255) DEFAULT '',
    image_url  VARCHAR(512) NOT NULL,
    link       VARCHAR(512) DEFAULT '',
    enabled    TINYINT(1)   NOT NULL DEFAULT 1,
    sort       INT          NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcement (
    id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(512) NOT NULL,
    sort    INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS friend_link (
    id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64)  NOT NULL,
    url  VARCHAR(512) NOT NULL,
    sort INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topic_report (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    topic_id      BIGINT       NOT NULL,
    topic_title   VARCHAR(200) NOT NULL,
    reporter_id   BIGINT       NOT NULL,
    reporter_name VARCHAR(64)  NOT NULL,
    reason        VARCHAR(32)  NOT NULL,
    detail        VARCHAR(500) DEFAULT '',
    status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    admin_id      BIGINT       NULL,
    admin_note    VARCHAR(500) DEFAULT '',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at   DATETIME     NULL,
    UNIQUE KEY uk_report_reporter_topic (reporter_id, topic_id),
    INDEX idx_report_status (status, created_at),
    INDEX idx_report_topic (topic_id)
) ENGINE=InnoDB;
