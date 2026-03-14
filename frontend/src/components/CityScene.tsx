import React from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import Building from './Building';
import { Repo } from '../pages/CityView';

interface CitySceneProps {
  repos: Repo[];
  onSelectRepo: (repo: Repo) => void;
  theme: 'day' | 'night';
}

const CityScene: React.FC<CitySceneProps> = ({ repos, onSelectRepo, theme }) => {
  const grid_size = Math.ceil(Math.sqrt(repos.length));
  const spacing = 20;
  const groundSize = Math.max(160, grid_size * spacing);
  const roadColor = theme === 'night' ? '#53b8c7' : '#88a8b8';
  const groundColor = theme === 'night' ? '#07111d' : '#dceefe';
  const skyColor = theme === 'night' ? '#020617' : '#d7f0ff';
  const fogColor = theme === 'night' ? '#081220' : '#dceefe';

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, 120, 280]} />
      <ambientLight intensity={theme === 'night' ? 0.55 : 0.85} />
      <directionalLight position={[80, 120, 40]} intensity={theme === 'night' ? 1 : 1.4} castShadow />
      <pointLight position={[100, 120, 100]} intensity={theme === 'night' ? 1.6 : 0.8} color={theme === 'night' ? '#7dd3fc' : '#ffffff'} />
      <pointLight position={[-80, 60, -80]} intensity={theme === 'night' ? 0.8 : 0.3} color={theme === 'night' ? '#67e8f9' : '#fef3c7'} />
      
      {theme === 'night' ? <Stars radius={180} depth={80} count={5000} factor={4} saturation={0} fade /> : null}

      {Array.from({ length: grid_size + 1 }).map((_, index) => {
        const offset = (index - grid_size / 2) * spacing;
        return (
          <React.Fragment key={`road-${index}`}>
            <mesh position={[offset, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3, groundSize]} />
              <meshStandardMaterial color={roadColor} emissive={roadColor} emissiveIntensity={theme === 'night' ? 0.18 : 0.04} transparent opacity={theme === 'night' ? 0.7 : 0.5} />
            </mesh>
            <mesh position={[0, 0.02, offset]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[3, groundSize]} />
              <meshStandardMaterial color={roadColor} emissive={roadColor} emissiveIntensity={theme === 'night' ? 0.18 : 0.04} transparent opacity={theme === 'night' ? 0.7 : 0.5} />
            </mesh>
          </React.Fragment>
        );
      })}

      <group>
        {repos.map((repo, index) => {
          const x = (index % grid_size - grid_size / 2) * spacing;
          const z = (Math.floor(index / grid_size) - grid_size / 2) * spacing;
          return (
            <Building
              key={repo.id}
              repo={repo}
              position={[x, 0, z]}
              index={index}
              theme={theme}
              onSelect={() => onSelectRepo(repo)}
            />
          );
        })}
      </group>

      <OrbitControls enableZoom enablePan enableRotate minDistance={50} maxDistance={220} maxPolarAngle={Math.PI / 2.1} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color={groundColor} emissive={theme === 'night' ? '#10253f' : '#f1f7fb'} emissiveIntensity={theme === 'night' ? 0.22 : 0.03} />
      </mesh>
    </>
  );
};

export default CityScene;

