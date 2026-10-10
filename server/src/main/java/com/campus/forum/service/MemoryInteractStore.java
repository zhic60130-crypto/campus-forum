package com.campus.forum.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(prefix = "forum.interact", name = "memory-fallback", havingValue = "true", matchIfMissing = true)
public class MemoryInteractStore implements InteractStore {
    private final Map<String, Set<String>> store = new ConcurrentHashMap<>();

    @Override
    public boolean toggle(String key, String member) {
        Set<String> set = store.computeIfAbsent(key, k -> ConcurrentHashMap.newKeySet());
        if (set.contains(member)) {
            set.remove(member);
            return false;
        }
        set.add(member);
        return true;
    }

    @Override
    public boolean contains(String key, String member) {
        Set<String> set = store.get(key);
        return set != null && set.contains(member);
    }

    @Override
    public long size(String key) {
        Set<String> set = store.get(key);
        return set == null ? 0 : set.size();
    }

    @Override
    public Set<String> members(String key) {
        Set<String> set = store.get(key);
        return set == null ? Collections.emptySet() : Set.copyOf(set);
    }

    @Override
    public Set<String> keys(String pattern) {
        String prefix = pattern.replace("*", "");
        return store.keySet().stream().filter(k -> k.startsWith(prefix)).collect(Collectors.toSet());
    }

    @Override
    public void clear(String key) {
        store.remove(key);
    }
}
