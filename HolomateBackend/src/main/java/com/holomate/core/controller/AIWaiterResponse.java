package com.holomate.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.holomate.core.service.LlamaService;

@RestController
@RequestMapping("/api/llama")
public class AIWaiterResponse {
	
	@Autowired
	private LlamaService llamaService;
	

	 @PostMapping("/response")
	    public String getResponse(@RequestBody String message) {
	        try {
	            return llamaService.getLlamaResponse(message);
	        } catch (Exception e) {
	            return "Error processing request: " + e.getMessage();
	        }
	    }
	

}
