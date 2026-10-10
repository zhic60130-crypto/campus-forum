package com.campus.forum.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;

@Component
@Primary
@ConditionalOnBean(StringRedisTemplate.class)
@ConditionalOnProperty(prefix = "forum.interact", name = "memory-fallback", havingValue = "false")
public class RedisInteractStore implements InteractStore {
    private final StringRedisTemplate redis;

    public RedisInteractStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @Override
    public boolean toggle(String key, String member) {
        Boolean memberOf = redis.opsForSet().isMember(key, member);
        if (Boolean.TRUE.equals(memberOf)) {
            redis.opsForSet().remove(key, member);
            return false;
        }
        redis.opsForSet().add(key, member);
        return true;
    }

    @Override
    public boolean contains(String key, String member) {
        return Boolean.TRUE.equals(redis.opsForSet().isMember(key, member));
    }

    @Override
    public long size(String key) {
        Long size = redis.opsForSet().size(key);
        return size == null ? 0 : size;
    }

    @Override
    public Set<String> members(String key) {
        Set<String> members = redis.opsForSet().members(key);
        return members == null ? Collections.emptySet() : members;
    }

    @Override
    public Set<String> keys(String pattern) {
        Set<String> keys = redis.keys(pattern);
        return keys == null ? Collections.emptySet() : keys;
    }

    @Override
    public void clear(String key) {
        redis.delete(key);
    }
}
