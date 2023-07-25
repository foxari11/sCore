package com.sCoreGovCoreBoot.sCore.controller;

import com.sCoreGovCoreBoot.sCore.domain.EvoVO;
import com.sCoreGovCoreBoot.sCore.domain.PaginationVO;
import com.sCoreGovCoreBoot.sCore.service.EvoService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping(value = "/newAgosMap")
    public String mapView() {

        return "newAgosMap.html";
    }

    @GetMapping(value = "/newAgosMap2")
    public String mapView2() {

        return "newAgosMap2.html";
    }
    @GetMapping(value = "/newAgosMap3")
    public String mapView3() {

        return "newAgosMap3.html";
    }

    /********************************
     * 함수명 : insertQuestion
     * 역할   : 평가 등급 정보 등록
     */
    @ResponseBody
    @PostMapping(value = "insertEvo.do")
    public void insertQuestion(@RequestBody EvoVO vo) {
        evoService.insertEvo(vo);

    }

    /********************************
     * 함수명 : deleteQuestion
     * 역할   : 평가 등급 정보 삭제
     */
    @PostMapping(value = "deleteEvo.do")
    @ResponseBody
    public String deleteQuestion(@RequestParam("ids") List<String> ids) {
        for (String id : ids) {
            System.out.println("삭제 요청 받은 아이디: " + id);
            int deletedCount = evoService.deleteEvo(id);
            System.out.println("삭제된 레코드 수: " + deletedCount);
        }
        return "Success"; // 클라이언트에게 보낼 응답 데이터
    }


    /********************************
     * 함수명 : searchByEvaluationName
     * 역할   : 평가 등급 정보 조회
     */
    @GetMapping(value = "/search")
    public String searchByEvaluationName(Model m, @RequestParam(value = "evaluationName") String evaluationName, @RequestParam(value = "pageNo", required = false) String pageNo) {

        // 평가등급명을 기반으로 검색을 수행
        int totalRecord = evoService.searchEvoCount(evaluationName);
        PaginationVO pageVO = new PaginationVO(1, totalRecord, 10, 5);
        List<EvoVO> pglist = evoService.getEvoListByKeyword(evaluationName, pageVO);
        m.addAttribute("pageVO", pageVO);
        m.addAttribute("getEvoList", pglist);
        return "main.html";
    }
}
