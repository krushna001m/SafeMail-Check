import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield } from 'lucide-react';

interface ThreeShield3DProps {
  isScanning?: boolean;
  className?: string;
  verdict?: 'MALICIOUS' | 'SUSPICIOUS' | 'SAFE' | 'CLEAN';
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

export const ThreeShield3D: React.FC<ThreeShield3DProps> = ({
  isScanning = false,
  className = '',
  verdict = 'MALICIOUS',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebGlSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 180;
    let height = container.clientHeight || 180;

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.warn('WebGL init failed, using CSS/SVG fallback', e);
      setWebGlSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Accent color based on state/verdict
    let themeColorHex = 0x00daf3;
    if (verdict === 'MALICIOUS') {
      themeColorHex = isScanning ? 0x00e5ff : 0x00daf3;
    } else if (verdict === 'SAFE' || verdict === 'CLEAN') {
      themeColorHex = 0x00e676;
    } else if (verdict === 'SUSPICIOUS') {
      themeColorHex = 0xffc107;
    }

    const primaryColor = new THREE.Color(themeColorHex);

    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // Hexagonal Shield
    const shieldShape = new THREE.Shape();
    const size = isMobile ? 1.25 : 1.45;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) shieldShape.moveTo(x, y);
      else shieldShape.lineTo(x, y);
    }
    shieldShape.closePath();

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };
    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    const shieldMaterial = new THREE.MeshPhongMaterial({
      color: 0x111318,
      emissive: primaryColor,
      emissiveIntensity: isScanning ? 0.4 : 0.22,
      shininess: 90,
      transparent: true,
      opacity: 0.9,
    });
    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldGroup.add(shieldMesh);

    // Wireframe edges
    const wireframeGeometry = new THREE.EdgesGeometry(shieldGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.65,
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    shieldGroup.add(wireframe);

    // Dual Orbit Rings
    const ringRadius = isMobile ? 1.6 : 1.9;
    const ringGeom = new THREE.TorusGeometry(ringRadius, 0.02, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    const ring2 = new THREE.Mesh(ringGeom, ringMat);
    ring2.rotation.x = Math.PI / 2;
    shieldGroup.add(ring1, ring2);

    // Particle Cloud (scaled count for mobile/tablet efficiency)
    const particlesCount = isMobile ? 40 : isTablet ? 70 : 100;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * (isMobile ? 5 : 7);
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.04 : 0.05,
      color: primaryColor,
      transparent: true,
      opacity: 0.75,
    });
    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(primaryColor, 2.2, 15);
    pointLight.position.set(4, 4, 5);
    scene.add(pointLight);

    camera.position.z = isMobile ? 4.2 : 4.8;

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const speedMult = isScanning ? 2.2 : 1.0;

      shieldGroup.position.y = Math.sin(elapsedTime * 0.6) * 0.15;
      shieldGroup.rotation.y = elapsedTime * 0.25 * speedMult;
      shieldGroup.rotation.x = Math.cos(elapsedTime * 0.3) * 0.1;

      ring1.rotation.z += 0.012 * speedMult;
      ring2.rotation.z -= 0.012 * speedMult;
      ring1.scale.setScalar(1 + Math.sin(elapsedTime * 2 * speedMult) * 0.06);

      particleMesh.rotation.y = elapsedTime * 0.06 * speedMult;
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(elapsedTime + positions[i3]) * 0.002;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width || width;
        const newH = entry.contentRect.height || height;
        if (newW > 0 && newH > 0) {
          renderer.setSize(newW, newH);
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      shieldGeometry.dispose();
      shieldMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isScanning, verdict]);

  if (!webGlSupported) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
        <div className={`w-28 h-28 rounded-full flex items-center justify-center border-2 border-dashed ${
          verdict === 'MALICIOUS' ? 'border-[#FF3D00] text-[#FF3D00] bg-[#FF3D00]/10' :
          verdict === 'SUSPICIOUS' ? 'border-[#FFC107] text-[#FFC107] bg-[#FFC107]/10' :
          'border-[#00E676] text-[#00E676] bg-[#00E676]/10'
        } ${isScanning ? 'animate-pulse' : ''}`}>
          <Shield className="w-14 h-14 animate-spin-slow" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center overflow-hidden pointer-events-none ${className}`}
      style={{ minHeight: '140px' }}
    />
  );
};
