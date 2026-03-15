import React, { useMemo, useRef, useState } from 'react';
import { useSpring, a } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Repo } from '../pages/CityView';

interface BuildingProps {
  repo: Repo;
  position: [number, number, number];
  onSelect: () => void;
  onOpenRepo: () => void;
  index: number;
  theme: 'day' | 'night';
}

// Map languages to colors
const languageColors: { [key: string]: string } = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Ruby: '#701516',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  PHP: '#4F5D95',
  'C#': '#178600',
  default: '#6e7a8a', // Default color for other languages
};

const getLanguageColor = (language: string | null) => {
  if (language && languageColors[language]) {
    return languageColors[language];
  }
  return languageColors.default;
};

const Building: React.FC<BuildingProps> = ({ repo, position, onSelect, onOpenRepo, index, theme }) => {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>>(null);

  const buildingHeight = Math.max(10, Math.log1p(repo.commit_count + 1) * 7.6);
  const buildingWidth = Math.max(4.2, Math.log1p(repo.size + 10) * 1.5);
  
  const color = repo.archived ? '#333333' : getLanguageColor(repo.language);
  const emissiveIntensity = Math.min(2.3, 0.25 + repo.stars / 40);
  const glowColor = hovered ? '#f9f871' : color;
  const edgeColor = theme === 'night' ? '#c7f3ff' : '#1a4f6d';
  const towerType = useMemo(() => {
    if (repo.commit_count > 120) {
      return 'skyscraper';
    }
    if (repo.commit_count > 30) {
      return 'office';
    }
    return 'apartment';
  }, [repo.commit_count]);

  const springProps = useSpring({
    from: { widthScale: 1, heightScale: 0.05, hoverLift: 0, glow: color },
    to: {
      widthScale: hovered ? 1.04 : 1,
      heightScale: hovered ? 1.08 : 1,
      hoverLift: hovered ? 2.2 : 0,
      glow: glowColor,
    },
    delay: index * 45,
    config: { tension: 180, friction: 18 },
  });

  const buildingPosition: [number, number, number] = [0, buildingHeight / 2, 0];

  useFrame((state) => {
    if (!pulseRef.current) {
      return;
    }

    const pulseStrength = Math.min(1.8, 0.3 + repo.recent_activity_score / 60);
    const pulse = theme === 'night'
      ? 0.55 + Math.sin(state.clock.elapsedTime * (1 + repo.commit_count / 60) + index) * 0.25 * pulseStrength
      : 0.12 + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.05 * pulseStrength;

    pulseRef.current.material.emissiveIntensity = Math.max(0.08, pulse);
  });

  return (
    <a.group
      position-x={position[0]}
      position-y={springProps.hoverLift}
      position-z={position[2]}
      scale-x={springProps.widthScale}
      scale-y={springProps.heightScale}
      scale-z={springProps.widthScale}
    >
      <mesh
        position={buildingPosition}
        onClick={() => {
          onSelect();
          onOpenRepo();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        {towerType === 'skyscraper' ? (
          <cylinderGeometry args={[buildingWidth * 0.48, buildingWidth * 0.58, buildingHeight, 14]} />
        ) : (
          <boxGeometry args={[buildingWidth, buildingHeight, buildingWidth]} />
        )}
        <a.meshPhysicalMaterial
          color={springProps.glow}
          emissive={glowColor}
          emissiveIntensity={hovered ? emissiveIntensity + 0.35 : emissiveIntensity}
          metalness={towerType === 'skyscraper' ? 0.78 : 0.52}
          roughness={towerType === 'apartment' ? 0.36 : 0.24}
          transparent
          opacity={theme === 'night' ? 0.94 : 0.9}
          reflectivity={0.72}
        />
      </mesh>

      <mesh position={[0, buildingHeight + 1.8, 0]} ref={pulseRef}>
        <cylinderGeometry args={[Math.max(0.3, buildingWidth * 0.08), Math.max(0.45, buildingWidth * 0.12), 1.4, 10]} />
        <meshStandardMaterial color={theme === 'night' ? '#9bf6ff' : '#0b7285'} emissive={theme === 'night' ? '#9bf6ff' : '#0b7285'} emissiveIntensity={0.3} />
      </mesh>

      <lineSegments position={buildingPosition}>
        <edgesGeometry args={[new THREE.BoxGeometry(buildingWidth * 1.01, buildingHeight * 1.01, buildingWidth * 1.01)]} />
        <lineBasicMaterial color={edgeColor} transparent opacity={theme === 'night' ? 0.8 : 0.42} />
      </lineSegments>
    </a.group>
  );
};

export default Building;

