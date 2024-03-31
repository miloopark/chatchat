import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useFBX, Environment } from '@react-three/drei';
import { AnimationMixer, LoopOnce } from 'three';
import Transcript from './Transcript';

const AvatarModel = () => {
  const gltf = useGLTF("/models/65e7c8a4c27c34a2f1fb4452.glb");
  const fbxAnimation = useFBX("/animations/wave.fbx");
  const mixer = useRef(new AnimationMixer(gltf.scene));

  useEffect(() => {
    const action = mixer.current.clipAction(fbxAnimation.animations[0]);
    action.setLoop(LoopOnce);  // Make the animation play only once
    action.clampWhenFinished = true;  // Keep the final pose after animation
    action.play();
    return () => {
      action.stop();
      mixer.current.uncacheAction(action);
    };
  }, [fbxAnimation, gltf.scene]);

  useFrame((state, delta) => mixer.current.update(delta));

  // Avatar positioning
  return <primitive object={gltf.scene} scale={[1.75, 1.75, 1.75]} position={[0, -2.5, 0]} />;
};

const Avatar = ({ transcript }) => {
  return (
    <div style={{
      height: "92.5%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: "1250px",  // Screen scale size
        height: "auto",
        aspectRatio: "19 / 10",  // Screen ratio size
        backgroundColor: "#ebebeb",
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <Canvas camera={{ position: [0, 0.75, 3], fov: 35 }}>
          <ambientLight intensity={2} color={'#ffffff'} />
          <AvatarModel />
          <Environment preset="apartment" background /> 
        </Canvas>
      </div>
      <div style={{ 
        position: "absolute",
        bottom: -140, // Adjust these values as necessary
        width: "60.2%", // This assumes you want the transcript to span the entire width of the Avatar container
        textAlign: "center", // Center the transcript text if desired
      }}>
        <Transcript transcript={transcript} />
      </div>
    </div>
  );
};

export default Avatar;