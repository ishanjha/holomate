package com.holomate.core.config;

import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.holomate.core.dto.UserMessage;
import com.holomate.core.service.LlamaService;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler{

	@Autowired
	 private final LlamaService llamaService;
	
	    private final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
	    private final ObjectMapper objectMapper = new ObjectMapper();

	    public ChatWebSocketHandler(LlamaService llamaService) {
	        this.llamaService = llamaService;
	    }

	    @Override
	    public void afterConnectionEstablished(WebSocketSession session) {
	        sessions.add(session);
	        System.out.println("WebSocket connection established ");

	    }

	    
	    @Override
	    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
	        System.out.println(" Received raw WebSocket message: " + message.getPayload());

	        try {
	            ObjectMapper objectMapper = new ObjectMapper();
	            UserMessage userMessage = objectMapper.readValue(message.getPayload(), UserMessage.class);
	            System.out.println("Extracted user message: " + userMessage.getMessage());

	            String aiResponse = llamaService.getLlamaResponse(userMessage.getMessage());
	            System.out.println(" AI Response: " + aiResponse);

	            UserMessage responseMessage = new UserMessage(aiResponse);
	            String responseJson = objectMapper.writeValueAsString(responseMessage);
	            session.sendMessage(new TextMessage(responseJson));
	            System.out.println(" Sent response to frontend: " + responseJson);
	        } catch (Exception e) {
	            System.out.println(" Error processing WebSocket message: " + e.getMessage());
	        }
	    }

	    @Override
	    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
	        sessions.remove(session);
	        System.out.println("WebSocket connection closed ");

	    }

}
