package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.TopicComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface TopicCommentMapper extends BaseMapper<TopicComment> {

    @Update("UPDATE topic_comment SET like_count = #{likeCount} WHERE id = #{id}")
    int updateLikeCount(@Param("id") Long id, @Param("likeCount") int likeCount);
}
