import { Component } from '@angular/core';
import { HolomateWebsocketService } from '../../HolomateServices/holomate-websocket.service';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.scss']
})
export class WaiterComponent {

  aiResponse: string = '';

  userMessage: string = '';
  conversationHistory: { role: string; content: string }[] = [];
  recognition: any;
  isListening: boolean = false;

  isSpeaking:boolean =false; 

  constructor(private webSocketService: HolomateWebsocketService) {}


 

  ngOnInit() {
    this.initSpeechRecognition();
  
    this.webSocketService.getMessages().subscribe((response: string) => {
      this.stopListening(); 

      try {
        const parsedResponse = JSON.parse(response); 
        if (parsedResponse.output) {
          this.aiResponse = parsedResponse.output; 
        } else {
          this.aiResponse = response; 
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        this.aiResponse = response; 
      }
  
      this.conversationHistory.push({ role: 'assistant', content: this.aiResponse });
  
      console.log("AI Response (Cleaned):", this.aiResponse);
  
     
    });
  }
  


  initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎙️ Recognized speech:", transcript);
      this.sendMessage(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  startListening() {
    if (!this.recognition) return;
    this.isListening = true;
    this.recognition.start();
    console.log("🎙️ Listening...");
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.isListening = false;
    console.log("🛑 Stopped Listening.");
  }

  sendMessage(text?: string) {
    if (!text && !this.userMessage.trim()) return;
    const message = text || this.userMessage;

    this.conversationHistory.push({ role: 'user', content: message });

    this.webSocketService.sendMessage(message);

    this.userMessage = '';
  }


  speakText(text: string) {
    if (!window.speechSynthesis) {
      console.error("🚨 Speech synthesis is NOT supported in this browser.");
      return;
    }
  
    window.speechSynthesis.cancel();
  
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]; 
  
    let index = 0;
    this.isSpeaking = true;  
  
    const speakNextSentence = () => {
      if (index < sentences.length) {
        const utterance = new SpeechSynthesisUtterance(sentences[index].trim());
        utterance.lang = 'es-US'; 
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
  
        utterance.onend = () => {
          index++;
          if (index < sentences.length) {
            speakNextSentence();
          } else {
            this.isSpeaking = false; 
          }
        };
  
        window.speechSynthesis.speak(utterance);
      } else {
        this.isSpeaking = false;  
      }
    };
  
    speakNextSentence();
  }
}
