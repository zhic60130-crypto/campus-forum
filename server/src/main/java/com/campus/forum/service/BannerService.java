package com.campus.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.forum.common.BusinessException;
import com.campus.forum.dto.BannerRequest;
import com.campus.forum.entity.Banner;
import com.campus.forum.mapper.BannerMapper;
import com.campus.forum.vo.BannerVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerMapper bannerMapper;

    public List<BannerVO> listActive() {
        return bannerMapper.selectList(new LambdaQueryWrapper<Banner>()
                        .eq(Banner::getEnabled, true)
                        .orderByAsc(Banner::getSort))
                .stream()
                .filter(b -> b.getImageUrl() != null && !b.getImageUrl().isBlank())
                .map(this::toVO)
                .toList();
    }

    public List<BannerVO> listAll() {
        return bannerMapper.selectList(new LambdaQueryWrapper<Banner>().orderByAsc(Banner::getSort))
                .stream()
                .map(this::toVO)
                .toList();
    }

    public BannerVO create(BannerRequest req) {
        Banner banner = new Banner();
        apply(banner, req);
        banner.setCreatedAt(LocalDateTime.now());
        banner.setUpdatedAt(LocalDateTime.now());
        bannerMapper.insert(banner);
        return toVO(banner);
    }

    public BannerVO update(Long id, BannerRequest req) {
        Banner banner = bannerMapper.selectById(id);
        if (banner == null) {
            throw new BusinessException(404, "轮播不存在");
        }
        apply(banner, req);
        banner.setUpdatedAt(LocalDateTime.now());
        bannerMapper.updateById(banner);
        return toVO(banner);
    }

    public void remove(Long id) {
        bannerMapper.deleteById(id);
    }

    public BannerVO toggle(Long id) {
        Banner banner = bannerMapper.selectById(id);
        if (banner == null) {
            throw new BusinessException(404, "轮播不存在");
        }
        banner.setEnabled(banner.getEnabled() == null || !banner.getEnabled());
        banner.setUpdatedAt(LocalDateTime.now());
        bannerMapper.updateById(banner);
        return toVO(banner);
    }

    private void apply(Banner banner, BannerRequest req) {
        banner.setTitle(req.getTitle().trim());
        banner.setSubtitle(req.getSubtitle() == null ? "" : req.getSubtitle().trim());
        banner.setImageUrl(req.getImageUrl().trim());
        banner.setLink(req.getLink() == null ? "" : req.getLink().trim());
        banner.setEnabled(req.getEnabled() == null || req.getEnabled());
        banner.setSort(req.getSort() == null ? 1 : req.getSort());
    }

    private BannerVO toVO(Banner banner) {
        return BannerVO.builder()
                .id(String.valueOf(banner.getId()))
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .imageUrl(banner.getImageUrl())
                .link(banner.getLink())
                .enabled(Boolean.TRUE.equals(banner.getEnabled()))
                .sort(banner.getSort() == null ? 0 : banner.getSort())
                .build();
    }
}
