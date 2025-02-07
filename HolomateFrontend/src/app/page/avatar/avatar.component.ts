import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css'
})
export class AvatarComponent {

  @ViewChild('avatarCanvas', { static: true }) canvasRef!: ElementRef;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  avatarModel!: THREE.Object3D;
  chatResponse: string = "Hello! How can I assist you?";


  mouth!: THREE.Object3D; 
  isSpeaking: boolean = false; 

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.initScene();
    this.loadAvatarModel();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.5, 3);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 3);
    this.scene.add(directionalLight);
  }

  loadAvatarModel() {
    const loader = new GLTFLoader();
    loader.load('https://models.readyplayer.me/67a215665c836d19da4a5e52.glb', (gltf: { scene: any; }) => {
      this.avatarModel = gltf.scene;
      this.scene.add(this.avatarModel);

 
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
 
    this.renderer.render(this.scene, this.camera);
  }



  speak(text: string) {
    const speech = new SpeechSynthesisUtterance(text);

    speech.onstart = () => {
      if (this.avatarModel) this.avatarModel.scale.set(1.05, 1.05, 1.05); 
    };

    speech.onend = () => {
      if (this.avatarModel) this.avatarModel.scale.set(1, 1, 1);  
    };

    speechSynthesis.speak(speech);
  }


 
 


}
