import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFBX, Environment } from '@react-three/drei';
import { AnimationMixer, LoopRepeat } from 'three';

const AvatarModel = ({ isSpeaking }) => {
  const character = useFBX("/models/character.fbx");
  const idleAnimation = useFBX("/animations/idle.fbx");
  const talkv1Animation = useFBX("/animations/talkv1.fbx");
  
  const mixer = useRef(new AnimationMixer(character));
  const idleAction = useRef();
  const talkAction = useRef();

  useEffect(() => {
    idleAction.current = mixer.current.clipAction(idleAnimation.animations[0]);
    talkAction.current = mixer.current.clipAction(talkv1Animation.animations[0]);
    idleAction.current.play();

    return () => {
      idleAction.current.stop();
      talkAction.current.stop();
      mixer.current.uncacheAction(idleAction.current);
      mixer.current.uncacheAction(talkAction.current);
    };
  }, [mixer, idleAnimation, talkv1Animation]);

  useEffect(() => {
    if (isSpeaking) {
      idleAction.current.fadeOut(0.5);
      talkAction.current.reset().fadeIn(0.5).setLoop(LoopRepeat, Infinity).play();
    } else {
      talkAction.current.fadeOut(0.5);
      idleAction.current.reset().fadeIn(0.5).play();
    }
  }, [isSpeaking]);

  useFrame((state, delta) => mixer.current.update(delta));

  return <primitive object={character} scale={[0.01, 0.01, 0.01]} position={[0, -0.8, 0]} />;
};

const Avatar = ({ isSpeaking }) => {
  return (
    <div style={{
      height: "92.5%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: "1250px",
        height: "auto",
        aspectRatio: "19 / 10",
        backgroundColor: "#ebebeb",
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <Canvas camera={{ position: [0, 0, 1.5] }}>
          <ambientLight intensity={2} color={'#ffffff'} />
          <AvatarModel isSpeaking={isSpeaking} />
          <Environment preset="park" background/>
        </Canvas>
      </div>
      <div style={{ 
        position: "absolute",
        bottom: -140, // Adjust these values as necessary
        width: "60.2%", // This assumes you want the transcript to span the entire width of the Avatar container
        textAlign: "center", // Center the transcript text if desired
      }}>
      </div>
    </div>
  );
};

export default Avatar;
