import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, PanResponder, Animated, Dimensions } from 'react-native';
import { Colors, Radius } from '../constants/theme';

interface BeforeAfterSliderProps {
  beforeImage: any;
  afterImage: any;
  width?: number;
  height?: number;
}

export default function BeforeAfterSlider({ beforeImage, afterImage, width = 300, height = 300 }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(width / 2);
  const pan = useRef(new Animated.ValueXY({ x: width / 2, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let newX = gestureState.moveX - (Dimensions.get('window').width - width) / 2;
        // constrain to bounds
        if (newX < 0) newX = 0;
        if (newX > width) newX = width;
        pan.setValue({ x: newX, y: 0 });
        setSliderPosition(newX);
      },
      onPanResponderRelease: () => {
        // Optional snap or just leave it
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Before Image (Background) */}
      <Image source={beforeImage} style={[styles.image, { width, height }]} resizeMode="cover" />
      
      {/* After Image (Foreground, clipped) */}
      <View style={[styles.clippedContainer, { width: sliderPosition, height }]}>
        <Image source={afterImage} style={[styles.image, { width, height }]} resizeMode="cover" />
      </View>

      {/* Slider Thumb/Line */}
      <Animated.View
        style={[
          styles.sliderLine,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.thumb} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.cardSurface,
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  clippedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.white,
    marginLeft: -2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primaryTeal,
  },
});
