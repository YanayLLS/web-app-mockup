import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Validation } from './ProcedureEditor';

interface Viewer3DProps {
  validation?: Validation;
  editingEnabled?: boolean;
  isSelectingParts?: boolean;
  selectedParts?: string[];
  onPartClick?: (partName: string) => void;
  onPartsLoaded?: (partNames: string[]) => void;
  isSettingArrowDirection?: boolean;
  onArrowDirectionChange?: (direction: { x: number; y: number; z: number }) => void;
  stepHighlightParts?: string[];
}

export function Viewer3D({
  validation,
  editingEnabled = true,
  isSelectingParts = false,
  selectedParts = [],
  onPartClick,
  onPartsLoaded,
  isSettingArrowDirection = false,
  onArrowDirectionChange,
  stepHighlightParts
}: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  
  // Store latest values in refs so event handlers can access them
  const isSelectingPartsRef = useRef(isSelectingParts);
  const onPartClickRef = useRef(onPartClick);
  
  // Update refs when props change
  useEffect(() => {
    isSelectingPartsRef.current = isSelectingParts;
  }, [isSelectingParts]);
  
  useEffect(() => {
    onPartClickRef.current = onPartClick;
  }, [onPartClick]);
  
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    parts: Map<THREE.Mesh, { name: string; originalMaterial: THREE.Material }>;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    isDragging: boolean;
    hasDragged: boolean;
    previousMousePosition: { x: number; y: number };
    modelCenter: THREE.Vector3;
    modelRadius: number;
    cameraAnimation: {
      startPos: THREE.Vector3;
      endPos: THREE.Vector3;
      startLookAt: THREE.Vector3;
      endLookAt: THREE.Vector3;
      startTime: number;
      duration: number;
    } | null;
    stepHighlightActive: boolean;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0.5, 0);

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(5, 5, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight3.position.set(0, -5, -5);
    scene.add(directionalLight3);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Create Model Parts
    const parts = new Map<THREE.Mesh, { name: string; originalMaterial: THREE.Material }>();

    // Yellow/black color palette for the generator
    const colorPalette = [
      { color: 0xF5C518, metalness: 0.3, roughness: 0.5 },  // Caterpillar yellow
      { color: 0x1A1A1A, metalness: 0.7, roughness: 0.3 },  // Deep black
      { color: 0xE8B400, metalness: 0.4, roughness: 0.4 },  // Dark yellow
      { color: 0x2D2D2D, metalness: 0.8, roughness: 0.2 },  // Charcoal
      { color: 0xFFD63A, metalness: 0.2, roughness: 0.6 },  // Bright yellow
      { color: 0x3A3A3A, metalness: 0.6, roughness: 0.35 }, // Dark gray
      { color: 0xCC9900, metalness: 0.5, roughness: 0.45 }, // Gold
      { color: 0x111111, metalness: 0.9, roughness: 0.15 }, // Near-black
    ];

    // Load FBX model
    const loader = new FBXLoader();
    loader.load('/models/Generator.fbx', (fbx) => {
      // Apply materials first
      let meshIndex = 0;
      fbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const palette = colorPalette[meshIndex % colorPalette.length];
          const mat = new THREE.MeshStandardMaterial({
            color: palette.color,
            metalness: palette.metalness,
            roughness: palette.roughness,
          });
          mesh.material = mat;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const name = mesh.name || `Part-${meshIndex + 1}`;
          parts.set(mesh, { name, originalMaterial: mat.clone() });
          meshIndex++;
        }
      });

      // Compute bounding box, scale, and center
      const box = new THREE.Box3().setFromObject(fbx);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;

      fbx.scale.setScalar(scale);

      // Recompute box after scaling
      const scaledBox = new THREE.Box3().setFromObject(fbx);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());

      // Shift model so its center sits at origin
      fbx.position.x -= scaledCenter.x;
      fbx.position.y -= scaledBox.min.y; // Bottom sits at y=0
      fbx.position.z -= scaledCenter.z;

      scene.add(fbx);

      // Recompute final center after repositioning for camera framing
      const finalBox = new THREE.Box3().setFromObject(fbx);
      const finalCenter = finalBox.getCenter(new THREE.Vector3());
      const radius = finalBox.getSize(new THREE.Vector3()).length() / 2;

      // Store model info for focus function
      if (sceneRef.current) {
        sceneRef.current.modelCenter = finalCenter.clone();
        sceneRef.current.modelRadius = radius;
      }

      // Frame the camera on the model
      const fov = camera.fov * (Math.PI / 180);
      const dist = radius / Math.sin(fov / 2) * 1.1;
      camera.position.set(
        finalCenter.x + dist * 0.5,
        finalCenter.y + dist * 0.4,
        finalCenter.z + dist * 0.7
      );
      camera.lookAt(finalCenter);
      scene.rotation.set(0, 0, 0);

      // Notify parent about available parts
      if (onPartsLoaded) {
        const partNames = Array.from(parts.values()).map(p => p.name).sort();
        onPartsLoaded(partNames);
      }
    });

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let hasDragged = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Store refs
    sceneRef.current = {
      scene,
      camera,
      renderer,
      parts,
      raycaster,
      mouse,
      isDragging,
      hasDragged,
      previousMousePosition,
      modelCenter: new THREE.Vector3(0, 0, 0),
      modelRadius: 3,
      cameraAnimation: null,
      stepHighlightActive: false
    };

    // Ease-in-out cubic
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Camera animation interpolation
      if (sceneRef.current?.cameraAnimation) {
        const anim = sceneRef.current.cameraAnimation;
        const elapsed = performance.now() - anim.startTime;
        const rawT = Math.min(elapsed / anim.duration, 1);
        const t = easeInOutCubic(rawT);

        camera.position.lerpVectors(anim.startPos, anim.endPos, t);
        const lookAt = new THREE.Vector3().lerpVectors(anim.startLookAt, anim.endLookAt, t);
        camera.lookAt(lookAt);

        if (rawT >= 1) {
          sceneRef.current.cameraAnimation = null;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = width / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Event Handlers
    const handleMouseDown = (event: MouseEvent) => {
      if (!sceneRef.current) return;
      sceneRef.current.isDragging = true;
      sceneRef.current.hasDragged = false;
      sceneRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !sceneRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      sceneRef.current.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      sceneRef.current.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Rotation
      if (sceneRef.current.isDragging) {
        const deltaX = event.clientX - sceneRef.current.previousMousePosition.x;
        const deltaY = event.clientY - sceneRef.current.previousMousePosition.y;

        // Mark as dragged if mouse moved more than a small threshold
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          sceneRef.current.hasDragged = true;
          // Cancel camera animation when user drags
          sceneRef.current.cameraAnimation = null;
        }

        sceneRef.current.scene.rotation.y += deltaX * 0.01;
        sceneRef.current.scene.rotation.x += deltaY * 0.01;

        sceneRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
      } else {
        // Hover detection
        sceneRef.current.raycaster.setFromCamera(sceneRef.current.mouse, sceneRef.current.camera);
        const meshArray = Array.from(sceneRef.current.parts.keys());
        const intersects = sceneRef.current.raycaster.intersectObjects(meshArray, true);

        if (intersects.length > 0) {
          const hitObj = intersects[0].object as THREE.Mesh;
          // Walk up parents to find the registered mesh
          let hoveredMesh: THREE.Mesh | null = hitObj;
          let partInfo = sceneRef.current.parts.get(hitObj);
          if (!partInfo) {
            let parent = hitObj.parent;
            while (parent && !partInfo) {
              if ((parent as THREE.Mesh).isMesh) {
                partInfo = sceneRef.current.parts.get(parent as THREE.Mesh);
                hoveredMesh = parent as THREE.Mesh;
              }
              parent = parent.parent;
            }
          }
          if (partInfo) {
            setHoveredPart(partInfo.name);
            containerRef.current.style.cursor = 'pointer';
          }
        } else {
          setHoveredPart(null);
          containerRef.current.style.cursor = 'default';
        }
      }
    };

    const handleMouseUp = () => {
      if (!sceneRef.current) return;
      sceneRef.current.isDragging = false;
    };

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !sceneRef.current) return;

      console.log('Viewer3D click event fired');
      console.log('hasDragged:', sceneRef.current.hasDragged);
      console.log('isSelectingParts (ref):', isSelectingPartsRef.current);

      // Don't process click if user was dragging
      if (sceneRef.current.hasDragged) {
        console.log('Click ignored - user was dragging');
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      sceneRef.current.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      sceneRef.current.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      sceneRef.current.raycaster.setFromCamera(sceneRef.current.mouse, sceneRef.current.camera);
      const meshArray = Array.from(sceneRef.current.parts.keys());
      const intersects = sceneRef.current.raycaster.intersectObjects(meshArray, true);

      console.log('Intersects found:', intersects.length);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object as THREE.Mesh;
        let clickedMesh: THREE.Mesh = hitObj;
        let partInfo = sceneRef.current.parts.get(hitObj);
        if (!partInfo) {
          let parent = hitObj.parent;
          while (parent && !partInfo) {
            if ((parent as THREE.Mesh).isMesh) {
              partInfo = sceneRef.current.parts.get(parent as THREE.Mesh);
              clickedMesh = parent as THREE.Mesh;
            }
            parent = parent.parent;
          }
        }
        console.log('Part info:', partInfo);
        if (partInfo) {
          // If in selection mode, call the onPartClick callback using the ref
          if (isSelectingPartsRef.current && onPartClickRef.current) {
            console.log('Calling onPartClick with:', partInfo.name);
            onPartClickRef.current(partInfo.name);
          } else {
            console.log('Setting selected part:', partInfo.name);
            setSelectedPart(prev => prev === partInfo.name ? null : partInfo.name);
          }
        }
      } else {
        console.log('No intersects found - click missed all parts');
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!sceneRef.current) return;
      event.preventDefault();
      const zoomSpeed = 0.1;
      const delta = event.deltaY > 0 ? 1 : -1;
      const { camera, modelCenter } = sceneRef.current;

      // Zoom toward/away from model center
      const offset = camera.position.clone().sub(modelCenter);
      offset.multiplyScalar(1 + delta * zoomSpeed);

      // Clamp distance
      const distance = offset.length();
      if (distance < 1.5) {
        offset.normalize().multiplyScalar(1.5);
      } else if (distance > 15) {
        offset.normalize().multiplyScalar(15);
      }

      camera.position.copy(modelCenter).add(offset);
      camera.lookAt(modelCenter);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Focus / Frame model hotkey (F)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        // Don't trigger if user is typing in an input
        const tag = (event.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (!sceneRef.current) return;
        const { camera, scene, modelCenter, modelRadius } = sceneRef.current;

        // Reset scene rotation
        scene.rotation.set(0, 0, 0);

        // Frame camera on model
        const fov = camera.fov * (Math.PI / 180);
        const dist = modelRadius / Math.sin(fov / 2) * 1.1;
        camera.position.set(
          modelCenter.x + dist * 0.5,
          modelCenter.y + dist * 0.4,
          modelCenter.z + dist * 0.7
        );
        camera.lookAt(modelCenter);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('wheel', handleWheel);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update materials based on selection/hover
  useEffect(() => {
    if (!sceneRef.current) return;

    sceneRef.current.parts.forEach((partInfo, mesh) => {
      const isSelected = selectedPart === partInfo.name;
      const isHovered = hoveredPart === partInfo.name;
      const isInSelectionList = isSelectingParts && selectedParts.includes(partInfo.name);

      if (isInSelectionList) {
        // Highlight parts in the validation selection list with accent color
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x11e874);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x11e874);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
        (mesh.material as THREE.MeshStandardMaterial).opacity = 1;
        (mesh.material as THREE.MeshStandardMaterial).transparent = false;
      } else if (isSelected) {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x11e874);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x11e874);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
        (mesh.material as THREE.MeshStandardMaterial).opacity = 1;
        (mesh.material as THREE.MeshStandardMaterial).transparent = false;
      } else if (isHovered) {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x2f80ed);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x2f80ed);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
        (mesh.material as THREE.MeshStandardMaterial).opacity = 1;
        (mesh.material as THREE.MeshStandardMaterial).transparent = false;
      } else if (sceneRef.current!.stepHighlightActive) {
        // Step highlighting is active — don't restore to original, let the step effect handle it
      } else {
        const original = partInfo.originalMaterial as THREE.MeshStandardMaterial;
        (mesh.material as THREE.MeshStandardMaterial).color.copy(original.color);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        (mesh.material as THREE.MeshStandardMaterial).opacity = 1;
        (mesh.material as THREE.MeshStandardMaterial).transparent = false;
      }
    });
  }, [selectedPart, hoveredPart, isSelectingParts, selectedParts]);

  // Step highlight effect — amber glow on highlighted parts, dim the rest
  useEffect(() => {
    if (!sceneRef.current) return;

    const hasHighlight = stepHighlightParts && stepHighlightParts.length > 0;
    sceneRef.current.stepHighlightActive = !!hasHighlight;

    sceneRef.current.parts.forEach((partInfo, mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const isHighlighted = hasHighlight && stepHighlightParts!.includes(partInfo.name);

      // Skip parts that have higher-priority highlighting (selection/hover/validation)
      const isSelected = selectedPart === partInfo.name;
      const isHovered = hoveredPart === partInfo.name;
      const isInSelectionList = isSelectingParts && selectedParts.includes(partInfo.name);
      if (isSelected || isHovered || isInSelectionList) return;

      if (hasHighlight) {
        if (isHighlighted) {
          // Amber glow
          mat.color.setHex(0xFFC107);
          mat.emissive.setHex(0xFFA000);
          mat.emissiveIntensity = 0.5;
          mat.opacity = 1;
          mat.transparent = false;
        } else {
          // Dim non-highlighted parts
          const original = partInfo.originalMaterial as THREE.MeshStandardMaterial;
          mat.color.copy(original.color);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = 0.25;
          mat.transparent = true;
        }
      } else {
        // No step highlight — restore originals
        const original = partInfo.originalMaterial as THREE.MeshStandardMaterial;
        mat.color.copy(original.color);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.opacity = 1;
        mat.transparent = false;
      }
    });
  }, [stepHighlightParts, selectedPart, hoveredPart, isSelectingParts, selectedParts]);

  // Camera focus effect — animate camera to frame highlighted parts
  useEffect(() => {
    if (!sceneRef.current) return;
    if (!stepHighlightParts || stepHighlightParts.length === 0) return;

    const { camera, scene, parts } = sceneRef.current;

    // Collect meshes that match highlighted part names
    const highlightedMeshes: THREE.Mesh[] = [];
    parts.forEach((partInfo, mesh) => {
      if (stepHighlightParts.includes(partInfo.name)) {
        highlightedMeshes.push(mesh);
      }
    });

    if (highlightedMeshes.length === 0) return;

    // Compute bounding box of all highlighted meshes
    const box = new THREE.Box3();
    highlightedMeshes.forEach(mesh => {
      const meshBox = new THREE.Box3().setFromObject(mesh);
      box.union(meshBox);
    });

    // Apply scene transform to the bounding box (scene may be rotated)
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = size.length() / 2;

    // Transform center through scene's world matrix
    center.applyMatrix4(scene.matrixWorld);

    // Calculate ideal camera distance
    const fov = camera.fov * (Math.PI / 180);
    const dist = Math.max(radius / Math.sin(fov / 2) * 1.6, 2);

    // Compute target camera position (offset from center)
    const currentDir = camera.position.clone().sub(sceneRef.current.modelCenter).normalize();
    // If direction is zero (camera at center), use a default direction
    if (currentDir.length() < 0.01) {
      currentDir.set(0.5, 0.4, 0.7).normalize();
    }
    const targetPos = center.clone().add(currentDir.multiplyScalar(dist));

    // Current lookAt (approximate from current camera direction)
    const currentLookAt = sceneRef.current.modelCenter.clone();

    // Start camera animation
    sceneRef.current.cameraAnimation = {
      startPos: camera.position.clone(),
      endPos: targetPos,
      startLookAt: currentLookAt,
      endLookAt: center,
      startTime: performance.now(),
      duration: 800
    };
  }, [stepHighlightParts]);

  // Add validation indicators using CSS when in view mode
  useEffect(() => {
    if (!sceneRef.current || editingEnabled || !validation) return;
    
    // Only show indicators for object validation mode with selected parts
    if (validation.mode !== 'object' || !validation.selectedParts || validation.selectedParts.length === 0) {
      return;
    }

    const indicators: HTMLDivElement[] = [];
    
    const updateIndicators = () => {
      if (!sceneRef.current || !containerRef.current) return;

      // Remove old indicators
      indicators.forEach(indicator => indicator.remove());
      indicators.length = 0;

      // Create new indicators for each validation part
      sceneRef.current.parts.forEach((partInfo, mesh) => {
        if (validation.selectedParts.includes(partInfo.name)) {
          // Get 2D position of the 3D object
          const vector = new THREE.Vector3();
          mesh.getWorldPosition(vector);
          vector.project(sceneRef.current!.camera);

          // Convert to screen coordinates
          const rect = containerRef.current!.getBoundingClientRect();
          const x = (vector.x * 0.5 + 0.5) * rect.width;
          const y = (-(vector.y) * 0.5 + 0.5) * rect.height;

          // Create indicator element
          const indicator = document.createElement('div');
          indicator.style.position = 'absolute';
          indicator.style.left = `${x}px`;
          indicator.style.top = `${y}px`;
          indicator.style.transform = 'translate(-50%, -50%)';
          indicator.style.width = '40px';
          indicator.style.height = '40px';
          indicator.style.borderRadius = '50%';
          indicator.style.backgroundColor = 'rgba(17, 232, 116, 0.3)';
          indicator.style.border = '3px solid rgba(17, 232, 116, 0.9)';
          indicator.style.pointerEvents = 'none';
          indicator.style.zIndex = '100';
          indicator.style.animation = 'pulse 2s ease-in-out infinite';

          // Add to container
          containerRef.current!.appendChild(indicator);
          indicators.push(indicator);
        }
      });
    };

    // Update on render
    const animate = () => {
      updateIndicators();
      if (!editingEnabled && validation) {
        requestAnimationFrame(animate);
      }
    };
    animate();

    // Cleanup
    return () => {
      indicators.forEach(indicator => indicator.remove());
    };
  }, [editingEnabled, validation]);

  // Handle arrow direction mode with TransformControls
  useEffect(() => {
    if (!sceneRef.current || !isSettingArrowDirection) return;

    const { scene, camera, renderer } = sceneRef.current;

    // Create arrow positioned above the model
    const arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), // Initial direction (normalized)
      new THREE.Vector3(0, 0, 0), // Origin at center
      2.5, // Length
      0xff0000, // Red color
      0.6, // Head length
      0.4  // Head width
    );
    arrowHelper.name = 'directionArrow';
    arrowHelper.position.set(0, 3, 0); // Position it above the model
    
    // Make arrow always render on top
    arrowHelper.renderOrder = 999;
    arrowHelper.traverse((child) => {
      if ((child as any).isMesh || (child as any).isLine) {
        const material = (child as any).material;
        if (material) {
          material.depthTest = false; // Always visible on top
          material.depthWrite = false;
        }
      }
    });
    
    scene.add(arrowHelper);

    // Create TransformControls
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('rotate'); // Allow rotation to set direction
    transformControls.setSize(1.2); // Make gizmo slightly larger
    transformControls.space = 'local';
    
    // Attach to arrow
    transformControls.attach(arrowHelper);
    
    // Add to scene after configuration
    scene.add(transformControls);

    // Update arrow direction when transform changes
    const handleChange = () => {
      // Get the arrow's forward direction
      const direction = new THREE.Vector3(1, 0, 0);
      direction.applyQuaternion(arrowHelper.quaternion);
      direction.normalize();

      if (onArrowDirectionChange) {
        onArrowDirectionChange({
          x: direction.x,
          y: direction.y,
          z: direction.z
        });
      }
    };

    transformControls.addEventListener('change', handleChange);
    transformControls.addEventListener('dragging-changed', (event: any) => {
      // Disable orbit controls during transform
      if (sceneRef.current) {
        sceneRef.current.isDragging = event.value;
      }
    });

    // Cleanup
    return () => {
      transformControls.removeEventListener('change', handleChange);
      transformControls.detach();
      scene.remove(transformControls);
      scene.remove(arrowHelper);
      transformControls.dispose();
    };
  }, [isSettingArrowDirection, onArrowDirectionChange]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 0.7;
            }
          }
        `}
      </style>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          cursor: isSelectingParts ? 'crosshair' : 'default'
        }}
      />

      {/* Hover Info Tooltip */}
      {hoveredPart && !selectedPart && (
        <div 
          className="absolute top-4 left-4 rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(47, 128, 237, 0.9)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: 'var(--elevation-sm)',
            pointerEvents: 'none'
          }}
        >
          <p 
            style={{
              color: 'white',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-normal)',
              margin: 0
            }}
          >
            {hoveredPart}
          </p>
        </div>
      )}

      {/* Validation Indicators - Only shown in view mode */}
      {!editingEnabled && validation && (
        <div 
          className="absolute top-4 right-4 rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(17, 232, 116, 0.95)',
            padding: 'var(--spacing-md)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: 'var(--elevation-md)',
            maxWidth: '300px'
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
            <div 
              className="rounded-full flex items-center justify-center"
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'white'
              }}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#11e874" 
                strokeWidth="3"
              >
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <p 
              style={{
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)',
                margin: 0
              }}
            >
              Validation Point
            </p>
          </div>
          <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
            <div 
              className="rounded"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: 'var(--spacing-sm)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'white'
              }}
            >
              <div className="flex items-center justify-between">
                <span>{validation.mode === 'object' ? 'Object Validation' : 'Image Validation'}</span>
                <span style={{ 
                  fontSize: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {validation.mode}
                </span>
              </div>
              {validation.selectedParts.length > 0 && (
                <div 
                  style={{ 
                    marginTop: 'var(--spacing-xs)',
                    fontSize: '10px',
                    opacity: 0.9
                  }}
                >
                  {validation.selectedParts.length} part{validation.selectedParts.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
