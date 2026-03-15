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

const lowRisePalette = ['#9fb8d3', '#8fb3d1', '#b4c6d8', '#a8bbcc', '#93b1cc'];

const Building: React.FC<BuildingProps> = ({ repo, position, onSelect, onOpenRepo, index, theme }) => {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef<THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>>(null);

  const buildingHeight = Math.max(9.5, Math.log1p(repo.commit_count + 1) * 7.5);
  const buildingWidth = Math.max(4.2, Math.log1p(repo.size + 10) * 1.5);
  
  const emissiveIntensity = Math.min(1.55, 0.18 + repo.stars / 65);
  const edgeColor = theme === 'night' ? '#d3f3ff' : '#4f7da4';
  const towerType = useMemo(() => {
    if (repo.commit_count > 120) {
      return 'skyscraper';
    }
    if (repo.commit_count > 30) {
      return 'office';
    }
    return 'apartment';
  }, [repo.commit_count]);

  const isRoundTower = towerType === 'skyscraper' || (towerType === 'office' && index % 2 === 0);
  const facadeBandCount = Math.max(5, Math.floor(buildingHeight / 3.8));

  const color = useMemo(() => {
    if (repo.archived) {
      return '#6b7280';
    }

    if (towerType === 'skyscraper') {
      return theme === 'night' ? '#6ea0cc' : '#7fb0da';
    }

    if (towerType === 'office') {
      return theme === 'night' ? '#638aac' : '#74a0c2';
    }

    return lowRisePalette[index % lowRisePalette.length];
  }, [index, repo.archived, theme, towerType]);

  const glowColor = hovered ? '#f9f871' : color;

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
        {isRoundTower ? (
          <cylinderGeometry args={[buildingWidth * 0.46, buildingWidth * 0.56, buildingHeight, 18]} />
        ) : (
          <boxGeometry args={[buildingWidth, buildingHeight, buildingWidth]} />
        )}
        <a.meshPhysicalMaterial
          color={springProps.glow}
          emissive={glowColor}
          emissiveIntensity={hovered ? emissiveIntensity + 0.2 : emissiveIntensity}
          metalness={towerType === 'apartment' ? 0.14 : 0.48}
          roughness={towerType === 'apartment' ? 0.58 : 0.33}
          clearcoat={towerType === 'apartment' ? 0.18 : 0.72}
          clearcoatRoughness={0.25}
          transparent
          opacity={theme === 'night' ? 0.96 : 0.93}
          reflectivity={towerType === 'apartment' ? 0.25 : 0.72}
        />
      </mesh>

      {isRoundTower
        ? Array.from({ length: facadeBandCount }).map((_, bandIndex) => {
            const y = -buildingHeight / 2 + (bandIndex + 1) * (buildingHeight / (facadeBandCount + 1));
            return (
              <mesh key={`band-${bandIndex}`} position={[0, buildingHeight / 2 + y, 0]}>
                <torusGeometry args={[buildingWidth * 0.5, 0.05, 8, 24]} />
                <meshStandardMaterial
                  color={theme === 'night' ? '#c9e3ff' : '#9ec7eb'}
                  emissive={theme === 'night' ? '#8ab9e4' : '#7daedb'}
                  emissiveIntensity={theme === 'night' ? 0.2 : 0.05}
                />
              </mesh>
            );
          })
        : null}

      {towerType !== 'apartment' ? (
        <mesh position={[0, buildingHeight + 0.7, 0]}>
          <cylinderGeometry args={[buildingWidth * 0.34, buildingWidth * 0.4, 1, 12]} />
          <meshStandardMaterial color={theme === 'night' ? '#9eb9d2' : '#d6e4ef'} />
        </mesh>
      ) : (
        <>
          <mesh position={[0, buildingHeight + 0.55, 0]}>
            <boxGeometry args={[buildingWidth * 0.72, 0.8, buildingWidth * 0.72]} />
            <meshStandardMaterial color={theme === 'night' ? '#72879b' : '#9cb0c4'} />
          </mesh>
          <mesh position={[0, buildingHeight + 1.25, 0]}>
            <boxGeometry args={[buildingWidth * 0.42, 0.55, buildingWidth * 0.42]} />
            <meshStandardMaterial color={theme === 'night' ? '#5f7488' : '#8ca0b4'} />
          </mesh>
        </>
      )}

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

