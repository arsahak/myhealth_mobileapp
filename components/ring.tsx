import { useId, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '../hooks/use-theme';

/** Circular progress, 0–1, with anything in the middle. The stroke can be a gradient. */
export function Ring({
  value,
  size = 64,
  stroke = 7,
  color,
  gradient,
  track,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  /** [start, end] colors along the ring. */
  gradient?: readonly [string, string, ...string[]];
  track?: string;
  children?: ReactNode;
}) {
  const c = useTheme();
  const id = `ring${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {gradient && (
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              {gradient.map((g, i) => (
                <Stop key={g + i} offset={i / (gradient.length - 1)} stopColor={g} />
              ))}
            </LinearGradient>
          </Defs>
        )}
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? c.track} strokeWidth={stroke} fill="none" />
        {pct > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={gradient ? `url(#${id})` : (color ?? c.tint)}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${len * pct} ${len}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}
