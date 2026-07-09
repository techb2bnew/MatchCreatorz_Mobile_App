import { useEffect, useState } from 'react';
import { findNodeHandle, Keyboard, Platform, UIManager } from 'react-native';

/**
 * Extra bottom padding while Android keyboard is open.
 * iOS returns 0 — use KeyboardAvoidingView there instead.
 */
export const useKeyboardBottomInset = (extra = 24) => {
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const showSub = Keyboard.addListener('keyboardDidShow', event => {
      setBottom((event?.endCoordinates?.height || 0) + extra);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setBottom(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [extra]);

  return bottom;
};

export const keyboardAvoidingBehavior = Platform.OS === 'ios' ? 'padding' : undefined;

export const scrollInputAboveKeyboard = (scrollRef, event, offset = 140) => {
  if (Platform.OS !== 'android' || !scrollRef?.current || !event?.nativeEvent?.target) return;

  const target = event.nativeEvent.target;

  requestAnimationFrame(() => {
    setTimeout(() => {
      const scrollNode = findNodeHandle(scrollRef.current);
      if (!scrollNode) return;

      const responder = scrollRef.current.getScrollResponder?.() || scrollRef.current;

      if (typeof responder?.scrollResponderScrollNativeHandleToKeyboard === 'function') {
        responder.scrollResponderScrollNativeHandleToKeyboard(target, offset, true);
        return;
      }

      UIManager.measureLayout(
        target,
        scrollNode,
        () => {},
        (_x, y) => {
          scrollRef.current?.scrollTo?.({
            y: Math.max(0, y - offset),
            animated: true,
          });
        },
      );
    }, 150);
  });
};
