import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Animated, PanResponder, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../theme';

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

export const BottomSheet = ({ visible, onDismiss, children }: BottomSheetProps) => {
  const { colors, spacing, radius } = useAppTheme();
  const panY = useRef(new Animated.Value(0)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: 1000,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gs) => {
        if (gs.dy > 100 || gs.vy > 0.5) {
          closeAnim.start(() => onDismiss());
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(1000);
      resetPositionAnim.start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.sheet, 
            { 
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              overflow: 'hidden',
              transform: [{ translateY: panY.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: 'clamp' }) }] 
            }
          ]}
        >
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20,20,25,0.6)' }]} />
          
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={[styles.handle, { backgroundColor: colors.surface3 }]} />
          </View>
          <View style={{ padding: spacing.l, paddingBottom: spacing.xxxl }}>
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 200,
  },
  dragZone: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  }
});
