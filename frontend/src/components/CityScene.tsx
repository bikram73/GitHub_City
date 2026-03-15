import React, { useMemo, useRef } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Building from './Building';
import { Repo } from '../pages/CityView';

interface CitySceneProps {
  repos: Repo[];
  onSelectRepo: (repo: Repo) => void;
  onOpenRepo: (repo: Repo) => void;
  theme: 'day' | 'night';
}

const CityScene: React.FC<CitySceneProps> = ({ repos, onSelectRepo, onOpenRepo, theme }) => {
  const visibleRepos = repos;
  const grid_size = Math.ceil(Math.sqrt(Math.max(1, visibleRepos.length)));
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
    () => Array.from({ length: 5 }).map((_, index) => ({
      x: -groundSize * 0.08 + index * (groundSize * 0.1),
      z: groundSize * 0.24 + (index % 2) * 5,
      s: 1 + (index % 3) * 0.09,
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

  const boatPositions = useMemo(
    () => [
      { x: -groundSize * 0.34, z: -groundSize * 0.42, s: 1.05, r: 0.22 },
      { x: groundSize * 0.11, z: -groundSize * 0.45, s: 1.28, r: -0.17 },
      { x: groundSize * 0.18, z: -groundSize * 0.41, s: 0.85, r: 0.1 },
    ],
    [groundSize],
  );

  const beachProps = useMemo(
    () => Array.from({ length: 16 }).map((_, index) => ({
      x: -groundSize * 0.29 + index * (groundSize * 0.036),
      z: -groundSize * 0.31 + (index % 3) * 0.9,
      hue: index % 4,
    })),
    [groundSize],
  );

  const skylineColumns = Math.max(18, Math.ceil(grid_size * 2.1));
  const skylineRows = Math.max(2, Math.ceil(visibleRepos.length / skylineColumns));
  const celestialRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!celestialRef.current) {
      return;
    }

    const t = state.clock.elapsedTime * 0.16;
    const radius = groundSize * 0.33;
    celestialRef.current.position.x = Math.cos(t) * radius;
    celestialRef.current.position.y = (theme === 'day' ? 62 : 56) + Math.sin(t) * (theme === 'day' ? 8 : 6);
    celestialRef.current.position.z = -groundSize * 0.28 + Math.sin(t * 0.55) * 7;
    celestialRef.current.rotation.y += 0.003;
  });

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, 130, 310]} />
      <ambientLight intensity={theme === 'night' ? 0.52 : 0.92} />
      <directionalLight position={[110, 130, 35]} intensity={theme === 'night' ? 0.92 : 1.6} castShadow />
      <pointLight position={[70, 90, 80]} intensity={theme === 'night' ? 1.25 : 0.62} color={theme === 'night' ? '#7dd3fc' : '#ffffff'} />
      <pointLight position={[-90, 60, -80]} intensity={theme === 'night' ? 0.72 : 0.25} color={theme === 'night' ? '#67e8f9' : '#fff4ce'} />

      <group ref={celestialRef}>
        {theme === 'day' ? (
          <>
            <pointLight intensity={1.6} color="#ffd37a" distance={320} />
            <mesh>
              <sphereGeometry args={[5.1, 24, 24]} />
              <meshStandardMaterial color="#ffd15e" emissive="#ffb938" emissiveIntensity={0.55} />
            </mesh>
            <mesh rotation={[Math.PI / 2.8, 0, 0]}>
              <torusGeometry args={[7.4, 0.3, 12, 42]} />
              <meshStandardMaterial color="#ffd68d" emissive="#ffbf55" emissiveIntensity={0.42} transparent opacity={0.86} />
            </mesh>
          </>
        ) : (
          <>
            <pointLight intensity={0.9} color="#c8ddff" distance={280} />
            <mesh>
              <sphereGeometry args={[4.4, 20, 20]} />
              <meshStandardMaterial color="#dfeaff" emissive="#8eb8ff" emissiveIntensity={0.26} />
            </mesh>
            <mesh position={[1.1, 0.8, 3.2]}>
              <sphereGeometry args={[0.66, 10, 10]} />
              <meshStandardMaterial color="#cfdcff" />
            </mesh>
            <mesh position={[-1.4, -0.9, 2.7]}>
              <sphereGeometry args={[0.44, 10, 10]} />
              <meshStandardMaterial color="#c2d4fa" />
            </mesh>
          </>
        )}
      </group>
      
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

        <mesh position={[0, 0.07, -groundSize * 0.29]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[groundSize * 0.62, groundSize * 0.05]} />
          <meshStandardMaterial color={theme === 'night' ? '#ddd6bc' : '#f0e4b9'} />
        </mesh>
      </group>

      <group>
        {boatPositions.map((boat, index) => (
          <group key={`boat-${index}`} position={[boat.x, 0.22, boat.z]} scale={boat.s} rotation={[0, boat.r, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.3, 0.26, 0.9]} />
              <meshStandardMaterial color={theme === 'night' ? '#47566b' : '#6f7d8d'} />
            </mesh>
            <mesh position={[0.2, 0.24, 0]}>
              <boxGeometry args={[1.2, 0.18, 0.62]} />
              <meshStandardMaterial color={theme === 'night' ? '#8da3ba' : '#c7d6e7'} />
            </mesh>
            <mesh position={[0.78, 0.28, 0]}>
              <boxGeometry args={[0.34, 0.1, 0.25]} />
              <meshStandardMaterial color={index % 2 === 0 ? '#f7d04f' : '#f97373'} />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[0, 0.08, -groundSize * 0.1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[groundSize * 0.72, groundSize * 0.28]} />
          <meshStandardMaterial color={cityBaseColor} transparent opacity={theme === 'night' ? 0.82 : 0.72} />
        </mesh>
      </group>

      {Array.from({ length: skylineColumns + 1 }).map((_, index) => {
        const offset = (index - skylineColumns / 2) * spacing;
        return (
          <React.Fragment key={`road-${index}`}>
            <mesh position={[offset * 0.64, 0.2, -groundSize * 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.95, groundSize * 0.32]} />
              <meshStandardMaterial color={roadColor} emissive={roadColor} emissiveIntensity={theme === 'night' ? 0.16 : 0.03} transparent opacity={theme === 'night' ? 0.76 : 0.5} />
            </mesh>
            <mesh position={[0, 0.2, offset * 0.42 - groundSize * 0.1]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[1.95, groundSize * 0.74]} />
              <meshStandardMaterial color={roadColor} emissive={roadColor} emissiveIntensity={theme === 'night' ? 0.16 : 0.03} transparent opacity={theme === 'night' ? 0.76 : 0.5} />
            </mesh>
          </React.Fragment>
        );
      })}

      <group>
        {visibleRepos.map((repo, index) => {
          const col = index % skylineColumns;
          const row = Math.floor(index / skylineColumns);
          const rankBias = 1 - index / Math.max(1, visibleRepos.length);
          const normalizedCol = skylineColumns > 1 ? col / (skylineColumns - 1) : 0.5;
          const rightHeavy = Math.pow(normalizedCol, 1.85);
          const x = (rightHeavy - 0.5) * groundSize * 0.86 + rankBias * groundSize * 0.06;
          const zJitter = Math.sin(index * 1.37) * 0.65;
          const z = -groundSize * 0.16 + row * 4.4 - skylineRows * 0.95 + zJitter;
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
        {Array.from({ length: 14 }).map((_, index) => {
          const x = -groundSize * 0.28 + index * (groundSize * 0.042);
          const z = -groundSize * 0.297 + (index % 2) * 1.5;
          const trunk = theme === 'night' ? '#6f5f44' : '#866548';
          const leaf = theme === 'night' ? '#4b8d6d' : '#57a97d';
          return (
            <group key={`palm-${index}`} position={[x, 0.16, z]}>
              <mesh position={[0, 1.25, 0]} rotation={[0, 0, (index % 3 - 1) * 0.08]}>
                <cylinderGeometry args={[0.08, 0.12, 2.4, 6]} />
                <meshStandardMaterial color={trunk} />
              </mesh>
              {[0, 1, 2, 3].map((leafIndex) => (
                <mesh
                  key={`palm-leaf-${leafIndex}`}
                  position={[0, 2.3, 0]}
                  rotation={[0.08, (leafIndex * Math.PI) / 2, 0.22]}
                >
                  <coneGeometry args={[0.16, 1.2, 5]} />
                  <meshStandardMaterial color={leaf} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>

      <group>
        {beachProps.map((item, index) => {
          const umbrellaColors = ['#e85d75', '#7c83fd', '#f5b742', '#66bb6a'];
          const loungerColors = ['#d4f1f9', '#ffd166', '#f28482', '#cdb4db'];
          return (
            <group key={`beach-item-${index}`} position={[item.x, 0.12, item.z]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.9, 0.06, 0.28]} />
                <meshStandardMaterial color={loungerColors[item.hue]} />
              </mesh>
              {index % 3 === 0 ? (
                <>
                  <mesh position={[0.55, 0.33, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.66, 8]} />
                    <meshStandardMaterial color={theme === 'night' ? '#aeb7c5' : '#fafafa'} />
                  </mesh>
                  <mesh position={[0.55, 0.66, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.36, 0.3, 10]} />
                    <meshStandardMaterial color={umbrellaColors[item.hue]} />
                  </mesh>
                </>
              ) : null}
            </group>
          );
        })}
      </group>

      <group>
        {turbinePositions.map((turbine, index) => (
          <group key={`turbine-${index}`} position={[turbine.x, 0.22, turbine.z]} scale={turbine.s * 1.05}>
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
        <mesh position={[groundSize * 0.37, 3.6, groundSize * 0.23]}>
          <coneGeometry args={[groundSize * 0.12, 12.8, 8]} />
          <meshStandardMaterial color={theme === 'night' ? '#7e8387' : '#9da5a8'} />
        </mesh>
        <mesh position={[groundSize * 0.37, 8.1, groundSize * 0.23]}>
          <coneGeometry args={[groundSize * 0.05, 4.2, 8]} />
          <meshStandardMaterial color={theme === 'night' ? '#c7d1da' : '#f4f7fa'} />
        </mesh>
        <mesh position={[groundSize * 0.24, 2.4, groundSize * 0.24]}>
          <coneGeometry args={[groundSize * 0.08, 8.8, 8]} />
          <meshStandardMaterial color={theme === 'night' ? '#8d908f' : '#b4b4aa'} />
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

      <OrbitControls
        enableZoom
        enablePan
        enableRotate
        autoRotate
        autoRotateSpeed={-0.7}
        enableDamping
        dampingFactor={0.06}
        minDistance={50}
        maxDistance={220}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
};

export default CityScene;

