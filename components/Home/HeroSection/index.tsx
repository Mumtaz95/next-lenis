// src/App.tsx
import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, useGLTF, CubeCamera } from "@react-three/drei";
import { gsap } from "gsap"; // Adjust the import path for gsap if needed
import * as THREE from "three";

const ResponsiveText: React.FC = () => {
  // Handle window resize
  const [size, setSize] = React.useState<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);

  React.useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate scale based on window size
  const scale = Math.min(size[0] / 1000, size[1] / 1000);

  // State to handle rotation
  const [rotation, setRotation] = React.useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const textRef = React.useRef<any>(null);

  // Update rotation based on mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1; // Normalize x
    const y = (event.clientY / window.innerHeight) * 2 - 1; // Normalize y
    // Set rotation based on mouse position with a small multiplier
    setRotation([y * 0.1, x * 0.1, 0]); // Minimal rotation
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate the text on mount
  React.useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(
        textRef.current.position,
        { y: -2 }, // Start position
        { y: 0, duration: 1, ease: "power2.out" } // End position with easing
      );
    }
  }, []);

  return (
    <Text
      ref={textRef}
      scale={[scale, scale, scale]} // Scale text based on window size
      position={[0, 0, 0]} // Position of the text
      fontSize={1} // Base font size
      rotation={rotation} // Apply rotation
    >
      Hello, World!
      <meshBasicMaterial attach="material" />
    </Text>
  );
};

const GLBModel: React.FC = () => {
  const { scene, gl } = useThree(); // Get the current WebGL renderer
  const cubeCameraRef: any = React.useRef<THREE.CubeCamera>(null!); // Ref for the cube camera

  const { scene: modelScene } = useGLTF("/O.glb"); // Load the GLB model

  // Make the model's material look like glass
  React.useEffect(() => {
    modelScene.traverse((child: any) => {
      if (child.isMesh) {
        // Set a physical material with glass-like properties
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff, // Color of the glass
          transparent: true,
          opacity: 1, // Reduced opacity for better visibility
          transmission: 0.8, // Transmission to allow some light through
          roughness: 0.1, // Roughness for a blurry effect
          metalness: 0.0, // Increased metalness to enhance reflections
          side: THREE.DoubleSide, // Render both sides of the material
          envMap: cubeCameraRef.current?.renderTarget.texture, // Use the cube camera texture for reflections
        });
      }
    });
  }, [modelScene]);

  // Rotate the GLB model slowly along the x-axis
  useFrame(() => {
    modelScene.rotation.y += 0.01; // Adjust rotation speed as necessary
    if (cubeCameraRef.current) {
      cubeCameraRef.current.update(gl, modelScene); // Update cube camera to capture the scene
    }
  });

  return (
    <>
      <primitive
        object={modelScene}
        position={[-1.5, 0, 1]} // Adjusted position to be in front of the text
        // rotation={[0, Math.PI / 4, 0]} // Rotate the model slightly for better view
        scale={0.15} // Scale the model if necessary
      />
      <CubeCamera
        ref={cubeCameraRef}
        near={1} // near plane distance
        far={1000} // far plane distance
        resolution={128} // resolution of the cube map
        position={[0, 0, 0]}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Canvas
      style={{ height: "100vh", width: "100vw" }}
      shadows
      gl={{ alpha: false }} // Disable alpha to allow background color to show
      camera={{ position: [0, 0, 5], fov: 75 }} // Adjust camera position if necessary
    >
      <color attach="background" args={["#87CEEB"]} />{" "}
      {/* Set the background color */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <ResponsiveText />
      <GLBModel />
    </Canvas>
  );
};

export default App;
