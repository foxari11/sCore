package com.sCoreGovCoreBoot.sCore.service;

import com.sCoreGovCoreBoot.sCore.domain.EvoVO;
import com.sCoreGovCoreBoot.sCore.domain.PaginationVO;
import org.springframework.stereotype.Service;

import java.util.List;
public interface EvoService {

    public int evoCount();
    List<EvoVO> getEvoList(PaginationVO pageVO);

    public int insertEvo(EvoVO vo);
}
