import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { redColor, greenColor } from '../constans/Color';
import { spacings } from '../constans/Fonts';

/**
 * Horizontal swipe actions — pure JS (Animated + PanResponder), no native
 * gesture-handler dependency.
 *  - Swipe right-to-left  → reveals a delete icon → fires onSwipeDelete.
 *  - Swipe left-to-right  → reveals a read icon   → fires onSwipeRead (only when
 *    onSwipeRead is provided; e.g. pass it just for unread rows).
 * Icons sit behind the row (no background bar) and the row springs back after.
 * Vertical scrolling is untouched — the responder engages only on a clearly
 * horizontal drag.
 */
const OPEN = 84; // max slide distance either way
const TRIGGER = 64; // past this on release → fire the action

const SwipeToDelete = ({ children, onSwipeDelete, onSwipeRead, disabled = false }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const readEnabled = typeof onSwipeRead === 'function';

  const springBack = () =>
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();

  const settleThen = cb =>
    Animated.timing(translateX, { toValue: 0, duration: 160, useNativeDriver: true }).start(cb);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        if (disabled) return false;
        const horizontal = Math.abs(g.dx) > Math.abs(g.dy) * 1.4;
        if (!horizontal) return false;
        if (g.dx < -6) return true; // left swipe (delete)
        if (g.dx > 6 && readEnabled) return true; // right swipe (read)
        return false;
      },
      onPanResponderMove: (_, g) => {
        let next = g.dx;
        if (next < 0) next = Math.max(-OPEN, next);
        else next = readEnabled ? Math.min(OPEN, next) : 0;
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx <= -TRIGGER) {
          settleThen(() => onSwipeDelete?.());
        } else if (readEnabled && g.dx >= TRIGGER) {
          settleThen(() => onSwipeRead?.());
        } else {
          springBack();
        }
      },
      onPanResponderTerminate: springBack,
    }),
  ).current;

  const deleteOpacity = translateX.interpolate({
    inputRange: [-8, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const readOpacity = translateX.interpolate({
    inputRange: [0, 8],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrap}>
      {readEnabled ? (
        <Animated.View style={[styles.left, { opacity: readOpacity }]} pointerEvents="none">
          <Icon name="check-circle" size={20} color={greenColor} />
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.right, { opacity: deleteOpacity }]} pointerEvents="none">
        <Icon name="trash-2" size={20} color={redColor} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
};

export default SwipeToDelete;

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacings.normal,
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacings.normal,
  },
});
