import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Visor3D({ formato, modelBlob }) {
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f4f4f9');
    sceneRef.current = scene;

    // Configuración de la cámara
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 7);
    cameraRef.current = camera;

    // Configuración del renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;
    controls.minDistance = 0.5;
    controls.maxDistance = 30;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Ejes en el origen mundial (para referencia)
    const axesOrigin = new THREE.AxesHelper(0.5);
    axesOrigin.name = 'axesOrigin';
    scene.add(axesOrigin);

    // Crear una cuadrícula de referencia
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xCCCCCC);
    gridHelper.position.y = -0.001; // Ligera compensación para evitar z-fighting
    scene.add(gridHelper);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Manejo de redimensionamiento de ventana
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) container.removeChild(renderer.domElement);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      modelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!modelBlob || !formato || !sceneRef.current) return;

    const scene = sceneRef.current;

    // Limpiar modelo anterior y helpers
    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current.traverse?.((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      modelRef.current = null;
    }
    
    // Limpiar helpers de pivote anteriores
    scene.children
      .filter(obj => obj.name === 'pivotAxes')
      .forEach(obj => scene.remove(obj));

    const url = URL.createObjectURL(modelBlob);

    const loadModel = (url, ext) => {
      return new Promise((resolve, reject) => {
        ext = ext.toLowerCase();
        switch (ext) {
          case '.glb':
          case '.gltf': {
            const loader = new GLTFLoader();
            loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
            break;
          }
          case '.obj': {
            const loader = new OBJLoader();
            loader.load(url, resolve, undefined, reject);
            break;
          }
          case '.fbx': {
            const loader = new FBXLoader();
            loader.load(url, resolve, undefined, reject);
            break;
          }
          case '.stl': {
            const loader = new STLLoader();
            loader.load(
              url,
              (geometry) => {
                // Centrar la geometría
                geometry.computeBoundingBox();
                const center = new THREE.Vector3();
                geometry.boundingBox.getCenter(center);
                geometry.translate(-center.x, -center.y, -center.z);
                
                const material = new THREE.MeshStandardMaterial({ 
                  color: 0x808080,
                  roughness: 0.7,
                  metalness: 0.2
                });
                const mesh = new THREE.Mesh(geometry, material);
                resolve(mesh);
              },
              undefined,
              reject
            );
            break;
          }
          case '.dae': {
            const loader = new ColladaLoader();
            loader.load(url, (collada) => resolve(collada.scene), undefined, reject);
            break;
          }
          case '.3ds': {
            const loader = new TDSLoader();
            loader.load(url, resolve, undefined, reject);
            break;
          }
          default:
            reject(new Error('Formato no soportado: ' + ext));
        }
      });
    };

    loadModel(url, formato)
      .then((originalModel) => {
        // Asegurarse de que la matriz mundial esté actualizada
        originalModel.updateMatrixWorld(true);

        // Crear un grupo para contener el modelo centrado
        const group = new THREE.Group();
        group.name = 'modelContainer';
        
        // Calcular el bounding box del modelo original
        const originalBox = new THREE.Box3().setFromObject(originalModel);
        const originalSize = originalBox.getSize(new THREE.Vector3());
        const originalCenter = originalBox.getCenter(new THREE.Vector3());
        
        // Calcular el factor de escala para normalizar el tamaño
        const maxDim = Math.max(originalSize.x, originalSize.y, originalSize.z);
        const scaleFactor = 2 / maxDim; // Normalizar a un tamaño de 2 unidades
        
        // Crear un nuevo grupo para el modelo
        const modelGroup = new THREE.Group();
        modelGroup.name = 'modelGroup';
        
        // Añadir el modelo al grupo
        modelGroup.add(originalModel);
        
        // Centrar el modelo en su grupo
        originalModel.position.sub(originalCenter);
        
        // Escalar el grupo del modelo
        modelGroup.scale.setScalar(scaleFactor);
        
        // Añadir el grupo del modelo al grupo contenedor
        group.add(modelGroup);
          
        // Crear ejes para mostrar la orientación del pivote
        const pivotAxes = new THREE.AxesHelper(2.0);
        pivotAxes.name = 'pivotAxes';
        pivotAxes.position.set(0, 0, 0); // Asegurar altura 0
        scene.add(pivotAxes);
        
        // Añadir el grupo al escenario
        scene.add(group);
        modelRef.current = group;
        
        // Ajustar la cámara para ver todo el modelo
        const boundingBox = new THREE.Box3().setFromObject(group);
        const size = boundingBox.getSize(new THREE.Vector3());
        const center = boundingBox.getCenter(new THREE.Vector3());
        
        // Calcular la distancia adecuada para la cámara
        const fov = cameraRef.current.fov * (Math.PI / 180);
        const cameraZ = Math.max(size.x, size.y, size.z) / (2 * Math.tan(fov / 2));
        const distance = cameraZ * 1.5;
        
        // Posicionar la cámara a una distancia adecuada
        const direction = new THREE.Vector3(1, 1, 1).normalize();
        cameraRef.current.position.copy(center).add(direction.multiplyScalar(distance));
        
        cameraRef.current.lookAt(center);
        controlsRef.current.update();
        
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Error cargando modelo 3D:', err);
        URL.revokeObjectURL(url);
      });
  }, [modelBlob, formato]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={(e) => {
        const controls = controlsRef.current;
        if (!controls) return;

        const step = 0.05;
        const s = new THREE.Spherical();
        const target = controls.target.clone();
        s.setFromVector3(controls.object.position.clone().sub(target));

        switch (e.key) {
          case 'ArrowUp':
            s.phi = Math.max(0.1, s.phi - step);
            break;
          case 'ArrowDown':
            s.phi = Math.min(Math.PI - 0.1, s.phi + step);
            break;
          case 'ArrowLeft':
            s.theta -= step;
            break;
          case 'ArrowRight':
            s.theta += step;
            break;
          case 'r': // Reset view
            controls.reset();
            return;
          default:
            return;
        }

        const pos = new THREE.Vector3().setFromSpherical(s);
        controls.object.position.copy(pos.add(target));
        controls.update(); 

      }}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        backgroundColor: '#f4f4f9',
        outline: 'none', 
      }}
    />
  );
}