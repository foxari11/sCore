package com.sCoreGovCoreBoot.sCore.service;

import com.sCoreGovCoreBoot.sCore.dao.EvoDao;
import com.sCoreGovCoreBoot.sCore.domain.EvoVO;
import com.sCoreGovCoreBoot.sCore.domain.PaginationVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class EvoServiceImpl implements EvoService {

    @Autowired
    private EvoDao evoDao;

    public int evoCount() {
        return evoDao.evoCount();
    }

    public List<EvoVO> getEvoList(PaginationVO pageVO) {
        return evoDao.getEvoList(pageVO);
    }

    public int insertEvo(EvoVO vo) {
        return evoDao.insertEvo(vo);
    }

    public int deleteEvo(String id) {
        return evoDao.deleteEvo( id);
    }

    @Override
    public int searchEvoCount(String evaluationName) {
        return evoDao.searchEvoCount(evaluationName);
    }

    @Override
    public List<EvoVO> getEvoListByKeyword(String evaluationName, PaginationVO pageVO) {
        return evoDao.getEvoListByKeyword(evaluationName, pageVO);
    }

}
