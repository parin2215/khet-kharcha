import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../../shared/constants/index.js';

export default function LoadingSkeleton({ style, width = '100%', height = 20, borderRadius = 4 }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        style, 
        { 
          width: width, 
          height: height, 
          borderRadius: borderRadius,
          opacity: pulseAnim 
        }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.skeleton,
  },
});
