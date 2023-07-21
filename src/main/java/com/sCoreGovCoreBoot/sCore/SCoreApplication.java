package com.sCoreGovCoreBoot.sCore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan; // 주의: @MapperScan 애너테이션은 mybatis.spring 패키지에서 가져와야 합니다.

@SpringBootApplication
public class SCoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(SCoreApplication.class, args);
	}

}
