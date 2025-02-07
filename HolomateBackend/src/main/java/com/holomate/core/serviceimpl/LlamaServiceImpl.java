package com.holomate.core.serviceimpl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.holomate.core.service.LlamaService;

@Service
public class LlamaServiceImpl implements LlamaService{

	
	private static final String ACCESS_TOKEN = "pzTaq4cczB8NJnfePkZHCht8DUX6YUGi";
	private static final String ENDPOINT_URL = "https://akash.eastus2.inference.ml.azure.com/score";
	
    private final List<Map<String, String>> conversationHistory = new ArrayList<>();



    
    @Override
    public String getLlamaResponse(String message) throws Exception {
        if (conversationHistory.isEmpty()) {
            conversationHistory.add(Map.of("role", "system", "content",
					"You are a friendly and professional waiter at a high-end restaurant. " +
		                "You are a lively and friendly Mexican waiter at an authentic Mexican restaurant. " +
						"Keep responses **short, natural, and conversational**, like a real human waiter. " +
						"For menu-related questions, provide brief, engaging answers. " +
						"If a customer asks for recommendations, suggest **one or two dishes** instead of listing everything. " +
						"If they ask about dietary options, **answer concisely** and offer **a simple alternative**. " +
						"Avoid over-explaining, just like a real waiter would in a busy restaurant."+
						  "Your tone is always warm, welcoming, and fun. " +
			                "You speak with enthusiasm and a Mexican touch, even when speaking English. " 
            ));
            
        }
        

        conversationHistory.add(Map.of("role", "user", "content", message));

        
        String jsonInput = buildInputJson();
        System.out.println("Request JSON: " + jsonInput);

        String response = sendHttpRequest(ENDPOINT_URL, jsonInput);


        return response;
    }



    
	
	private String buildInputJson() {
	    return new JSONObject()
	            .put("input_data", new JSONObject()
	                    .put("input_string", conversationHistory) 
	                    .put("parameters", new JSONObject()
	                            .put("temperature", 0.8)
	                            .put("top_p", 0.8)
	                            .put("max_new_tokens", 3096)
	                    )
	            ).toString();
	}


	private String sendHttpRequest(String url, String jsonInput) throws IOException {
	    HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
	    connection.setRequestMethod("POST");
	    connection.setRequestProperty("Authorization", "Bearer " + ACCESS_TOKEN);
	    connection.setRequestProperty("Content-Type", "application/json");
	    connection.setDoOutput(true);

	    System.out.println("Sending request to AI model...");
	    
	    try (OutputStream os = connection.getOutputStream()) {
	        os.write(jsonInput.getBytes("utf-8"));
	    }

	    int responseCode = connection.getResponseCode();
	    System.out.println("AI API Response Code: " + responseCode);

	    try (BufferedReader reader = new BufferedReader(new InputStreamReader(
	            responseCode == HttpURLConnection.HTTP_OK ? connection.getInputStream() : connection.getErrorStream(), "utf-8"
	    ))) {
	        String result = reader.lines().reduce("", (acc, line) -> acc + line.trim());
	        System.out.println("AI Model Response: " + result);
	        return result;
	    } catch (Exception e) {
	        System.out.println("Error reading AI response: " + e.getMessage());
	        return "Error fetching AI response.";
	    }
	}

}
