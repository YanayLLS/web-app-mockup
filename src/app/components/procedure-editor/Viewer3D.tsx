import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Validation } from './ProcedureEditor';

export interface ModelHierarchyNode {
  name: string;
  displayName: string;
  isMesh: boolean;
  meshCount: number;
  children: ModelHierarchyNode[];
}

/** Strip trailing digits that GLB exporters append (e.g. "FuelTank81" → "Fuel Tank") */
function cleanName(raw: string): string {
  // Remove trailing digit suffix
  let name = raw.replace(/\d+$/, '');
  // Insert spaces before capital letters (camelCase → words)
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Replace underscores with spaces
  name = name.replace(/_/g, ' ');
  return name.trim() || raw;
}

function buildHierarchy(obj: THREE.Object3D): ModelHierarchyNode | null {
  // Skip unnamed mesh leaves — they'll be counted by their parent
  if ((obj as THREE.Mesh).isMesh && obj.name.startsWith('mesh_')) return null;

  const children: ModelHierarchyNode[] = [];
  let meshCount = 0;

  for (const child of obj.children) {
    if ((child as THREE.Mesh).isMesh) {
      meshCount++;
    } else {
      const node = buildHierarchy(child);
      if (node) {
        meshCount += node.meshCount;
        children.push(node);
      }
    }
  }

  // Skip unnamed wrapper groups, promote their children
  if (!obj.name || obj.name === '') {
    // Return null for truly empty wrappers
    return children.length === 1 ? children[0] : null;
  }

  return {
    name: obj.name,
    displayName: cleanName(obj.name),
    isMesh: (obj as THREE.Mesh).isMesh === true,
    meshCount,
    children,
  };
}

interface Viewer3DProps {
  validation?: Validation;
  editingEnabled?: boolean;
  isSelectingParts?: boolean;
  selectedParts?: string[];
  onPartClick?: (partName: string) => void;
  onPartsLoaded?: (partNames: string[]) => void;
  onHierarchyLoaded?: (hierarchy: ModelHierarchyNode) => void;
  isSettingArrowDirection?: boolean;
  onArrowDirectionChange?: (direction: { x: number; y: number; z: number }) => void;
}

