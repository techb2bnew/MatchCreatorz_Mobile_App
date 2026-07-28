import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Text } from 'react-native';

/**
 * Website-style count-up text. Parses the numeric core out of a display string
 * (keeping any prefix/suffix like "12,000+", "4.8", "98%") and animates it from
 * 0 to the target value once on mount.
 *
 * Props:
 *  - value: string | number   e.g. "12,000+", "4.8", "98%"
 *  - duration: ms (default 1500)
 *  - style: Text style
 */
const parseValue = raw => {
  const str = String(raw ?? '');
  const match = str.match(/^(\D*)([\d.,]+)(.*)$/s);
  if (!match) {
    return { prefix: '', suffix: '', target: 0, decimals: 0, hasComma: false, valid: false };
  }
  const prefix = match[1] || '';
  const numStr = match[2] || '';
  const suffix = match[3] || '';
  const hasComma = numStr.includes(',');
  const plain = numStr.replace(/,/g, '');
  const decimals = plain.includes('.') ? plain.split('.')[1].length : 0;
  const target = parseFloat(plain);
  return {
    prefix,
    suffix,
    hasComma,
    decimals,
    target: Number.isFinite(target) ? target : 0,
    valid: Number.isFinite(target),
  };
};

const addThousands = intPart => intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const AnimatedCountUp = ({ value, duration = 1500, style }) => {
  const parsed = useMemo(() => parseValue(value), [value]);
  const progress = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(() => (parsed.valid ? parsed.prefix + '0' + parsed.suffix : String(value ?? '')));

  useEffect(() => {
    if (!parsed.valid) {
      setDisplay(String(value ?? ''));
      return undefined;
    }

    const format = n => {
      let numText = parsed.decimals > 0 ? n.toFixed(parsed.decimals) : String(Math.round(n));
      if (parsed.hasComma) {
        const [intPart, decPart] = numText.split('.');
        numText = addThousands(intPart) + (decPart ? `.${decPart}` : '');
      }
      return parsed.prefix + numText + parsed.suffix;
    };

    progress.setValue(0);
    const id = progress.addListener(({ value: p }) => setDisplay(format(p * parsed.target)));

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start(() => setDisplay(format(parsed.target)));

    return () => {
      anim.stop();
      progress.removeListener(id);
    };
  }, [parsed, duration, progress, value]);

  return <Text style={style}>{display}</Text>;
};

export default AnimatedCountUp;
