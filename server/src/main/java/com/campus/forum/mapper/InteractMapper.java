package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.Interact;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface InteractMapper extends BaseMapper<Interact> {

    @Delete("""
            DELETE FROM interact
            WHERE user_id = #{userId} AND target_id = #{targetId}
              AND target_type = #{targetType} AND action_type = #{actionType}
            """)
    int deleteOne(@Param("userId") Long userId,
                  @Param("targetId") Long targetId,
                  @Param("targetType") String targetType,
                  @Param("actionType") String actionType);

    @Delete("""
            DELETE FROM interact
            WHERE target_id = #{targetId} AND target_type = #{targetType}
            """)
    int deleteByTarget(@Param("targetId") Long targetId, @Param("targetType") String targetType);
}
