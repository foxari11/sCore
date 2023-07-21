package com.sCoreGovCoreBoot.sCore.domain;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class EvoVO {

    private String evlform_id;             // 평가지 ID (기본 키)
    private String evlform_nm;             // 평가지 명
    private String mlsfc_nm_yn;            // 중분류 명 사용여부 ('Y' 또는 'N')
    private String sclas_nm_yn;            // 소분류 명 사용여부 ('Y' 또는 'N')
    private String evlform_cn;            // 평가지 설명
    private String evl_stdr;              // 평가 기준
    private String instt_code;            // 기관 코드
    private String evlform_knd_code;      // 평가지 종류 코드
    private String remark;                // 비고
    private Long menu_no;                 // 메뉴 번호 (큰 정수형)
    private String end_yn;                // 마감 여부 ('Y' 또는 'N')
    private String frst_register_id;      // 최초 등록자 ID
    private Timestamp frst_regist_pnttm;  // 최초 등록 시점 (시간 정보 포함)
    private String last_updusr_id;        // 최종 수정자 ID
    private Timestamp last_updt_pnttm;    // 최종 수정 시점 (시간 정보 포함)
}
