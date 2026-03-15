import React, { useMemo } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import Building from './Building';
import { Repo } from '../pages/CityView';

interface CitySceneProps {
  repos: Repo[];
  onSelectRepo: (repo: Repo) => void;
  onOpenRepo: (repo: Repo) => void;
  theme: 'day' | 'night';
}

const CityScene: React.FC<CitySceneProps> = ({ repos, onSelectRepo, onOpenRepo, theme }) => {
  const grid_size = Math.ceil(Math.sqrt(repos.length));
  const spacing = 16;
  const groundSize = Math.max(210, grid_size * spacing + 120);
  const skyColor = theme === 'night' ? '#03102a' : '#8fc5e2';
  const fogColor = theme === 'night' ? '#06132c' : '#9ecfe7';
  const roadColor = theme === 'night' ? '#6784a6' : '#8f9ca8';
  const cityBaseColor = theme === 'night' ? '#2e4f73' : '#91acc6';
  const fieldColor = theme === 'night' ? '#385b4d' : '#93c8a3';
  const topSoilColor = theme === 'night' ? '#d8d7c8' : '#e6ddc8';
  const deepSoilColor = theme === 'night' ? '#74552c' : '#875400';
  const waterColor = theme === 'night' ? '#2a4e74' : '#8bc5ef';

  const treePositions = useMemo(
    () => Array.from({ length: 140 }).map((_, index) => {
      const spread = groundSize * 0.46;
      const x = (Math.sin(index * 12.37) * 0.5 + Math.cos(index * 1.7) * 0.5) * spread;
      const z = (Math.cos(index * 8.11) * 0.5 + Math.sin(index * 2.3) * 0.5) * spread * 0.85 + groundSize * 0.08;
      return { x, z };
    }),
    [groundSize],
  );

  const turbinePositions = useMemo(
    () => Array.from({ length: 6 }).map((_, index) => ({
      x: -groundSize * 0.36 + index * (groundSize * 0.09),
      z: groundSize * 0.24 - (index % 2) * 12,
      s: 0.9 + (index % 3) * 0.12,
    })),
    [groundSize],
  );

  const cloudPositions = useMemo(
    () => [
      [-groundSize * 0.28, 44, -groundSize * 0.18],
      [0, 50, -groundSize * 0.12],
      [groundSize * 0.25, 46, -groundSize * 0.22],
    ] as [number, number, number][],
    [groundSize],
  );

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, 130, 310]} />
      <ambientLight intensity={theme === 'night' ? 0.52 : 0.92} />
      <directionalLight position={[110, 130, 35]} intensity={theme === 'night' ? 0.92 : 1.6} castShadow />
      <pointLight position={[70, 90, 80]} intensity={theme === 'night' ? 1.25 : 0.62} color={theme === 'night' ? '#7dd3fc' : '#ffffff'} />
      <pointLight position={[-90, 60, -80]} intensity={theme === 'night' ? 0.72 : 0.25} color={theme === 'night' ? '#67e8f9' : '#fff4ce'} />
      
      {theme === 'night' ? <Stars radius={180} depth={80} count={5000} factor={4} saturation={0} fade /> : null}

      <group position={[0, -0.35, 0]}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[groundSize, groundSize]} />
          <meshStandardMaterial color={fieldColor} />
        </mesh>

        <mesh position={[0, -1.3, 0]}>
          <boxGeometry args={[groundSize, 2.1, groundSize]} />
          <meshStandardMaterial color={topSoilColor} />
        </mesh>

        <mesh position={[0, -2.45, 0]}>
          <boxGeometry args={[groundSize + 6, 0.28, groundSize + 6]} />
          <meshStandardMaterial color={deepSoilColor} />
        </mesh>

        <mesh position={[0, 0.05, -groundSize * 0.37]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[groundSize * 0.66, groundSize * 0.16]} />
          <meshStandardMaterial color={waterColor} transparent opacity={theme === 'night' ? 0.65 : 0.82} />
        </mesh>
      </group>

      <group position={[0, 0.08, -groundSize * 0.1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[groundSize * 0.72, groundSize * 0.28]} />
          <meshStandardMaterial color={cityBaseColor} transparent opacity={theme === 'night' ? 0.82 : 0.72} />
        </mesh>
      </group>

      {Array.from({ length: grid_size + 1 }).map((_, index) => {
        const offset = (index - grid_size / 2) * spacing;
        return (
          <React.Fragment key={`road-${index}`}>
            <mesh position={[offset, 0.2, -groundSize * 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.4, groundSize * 0.28]} />
              <meshStandardMaterial color={roadColor} emissive={roadColor} emissiveIntensity={theme === 'night' ? 0.16 : 0.03} transparent opacity={theme === 'night' ? 0.76 : 0.5} />
            </mesh>
            <mesh position={[0, 0.2, offset - groundSize * 0.1]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[2.4, groundSize * 0.74]} />
              <meshStandardMaterial color={roadColor} emissive={roadColor} emissiveIntensity={theme === 'night' ? 0.16 : 0.03} transparent opacity={theme === 'night' ? 0.76 : 0.5} />
            </mesh>
          </React.Fragment>
        );
      })}

      <group>
        {repos.map((repo, index) => {
          const x = (index % grid_size - grid_size / 2) * spacing;
          const z = (Math.floor(index / grid_size) - grid_size / 2) * spacing - groundSize * 0.1;
          return (
            <Building
              key={repo.id}
              repo={repo}
              position={[x, 0, z]}
              index={index}
              theme={theme}
              onSelect={() => onSelectRepo(repo)}
              onOpenRepo={() => onOpenRepo(repo)}
            />
          );
        })}
      </group>

      <group>
        {treePositions.map((tree, index) => {
          const trunkColor = theme === 'night' ? '#6c5b3f' : '#7b5a3a';
          const leafColor = theme === 'night' ? '#739f7f' : '#7db389';
          const treeHeight = 0.7 + (index % 5) * 0.14;

          return (
            <group key={`tree-${index}`} position={[tree.x, 0.16, tree.z]}>
              <mesh position={[0, treeHeight * 0.28, 0]}>
                <cylinderGeometry args={[0.08, 0.12, treeHeight, 6]} />
                <meshStandardMaterial color={trunkColor} />
              </mesh>
              <mesh position={[0, treeHeight * 0.72, 0]}>
                <icosahedronGeometry args={[0.34 + (index % 3) * 0.08, 0]} />
                <meshStandardMaterial color={leafColor} />
              </mesh>
            </group>
          );
        })}
      </group>

      <group>
        {turbinePositions.map((turbine, index) => (
          <group key={`turbine-${index}`} position={[turbine.x, 0.22, turbine.z]} scale={turbine.s}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.14, 0.18, 5.1, 8]} />
              <meshStandardMaterial color={theme === 'night' ? '#e0e9f6' : '#dde7f2'} />
            </mesh>
            <mesh position={[0, 5.05, 0]}>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial color={theme === 'night' ? '#d5dfeb' : '#f2f6fb'} />
            </mesh>
            {[0, 1, 2].map((blade) => (
              <mesh key={`blade-${blade}`} position={[0, 5.02, 0]} rotation={[0, (blade * Math.PI * 2) / 3, Math.PI / 2]}>
                <boxGeometry args={[0.1, 2.1, 0.34]} />
                <meshStandardMaterial color={theme === 'night' ? '#dce7f4' : '#f2f8ff'} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <group>
        <mesh position={[groundSize * 0.33, 3.2, groundSize * 0.27]}>
          <coneGeometry args={[groundSize * 0.09, 10.5, 6]} />
          <meshStandardMaterial color={theme === 'night' ? '#8d8f90' : '#a3a39d'} />
        </mesh>
        <mesh position={[groundSize * 0.41, 4.3, groundSize * 0.3]}>
          <coneGeometry args={[groundSize * 0.07, 12.8, 6]} />
          <meshStandardMaterial color={theme === 'night' ? '#9ea0a2' : '#b2b3aa'} />
        </mesh>
      </group>

      <group>
        {cloudPositions.map((position, index) => (
          <group key={`cloud-${index}`} position={position}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1.3, 10, 10]} />
              <meshStandardMaterial color={theme === 'night' ? '#afc0d5' : '#f2f8ff'} transparent opacity={theme === 'night' ? 0.85 : 0.94} />
            </mesh>
            <mesh position={[1.1, 0.2, 0.2]}>
              <sphereGeometry args={[1.05, 10, 10]} />
              <meshStandardMaterial color={theme === 'night' ? '#b9c7d8' : '#f8fbff'} transparent opacity={theme === 'night' ? 0.85 : 0.94} />
            </mesh>
            <mesh position={[-1.05, 0.18, 0]}>
              <sphereGeometry args={[0.95, 10, 10]} />
              <meshStandardMaterial color={theme === 'night' ? '#b6c5d8' : '#eef6ff'} transparent opacity={theme === 'night' ? 0.85 : 0.94} />
            </mesh>
          </group>
        ))}
      </group>

      <OrbitControls enableZoom enablePan enableRotate minDistance={50} maxDistance={220} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
};

export default CityScene;

