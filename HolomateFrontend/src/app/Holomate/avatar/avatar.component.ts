import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit, OnDestroy, OnChanges{

  @ViewChild('avatarCanvas', { static: true }) canvasRef!: ElementRef;
  @Input() aiResponse!: string; 


  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private avatarMesh!: THREE.Mesh;
  isSpeaking: boolean = false;


  constructor() {}

  ngOnInit(): void {
    this.isSpeaking = false;
    this.initScene();
    this.loadAvatarModel();
  }

  ngOnDestroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aiResponse'] && changes['aiResponse'].currentValue) {
      this.speak(this.aiResponse);
    }
  }
  
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 3);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 2, 3);
    this.scene.add(directionalLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    this.scene.add(hemisphereLight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    directionalLight.castShadow = true;
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  loadAvatarModel() {
    const loader = new GLTFLoader();
    loader.load(
      "https://models.readyplayer.me/67a83719811f205d7183464b.glb",
      (gltf: { scene: any }) => {
        const model = gltf.scene;
        model.position.y = 0.2;
        this.scene.add(model);

        this.setupAvatar(model);
        this.animate();
      }
    );
  }

  setupAvatar(model: THREE.Object3D): void {
    const avatarMesh = model.getObjectByName('Wolf3D_Head') as THREE.Mesh;
    if (!avatarMesh) {
      console.error('Avatar mesh not found');
      return;
    }

    this.avatarMesh = avatarMesh;

    if (
      !avatarMesh.morphTargetDictionary ||
      !avatarMesh.morphTargetInfluences
    ) {
      console.error(' No morph targets found!');
      return;
    }

    const mouthOpenIndex = avatarMesh.morphTargetDictionary['mouthOpen'];
    const mouthSmileIndex = avatarMesh.morphTargetDictionary['mouthSmile'];

    if (mouthOpenIndex === undefined || mouthSmileIndex === undefined) {
      console.error(
        ' Mouth Open or Mouth Smile morph target not found in dictionary!'
      );
      return;
    }
    avatarMesh.morphTargetInfluences[mouthOpenIndex] = 0;
    avatarMesh.morphTargetInfluences[mouthSmileIndex] = 1;

    const geometry = avatarMesh.geometry as THREE.BufferGeometry;
    if (geometry.attributes['position']) {
      geometry.attributes['position'].needsUpdate = true;

    } else {
      console.error(' Geometry position attribute not found!');
    }

    avatarMesh.updateMorphTargets();
    avatarMesh.updateMatrix();
    avatarMesh.updateMatrixWorld(true);

    if (Array.isArray(avatarMesh.material)) {
      avatarMesh.material.forEach((mat: { needsUpdate: boolean; }) => (mat.needsUpdate = true));
    } else {
      avatarMesh.material.needsUpdate = true;
    }
  }

  getMorphTargetIndexByName(geometry: any, name: string): number {
    if (geometry.morphAttributes && geometry.morphAttributes['position']) {

      for (let i = 0; i < geometry.morphAttributes['position'].length; i++) {
        const target = geometry.morphAttributes['position'][i];

        if (target.name === name) {
          return i;
        }
      }
    }
    return -1;
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    if (this.avatarMesh && this.avatarMesh.morphTargetInfluences) {
      this.avatarMesh.morphTargetInfluences[1] = 1.0;
    }

    this.renderer.render(this.scene, this.camera);
  }

  animateMouthWhileSpeaking(): void {
    const animateMouth = () => {
      if (!this.avatarMesh || !this.avatarMesh.morphTargetInfluences) return;

      this.avatarMesh.morphTargetInfluences[0] = Math.min(
        Math.max(this.avatarMesh.morphTargetInfluences[0], 0),
        1
      );
      this.avatarMesh.morphTargetInfluences[1] = Math.min(
        Math.max(this.avatarMesh.morphTargetInfluences[1], 0),
        1
      );

      if (this.isSpeaking) {
        const mouthOpenSpeed = 0.04;
        const smileSpeed = 0.02;

        this.avatarMesh.morphTargetInfluences[0] =
          0.5 + Math.sin(Date.now() * 0.005) * 0.5;
        this.avatarMesh.morphTargetInfluences[1] =
          Math.abs(Math.sin(Date.now() * 0.003)) * 0.3;

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(animateMouth);
      }
    };

    animateMouth();
  }


  speak(text: string) {
    if (!window.speechSynthesis) {
      console.error(" Speech synthesis is NOT supported in this browser.");
      return;
    }
  
    window.speechSynthesis.cancel();
  
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]; 
  
    let index = 0;
    this.isSpeaking = true;  
    this.animateMouthWhileSpeaking(); 

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
            this.stopMouthAnimation(); 
          }
        };
  
        window.speechSynthesis.speak(utterance);
      } else {
        this.isSpeaking = false;  
        this.stopMouthAnimation(); 
      }
    };
  
    speakNextSentence();
  }


  updateMouthAnimation(charIndex: number, phoneme: string): void {
    if (!this.avatarMesh || !this.avatarMesh.morphTargetInfluences) return;
    if (phoneme === 'start') {
      this.avatarMesh.morphTargetInfluences[0] = 0.5;
    } else if (phoneme === 'end') {
      this.avatarMesh.morphTargetInfluences[0] = 0.2;
    }
  }

  stopMouthAnimation(): void {
    const closeMouth = () => {
      if (this.avatarMesh && this.avatarMesh.morphTargetInfluences) {
        if (this.avatarMesh.morphTargetInfluences[0] > 0) {
          this.avatarMesh.morphTargetInfluences[0] -= 0.01;
        } else {
          this.avatarMesh.morphTargetInfluences[0] = 0;
        }

        if (this.avatarMesh.morphTargetInfluences[1] > 0) {
          this.avatarMesh.morphTargetInfluences[1] -= 0.01;
        } else {
          this.avatarMesh.morphTargetInfluences[1] = 0;
        }

        this.renderer.render(this.scene, this.camera);
      }

      if (
        this.isSpeaking &&
        this.avatarMesh &&
        this.avatarMesh.morphTargetInfluences
      ) {
        requestAnimationFrame(closeMouth);
      }
    };

    closeMouth();
  }
}