export function Viewer3D({
  validation,
  editingEnabled = true,
  isSelectingParts = false,
  selectedParts = [],
  onPartClick,
  onPartsLoaded,
  onHierarchyLoaded,
  isSettingArrowDirection = false,
  onArrowDirectionChange
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
    camera.position.set(4, 2, 4);
    camera.lookAt(0, 0, 0);

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

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      'https://d2gj0ket8eacj3.cloudfront.net/global/3d+models/Generator.glb',
      (gltf) => {
        const model = gltf.scene;

        // Compute bounding box to center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim; // Fit within ~4 units

        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        scene.add(model);

        // Traverse and register all meshes as interactive parts
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = mesh.name || mesh.parent?.name || `Part-${parts.size}`;
            // Clone original material for restore
            const originalMaterial = (mesh.material as THREE.Material).clone();
            parts.set(mesh, { name, originalMaterial });
          }
        });

        // Notify parent about available parts (flat list)
        if (onPartsLoaded) {
          const partNames = Array.from(parts.values()).map(p => p.name).sort();
          onPartsLoaded(partNames);
        }

        // Notify parent about full hierarchy
        if (onHierarchyLoaded) {
          const hierarchy = buildHierarchy(model);
          if (hierarchy) {
            onHierarchyLoaded(hierarchy);
          }
        }
      },
      undefined,
      (error) => {
        console.error('Error loading GLB model:', error);
      }
    );

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
      previousMousePosition
    };

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
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
        }

        sceneRef.current.scene.rotation.y += deltaX * 0.01;
        sceneRef.current.scene.rotation.x += deltaY * 0.01;

        sceneRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
      } else {
        // Hover detection
        sceneRef.current.raycaster.setFromCamera(sceneRef.current.mouse, sceneRef.current.camera);
        const meshArray = Array.from(sceneRef.current.parts.keys());
        const intersects = sceneRef.current.raycaster.intersectObjects(meshArray);

        if (intersects.length > 0) {
          const hoveredMesh = intersects[0].object as THREE.Mesh;
          const partInfo = sceneRef.current.parts.get(hoveredMesh);
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
      const intersects = sceneRef.current.raycaster.intersectObjects(meshArray);

      console.log('Intersects found:', intersects.length);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const partInfo = sceneRef.current.parts.get(clickedMesh);
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
      
      sceneRef.current.camera.position.multiplyScalar(1 + delta * zoomSpeed);
      
      // Clamp distance
      const distance = sceneRef.current.camera.position.length();
      if (distance < 2) {
        sceneRef.current.camera.position.normalize().multiplyScalar(2);
      } else if (distance > 10) {
        sceneRef.current.camera.position.normalize().multiplyScalar(10);
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
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
      } else if (isSelected) {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x11e874);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x11e874);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
      } else if (isHovered) {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x2f80ed);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x2f80ed);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
      } else {
        const original = partInfo.originalMaterial as THREE.MeshStandardMaterial;
        (mesh.material as THREE.MeshStandardMaterial).color.copy(original.color);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    });
  }, [selectedPart, hoveredPart, isSelectingParts, selectedParts]);

  // Add validation indicators using CSS when in view mode — per-checkpoint, severity-colored
  useEffect(() => {
    if (!sceneRef.current || editingEnabled || !validation) return;

    const checkpoints = validation.checkpoints || [];
    if (checkpoints.length === 0) return;

    // Collect all parts across checkpoints with their severity
    const partSeverityMap = new Map<string, 'critical' | 'warning' | 'info'>();
    const partLabelMap = new Map<string, string>();
    for (const cp of checkpoints) {
      for (const part of cp.selectedParts) {
        // Keep highest severity (critical > warning > info)
        const existing = partSeverityMap.get(part);
        if (!existing || (cp.severity === 'critical') || (cp.severity === 'warning' && existing === 'info')) {
          partSeverityMap.set(part, cp.severity);
          partLabelMap.set(part, cp.label || cp.type);
        }
      }
    }

    if (partSeverityMap.size === 0) return;

    const severityColors: Record<string, { bg: string; border: string }> = {
      critical: { bg: 'rgba(239,68,68,0.3)', border: 'rgba(239,68,68,0.9)' },
      warning: { bg: 'rgba(245,158,11,0.3)', border: 'rgba(245,158,11,0.9)' },
      info: { bg: 'rgba(59,130,246,0.3)', border: 'rgba(59,130,246,0.9)' }
    };

    const indicators: HTMLDivElement[] = [];

    const updateIndicators = () => {
      if (!sceneRef.current || !containerRef.current) return;

      indicators.forEach(indicator => indicator.remove());
      indicators.length = 0;

      sceneRef.current.parts.forEach((partInfo, mesh) => {
        const severity = partSeverityMap.get(partInfo.name);
        if (!severity) return;

        const vector = new THREE.Vector3();
        mesh.getWorldPosition(vector);
        vector.project(sceneRef.current!.camera);

        const rect = containerRef.current!.getBoundingClientRect();
        const x = (vector.x * 0.5 + 0.5) * rect.width;
        const y = (-(vector.y) * 0.5 + 0.5) * rect.height;

        const colors = severityColors[severity];
        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.left = `${x}px`;
        indicator.style.top = `${y}px`;
        indicator.style.transform = 'translate(-50%, -50%)';
        indicator.style.width = '40px';
        indicator.style.height = '40px';
        indicator.style.borderRadius = '50%';
        indicator.style.backgroundColor = colors.bg;
        indicator.style.border = `3px solid ${colors.border}`;
        indicator.style.pointerEvents = 'none';
        indicator.style.zIndex = '100';
        indicator.style.animation = 'pulse 2s ease-in-out infinite';

        containerRef.current!.appendChild(indicator);
        indicators.push(indicator);
      });
    };

    const animate = () => {
      updateIndicators();
      if (!editingEnabled && validation) {
        requestAnimationFrame(animate);
      }
    };
    animate();

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
              
              fontWeight: 'var(--font-weight-normal)',
              margin: 0
            }}
          >
            {hoveredPart}
          </p>
        </div>
      )}

      {/* Validation Indicators - Only shown in view mode */}
      {!editingEnabled && validation && validation.checkpoints && validation.checkpoints.length > 0 && (
        <div
          className="absolute top-4 right-4 rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(0,0,0,0.85)',
            padding: 'var(--spacing-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'var(--elevation-md)',
            maxWidth: '280px'
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: '22px', height: '22px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M9 11l3 3L22 4" />
              </svg>
            </div>
            <p style={{ color: 'white', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
              {validation.checkpoints.length} Checkpoint{validation.checkpoints.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col" style={{ gap: '4px' }}>
            {validation.checkpoints.map((cp) => {
              const sevColor = cp.severity === 'critical' ? '#ef4444' : cp.severity === 'warning' ? '#f59e0b' : '#3b82f6';
              return (
                <div key={cp.id} className="rounded flex items-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 8px', gap: '6px' }}>
                  <span className="rounded-full shrink-0" style={{ width: '6px', height: '6px', backgroundColor: sevColor }} />
                  <span style={{ fontSize: '11px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {cp.label || cp.type}
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {cp.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
