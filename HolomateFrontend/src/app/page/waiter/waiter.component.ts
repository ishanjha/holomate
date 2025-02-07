import { Component } from '@angular/core';
import { WebSocketServiceServiceService } from '../../Services/web-socket-service-service.service';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrl: './waiter.component.css'
})
export class WaiterComponent {

  userMessage: string = '';
  conversationHistory: { role: string; content: string }[] = [];
  recognition: any;
  isListening: boolean = false;

  constructor(private webSocketService: WebSocketServiceServiceService) {}

  ngOnInit() {
    this.initSpeechRecognition();

    // Listen for AI responses
    this.webSocketService.getMessages().subscribe((response: string) => {
      this.conversationHistory.push({ role: 'assistant', content: response });
      setTimeout(() => this.speakText(response), 500); 

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
  
    const speakNextSentence = () => {
      if (index < sentences.length) {
        const utterance = new SpeechSynthesisUtterance(sentences[index].trim());
        utterance.lang = 'es-MX'; 
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
  
        utterance.onend = () => {
          index++;
          speakNextSentence(); 
        };
  
        window.speechSynthesis.speak(utterance);
      }
    };
  
    speakNextSentence();
  }
  

}
