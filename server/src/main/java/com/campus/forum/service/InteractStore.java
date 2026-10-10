package com.campus.forum.service;

import java.util.Set;

public interface InteractStore {
    boolean toggle(String key, String member);

    boolean contains(String key, String member);

    long size(String key);

    Set<String> members(String key);

    Set<String> keys(String pattern);

    void clear(String key);
}
