package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.Topic;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface TopicMapper extends BaseMapper<Topic> {

    @Select("""
            SELECT t.* FROM topic t
            INNER JOIN interact i ON i.target_id = t.id
              AND i.target_type = 'TOPIC' AND i.action_type = 'FAVORITE' AND i.user_id = #{userId}
            ORDER BY i.created_at DESC
            LIMIT #{limit} OFFSET #{offset}
            """)
    List<Topic> findFavorites(@Param("userId") Long userId,
                              @Param("offset") long offset,
                              @Param("limit") long limit);

    @Select("""
            SELECT COUNT(*) FROM interact
            WHERE user_id = #{userId} AND target_type = 'TOPIC' AND action_type = 'FAVORITE'
            """)
    long countFavorites(@Param("userId") Long userId);

    @Update("UPDATE topic SET like_count = #{likeCount}, favorite_count = #{favoriteCount} WHERE id = #{id}")
    int updateCounts(@Param("id") Long id,
                     @Param("likeCount") int likeCount,
                     @Param("favoriteCount") int favoriteCount);
}
