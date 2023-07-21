package com.sCoreGovCoreBoot.sCore.dao;

import com.sCoreGovCoreBoot.sCore.domain.EvoVO;
import com.sCoreGovCoreBoot.sCore.domain.PaginationVO;
import org.apache.ibatis.annotations.Mapper;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.stereotype.Component;

import java.util.List;
@MapperScan
@Mapper
public interface EvoDao {

    public int evoCount();

    public List<EvoVO> getEvoList(PaginationVO pageVO);

    public int insertEvo(EvoVO vo);


}
