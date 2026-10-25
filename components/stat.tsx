import type { Icon } from 'phosphor-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/use-theme';

/** Small tile: icon + label, big value, optional note. Two fit side by side. */
export function Stat({ icon: I, label, value, sub }: { icon: Icon; label: string; value: string; sub?: string }) {
  const c = useTheme();
  return (
    <View style={[s.tile, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
      <View style={s.label}>
        <I size={16} weight="fill" color={c.tint} />
        <Text style={[s.labelText, { color: c.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[s.value, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {sub && (
        <Text style={[s.sub, { color: c.textSecondary }]} numberOfLines={2}>
          {sub}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tile: { flex: 1, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
  value: { fontSize: 22, fontWeight: '800', marginTop: 6, fontVariant: ['tabular-nums'] },
  sub: { fontSize: 12, marginTop: 2 },
});
