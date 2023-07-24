package com.sCoreGovCoreBoot.sCore.service;

import com.sCoreGovCoreBoot.sCore.domain.EvoVO;
import com.sCoreGovCoreBoot.sCore.domain.PaginationVO;
import org.springframework.stereotype.Service;

import java.util.List;
public interface EvoService {

    public int evoCount();

    List<EvoVO> getEvoList(PaginationVO pageVO);

    public int insertEvo(EvoVO vo);

    public int deleteEvo(String id);

    // 검색 결과 개수를 반환하는 메서드
    public int searchEvoCount(String evaluationName);

    // 검색어를 기반으로 검색 결과 리스트를 반환하는 메서드
    public List<EvoVO> getEvoListByKeyword(String evaluationName, PaginationVO pageVO);
}
