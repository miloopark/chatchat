import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX, Environment } from "@react-three/drei";
import { AnimationMixer, LoopRepeat } from "three";
import IconButton from "@mui/material/IconButton";
import ChurchIcon from "@mui/icons-material/Church";
import PetsIcon from "@mui/icons-material/Pets";
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';

// Debug flag
const DEBUG = true;

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
  const currentAnimation = useRef(animationName);
  const prevSpeakingRef = useRef(false);
  const animationChangeTimerRef = useRef(null);

  // Initialize animations on first render
  useEffect(() => {
    if (DEBUG) console.log("Initializing avatar animations");
    
    Object.keys(animations).forEach(key => {
      actions.current[key] = mixer.current.clipAction(animations[key].animations[0]);
      actions.current[key].setLoop(LoopRepeat, Infinity);
      actions.current[key].clampWhenFinished = true;
    });
    
    // Start with the default animation
    actions.current[animationName].play();
    currentAnimation.current = animationName;

    return () => {
      // Cleanup on unmount
      if (animationChangeTimerRef.current) {
        clearTimeout(animationChangeTimerRef.current);
      }
      
      Object.values(actions.current).forEach(action => {
        action.stop();
        mixer.current.uncacheAction(action);
      });
    };
  }, []);

  // Handle animation changes when not speaking
  useEffect(() => {
    // Only handle animation changes if not speaking
    if (!isSpeaking && currentAnimation.current !== animationName && currentAnimation.current !== 'talkv1') {
      if (DEBUG) console.log(`Changing animation from ${currentAnimation.current} to ${animationName}`);
      
      // Cross-fade to the new animation
      actions.current[currentAnimation.current].fadeOut(0.5);
      actions.current[animationName].reset().fadeIn(0.5).play();
      currentAnimation.current = animationName;
    }
  }, [animationName, isSpeaking]);

  // Handle speaking state changes separately
  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
    
    // Speaking state has changed
    if (isSpeaking !== prevSpeakingRef.current) {
      if (isSpeaking) {
        // Change to talking animation immediately when speech starts
        if (DEBUG) console.log(`[${timestamp}] Avatar animation: STARTING talk animation`);
        
        // Immediately stop any timers that might be running
        if (animationChangeTimerRef.current) {
          clearTimeout(animationChangeTimerRef.current);
        }
        
        // Save the current animation name if it's not already talking
        if (currentAnimation.current !== 'talkv1') {
          // Quick transition to talking
          actions.current[currentAnimation.current].fadeOut(0.15);
          actions.current['talkv1'].reset().fadeIn(0.15).play();
          currentAnimation.current = 'talkv1';
        }
      } else {
        // When speech stops, go back to the previous animation
        if (DEBUG) console.log(`[${timestamp}] Avatar animation: STOPPING talk animation`);
        
        // Make sure any previous timer is cleared
        if (animationChangeTimerRef.current) {
          clearTimeout(animationChangeTimerRef.current);
        }
        
        // Switch back to the specified animation with a slight delay to ensure
        // we don't cut off the last bit of speech
        animationChangeTimerRef.current = setTimeout(() => {
          if (currentAnimation.current === 'talkv1') {
            if (DEBUG) console.log(`[${timestamp}] Avatar animation: returning to ${animationName}`);
            actions.current['talkv1'].fadeOut(0.3);
            actions.current[animationName].reset().fadeIn(0.3).play();
            currentAnimation.current = animationName;
          }
        }, 100); // Short delay before returning to normal animation
      }
      
      // Update previous speaking state ref
      prevSpeakingRef.current = isSpeaking;
    }
  }, [isSpeaking, animationName]);

  // Update animation on frame
  useFrame((state, delta) => mixer.current.update(delta));

  return <primitive object={character} scale={[0.01, 0.01, 0.01]} position={[0, -0.8, 0]} />;
};

const Avatar = ({ isSpeaking }) => {
  const [animationName, setAnimationName] = useState("idle");
  
  // Log speaking state changes for debugging with timestamp
  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
    if (isSpeaking) {
      console.log(`[${timestamp}] Avatar speaking started`);
    } else {
      console.log(`[${timestamp}] Avatar speaking stopped`);
    }
  }, [isSpeaking]);

  return (
    <div style={{
      height: "100%", width: "100%", position: "relative"
    }}>
      <div style={{
        width: "100%", height: "calc(100% - 60px)", backgroundColor: "#f0f0f0",
        borderRadius: "15px", display: "flex",
        alignItems: "center", justifyContent: "center", overflow: "hidden"
      }}>
        <Canvas camera={{ position: [0, 0, 1.5] }}>
          <ambientLight intensity={2} color={"#ffffff"} />
          <AvatarModel animationName={animationName} isSpeaking={isSpeaking} />
          <Environment preset="park" background />
        </Canvas>
      </div>
      
      <div className="animation-controls" style={{
        position: "absolute", right: "20px", top: "50%", 
        transform: "translateY(-50%)", display: "flex", 
        flexDirection: "column", gap: "15px", zIndex: 10
      }}>
        <IconButton 
          onClick={() => setAnimationName("chickendance")} 
          style={{ 
            color: "#620062", backgroundColor: "white",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}
          disabled={isSpeaking}
        >
          <PetsIcon/>
        </IconButton>
        <IconButton 
          onClick={() => setAnimationName("hiphop")} 
          style={{ 
            color: "#620062", backgroundColor: "white",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)" 
          }}
          disabled={isSpeaking}
        >
          <TheaterComedyIcon/>
        </IconButton>
        <IconButton 
          onClick={() => setAnimationName("ymca")} 
          style={{ 
            color: "#620062", backgroundColor: "white", 
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}
          disabled={isSpeaking}
        >
          <ChurchIcon/>
        </IconButton>
      </div>
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "rgba(76, 175, 80, 0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "bold",
          zIndex: 10
        }}>
          Speaking...
        </div>
      )}
    </div>
  );
};

export default Avatar;
