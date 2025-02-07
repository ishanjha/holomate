import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketServiceServiceService {


  private socket!: WebSocket;
  private messageSubject: Subject<string> = new Subject<string>();

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket('ws://localhost:8080/chat');


    this.socket.onopen = () => console.log('WebSocket connected ✅');
    this.socket.onclose = () => console.log('WebSocket disconnected ❌');


    this.socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      this.messageSubject.next(response.message);
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected. Reconnecting...");
      setTimeout(() => this.connect(), 3000);
    };
  }

  sendMessage(message: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not open. Unable to send message.");
      return;
    }
  
    const msg = JSON.stringify({ message });
    console.log("Sending message to backend:", msg);
    this.socket.send(msg);
  }

  getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }}
