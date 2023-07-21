package com.sCoreGovCoreBoot.sCore.controller;

import com.sCoreGovCoreBoot.sCore.domain.EvoVO;
import com.sCoreGovCoreBoot.sCore.domain.PaginationVO;
import com.sCoreGovCoreBoot.sCore.service.EvoService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@AllArgsConstructor
public class EvoController {

    @Autowired
    private EvoService evoService;

    @GetMapping(value = "/main")
    public String homeView(Model m, @RequestParam(value = "pageNo", required = false) String pageNo) {
        if(pageNo == null) pageNo = "1";
        int totalRecord = evoService.evoCount();
        PaginationVO pageVO = new PaginationVO(Integer.parseInt(pageNo), totalRecord, 10, 5);
        List<EvoVO> pglist = evoService.getEvoList(pageVO);
        m.addAttribute("pageVO", pageVO);
        m.addAttribute("getEvoList", pglist);
        return "main.html";

    }

    @PostMapping(value = "insertEvo.do")
    public String insertQuestion(EvoVO vo) {
        evoService.insertEvo(vo);
        return "redirect:main.html";
    }



}
