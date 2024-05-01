import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX, Environment } from "@react-three/drei";
import { AnimationMixer, LoopRepeat } from "three";
import IconButton from "@mui/material/IconButton";
import ChurchIcon from "@mui/icons-material/Church";
import PetsIcon from "@mui/icons-material/Pets";
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';

const AvatarModel = ({ animationName, isSpeaking }) => {
  const character = useFBX("/models/character.fbx");
  const animations = {
    idle: useFBX("/animations/idle.fbx"),
    talkv1: useFBX("/animations/talkv1.fbx"),
    chickendance: useFBX("/animations/chickendance.fbx"),
    hiphop: useFBX("/animations/hiphop.fbx"),
    ymca: useFBX("/animations/ymca.fbx"),
  };

  const mixer = useRef(new AnimationMixer(character));
  const actions = useRef({});

  useEffect(() => {
    Object.keys(animations).forEach(key => {
      actions.current[key] = mixer.current.clipAction(animations[key].animations[0]);
    });
    actions.current[animationName].play();

    return () => {
      Object.values(actions.current).forEach(action => {
        action.stop();
        mixer.current.uncacheAction(action);
      });
    };
  }, [mixer, animations, animationName]);

  useEffect(() => {
    if (isSpeaking) {
      actions.current['talkv1'].reset().fadeIn(0.5).setLoop(LoopRepeat, Infinity).play();
    } else {
      actions.current['talkv1'].fadeOut(0.5);
      actions.current[animationName].reset().fadeIn(0.5).play();
    }
  }, [isSpeaking, animationName]);

  useFrame((state, delta) => mixer.current.update(delta));

  return <primitive object={character} scale={[0.01, 0.01, 0.01]} position={[0, -0.8, 0]} />;
};

const Avatar = ({ isSpeaking }) => {
  const [animationName, setAnimationName] = useState("idle");

  return (
    <div style={{
      height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        width: "1450px", height: "675px", marginTop: "-30px", marginRight: "-120px", backgroundColor: "#ebebeb",
        borderRadius: "15px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", display: "flex",
        alignItems: "center", justifyContent: "center", overflow: "hidden"
      }}>
        <Canvas camera={{ position: [0, 0, 1.5] }}>
          <ambientLight intensity={2} color={"#ffffff"} />
          <AvatarModel animationName={animationName} isSpeaking={isSpeaking} />
          <Environment preset="park" background />
        </Canvas>
      </div>
      <IconButton onClick={() => setAnimationName("chickendance")} style={{ color: "#620062", backgroundColor: "white" }} className="chicken-button">
        <PetsIcon/>
      </IconButton>
      <IconButton onClick={() => setAnimationName("hiphop")} style={{ color: "#620062", backgroundColor: "white" }} className="hiphop-button">
        <TheaterComedyIcon/>
      </IconButton>
      <IconButton onClick={() => setAnimationName("ymca")} style={{ color: "#620062", backgroundColor: "white" }} className="ymca-button">
        <ChurchIcon/>
      </IconButton>
    </div>
  );
};

export default Avatar;
