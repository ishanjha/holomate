package com.holomate.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.holomate.core.service.LlamaService;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer{

	
    private  LlamaService llamaService;

    
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler(), "/chat").setAllowedOrigins("*");
	}

	
	   @Bean
	    public ChatWebSocketHandler chatWebSocketHandler() {
	        return new ChatWebSocketHandler(llamaService);
	    }
}
