import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, usePlane, useSphere } from "@react-three/cannon";

// Define a set of 5 colors
const colors = [
  "#FF5733", // Red-Orange
  "#33FF57", // Lime Green
  "#3357FF", // Blue
  "#F3FF33", // Yellow
  "#FF33A1", // Pink
];

// Type for the data array elements
type SphereData = {
  color: string;
  scale: number;
};

// Initialize color and data array
const tempColor = new THREE.Color();
const data: SphereData[] = Array.from({ length: 200 }, () => ({
  color: colors[Math.floor(Math.random() * colors.length)],
  scale: 0.25 + Math.random(),
}));

const MPhysicsScene: React.FC = () => (
  <Canvas orthographic camera={{ position: [0, 0, 50], zoom: 50 }}>
    <Physics gravity={[0, -150, 0]}>
      <group position={[0, 0, -10]}>
        <Mouse />
        <Borders />
        <InstancedSpheres />
      </group>
    </Physics>
  </Canvas>
);

const InstancedSpheres: React.FC<{ count?: number }> = ({ count = 100 }) => {
  const { viewport } = useThree();
  const sphereSize = 0.7; // Fixed size for all spheres
  const [ref, api] = useSphere<THREE.InstancedMesh>((index) => ({
    mass: sphereSize * 200, // Adjust mass if needed
    position: [4 - Math.random() * 8, viewport.height * 3, 0],
    args: [sphereSize], // Use fixed size
  }));

  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(count)
          .fill(null)
          .flatMap((_, i) => tempColor.set(data[i].color).toArray())
      ),
    [count]
  );

  useLayoutEffect(() => {
    // Apply the fixed scale to all instances
    for (let i = 0; i < count; i++) {
      api.at(i).scaleOverride([sphereSize, sphereSize, sphereSize]);
    }
  }, [api, count]);

  return (
    <instancedMesh
      ref={ref as React.Ref<THREE.InstancedMesh>}
      args={[undefined, undefined, count]}
    >
      <sphereGeometry args={[sphereSize, 64, 64]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorArray, 3]}
        />
      </sphereGeometry>
      <meshBasicMaterial toneMapped={false} vertexColors />
    </instancedMesh>
  );
};

const Borders: React.FC = () => {
  const { viewport } = useThree();
  return (
    <>
      <Plane
        position={[0, -viewport.height / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <Plane
        position={[-viewport.width / 2 - 1, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Plane
        position={[viewport.width / 2 + 1, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <Plane position={[0, 0, -1]} rotation={[0, 0, 0]} />
      <Plane position={[0, 0, 12]} rotation={[0, -Math.PI, 0]} />
    </>
  );
};

const Plane: React.FC<{
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position = [0, 0, 0], ...props }) => {
  const [, api] = usePlane(() => ({ ...props }));
  useEffect(() => api.position.set(...position), [api, position]);
  return null;
};

const Mouse: React.FC = () => {
  const { viewport } = useThree();
  const [, api] = useSphere(() => ({ type: "Dynamic", args: [7] }));
  useFrame((state) =>
    api.position.set(
      (state.mouse.x * viewport.width) / 1,
      (state.mouse.y * viewport.height) / 1,
      7
    )
  );
  return null;
};

export default MPhysicsScene;
