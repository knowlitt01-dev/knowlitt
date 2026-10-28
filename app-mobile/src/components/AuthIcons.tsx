import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

/**
 * Geometric, crisp vector icons implemented purely in React Native.
 * Zero external dependencies, perfectly sharp on all DPRs (iOS / Android / Web).
 */

interface IconProps {
  color?: string;
  size?: number;
}

/** Left Arrow only (no text) */
export function ArrowLeftIcon({ color = '#111111', size = 18 }: IconProps) {
  const strokeWidth = 2;
  const headSize = Math.round(size * 0.44);
  const stemWidth = Math.round(size * 0.72);

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Horizontal stem */}
      <View
        style={{
          position: 'absolute',
          width: stemWidth,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          right: 1,
        }}
      />
      {/* 45-degree rotated arrow head */}
      <View
        style={{
          position: 'absolute',
          width: headSize,
          height: headSize,
          borderLeftWidth: strokeWidth,
          borderBottomWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          left: 1,
        }}
      />
    </View>
  );
}

/** Right Arrow for primary submit buttons */
export function ArrowRightIcon({ color = '#FFFFFF', size = 16 }: IconProps) {
  const strokeWidth = 2;
  const headSize = Math.round(size * 0.44);
  const stemWidth = Math.round(size * 0.72);

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Horizontal stem */}
      <View
        style={{
          position: 'absolute',
          width: stemWidth,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          left: 1,
        }}
      />
      {/* 45-degree rotated arrow head */}
      <View
        style={{
          position: 'absolute',
          width: headSize,
          height: headSize,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          right: 1,
        }}
      />
    </View>
  );
}

/** Password visibility toggle icon (Eye / Eye-off) */
export function EyeIcon({
  visible,
  color = '#8E8E93',
  size = 18,
}: {
  visible: boolean;
  color?: string;
  size?: number;
}) {
  const stroke = 1.6;
  const irisSize = Math.round(size * 0.38);

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Eye outer contour */}
      <View
        style={{
          width: size,
          height: Math.round(size * 0.58),
          borderWidth: stroke,
          borderColor: color,
          borderRadius: Math.round(size * 0.35),
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Iris */}
        <View
          style={{
            width: irisSize,
            height: irisSize,
            borderRadius: irisSize / 2,
            borderWidth: stroke,
            borderColor: color,
            backgroundColor: visible ? color : 'transparent',
          }}
        />
      </View>

      {/* Slash when hidden */}
      {!visible && (
        <View
          style={{
            position: 'absolute',
            width: size * 1.15,
            height: stroke,
            backgroundColor: color,
            transform: [{ rotate: '-45deg' }],
            borderRadius: stroke / 2,
          }}
        />
      )}
    </View>
  );
}

/** Subtle mail envelope icon for Password Reset states */
export function MailIcon({ color = '#E59819', size = 24 }: IconProps) {
  const stroke = 1.8;
  const w = size;
  const h = Math.round(size * 0.72);

  return (
    <View style={[styles.center, { width: w, height: h }]}>
      <View
        style={{
          width: w,
          height: h,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 6,
          justifyContent: 'flex-start',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Envelope flap chevron */}
        <View
          style={{
            width: Math.round(w * 0.68),
            height: Math.round(w * 0.68),
            borderBottomWidth: stroke,
            borderRightWidth: stroke,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
            marginTop: -Math.round(w * 0.42),
          }}
        />
      </View>
    </View>
  );
}

/** Checkmark icon */
export function CheckIcon({ color = '#10B981', size = 14 }: IconProps) {
  const stroke = 1.8;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: Math.round(size * 0.4),
          height: Math.round(size * 0.7),
          borderBottomWidth: stroke,
          borderRightWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginTop: -2,
        }}
      />
    </View>
  );
}

/** Amber dot emblem accent */
export function AmberDot({ size = 5 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#E59819',
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
