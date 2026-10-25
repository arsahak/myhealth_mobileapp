import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';
import { ThemedText } from './themed-text';
import { ThemeToggle } from './theme-toggle';

/**
 * Page frame shared by every tab: title with the light/dark button, an optional
 * fixed area under it (the day strip), then scrolling content with pull-to-refresh.
 */
export function Screen({
  title,
  subtitle,
  top,
  children,
  refreshing,
  onRefresh,
  backdrop,
}: {
  title: string;
  subtitle?: string;
  top?: ReactNode;
  children?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Drawn behind the header and content, e.g. a gradient wash. Also hides the header line. */
  backdrop?: ReactNode;
}) {
  const colors = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.background }]}>
      {backdrop && <View style={styles.backdrop} pointerEvents="none">{backdrop}</View>}
      <View style={[styles.headerWrap, { borderBottomColor: backdrop ? 'transparent' : colors.border }]}>
        <View style={[styles.header, !top && styles.headerAlone]}>
          <View style={styles.titles}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {subtitle && (
              <ThemedText type="small" themeColor="textSecondary">
                {subtitle}
              </ThemedText>
            )}
          </View>
          <ThemeToggle />
        </View>
        {top}
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.tint} colors={[colors.tint]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Temporary card until a tab gets its real content. */
export function Placeholder({ text }: { text: string }) {
  const colors = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <ThemedText type="smallBold" style={{ color: colors.tint }}>
        Coming soon
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  headerWrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  headerAlone: { paddingBottom: Spacing.two },
  titles: { flex: 1 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: 12,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
