import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css'],
})
export class AvatarComponent implements OnInit, OnDestroy {
  @ViewChild('avatarCanvas', { static: true }) canvasRef!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private avatarMesh!: THREE.Mesh;
  isSpeaking: any;

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
      'https://models.readyplayer.me/67a215665c836d19da4a5e52.glb',
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
      avatarMesh.material.forEach((mat) => (mat.needsUpdate = true));
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

  speak(text: string): void {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    this.isSpeaking = true;

    const selectMaleVoice = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) {
        console.warn('No voices available yet, retrying...');
        setTimeout(selectMaleVoice, 100);
        return;
      }
      const preferredMaleVoices = [
        'Google UK English Male',
        'David',
        'Alex',
        'Fred',
      ];

      let maleVoice = voices.find((voice) =>
        preferredMaleVoices.some((name) => voice.name.includes(name))
      );

      if (!maleVoice) {
        maleVoice = voices.find((voice) =>
          voice.name.toLowerCase().includes('male')
        );
      }

      if (!maleVoice) {
        maleVoice = voices.find((voice) => voice.lang.includes('en'));
      }

      if (maleVoice) {
        utterance.voice = maleVoice;
      } else {
        console.warn('⚠️ No male voice found. Using default.');
      }
      synth.speak(utterance);
    };

    if (synth.getVoices().length > 0) {
      selectMaleVoice();
    } else {
      synth.onvoiceschanged = selectMaleVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.animateMouthWhileSpeaking();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.stopMouthAnimation();
      if (this.avatarMesh && this.avatarMesh.morphTargetInfluences) {
        this.avatarMesh.morphTargetInfluences[0] = 0.2;
        this.avatarMesh.morphTargetInfluences[1] = 0;
      }
    };

    utterance.onboundary = (event) => {
      this.updateMouthAnimation(event.charIndex, event.name);
    };
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






// import { HttpClient } from '@angular/common/http';
// import { Component, ElementRef, ViewChild } from '@angular/core';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// @Component({
//   selector: 'app-avatar',
//   templateUrl: './avatar.component.html',
//   styleUrl: './avatar.component.css'
// })
// export class AvatarComponent {

//   @ViewChild('avatarCanvas', { static: true }) canvasRef!: ElementRef;
//   scene!: THREE.Scene;
//   camera!: THREE.PerspectiveCamera;
//   renderer!: THREE.WebGLRenderer;
//   avatarModel!: THREE.Object3D;
//   chatResponse: string = "Hello! How can I assist you?";

//   mouth!: THREE.Object3D;
//   isSpeaking: boolean = false;

//   constructor(private http: HttpClient) {}

//   ngAfterViewInit() {
//     this.initScene();
//     this.loadAvatarModel();
//     this.animate();
//   }

//   initScene() {
//     this.scene = new THREE.Scene();
//     this.scene.background = new THREE.Color(0xeeeeee);

//     this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
//     this.camera.position.set(0, 1.5, 3);

//     this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, antialias: true });
//     this.renderer.setSize(window.innerWidth, window.innerHeight);

//     const light = new THREE.AmbientLight(0xffffff, 1);
//     this.scene.add(light);
//     const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//     directionalLight.position.set(1, 2, 3);
//     this.scene.add(directionalLight);
//   }

//   loadAvatarModel() {
//     const loader = new GLTFLoader();
//     loader.load('https://models.readyplayer.me/67a215665c836d19da4a5e52.glb', (gltf: { scene: any; }) => {
//       this.avatarModel = gltf.scene;
//       this.scene.add(this.avatarModel);

//     });
//   }

//   animate() {
//     requestAnimationFrame(() => this.animate());

//     this.renderer.render(this.scene, this.camera);
//   }

//   speak(text: string) {
//     const speech = new SpeechSynthesisUtterance(text);

//     speech.onstart = () => {
//       if (this.avatarModel) this.avatarModel.scale.set(1.05, 1.05, 1.05);
//     };

//     speech.onend = () => {
//       if (this.avatarModel) this.avatarModel.scale.set(1, 1, 1);
//     };

//     speechSynthesis.speak(speech);
//   }

// }
