import { router } from 'expo-router';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenLayoutProps = {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  scrollable?: boolean;
};

export function ScreenLayout({
  title,
  children,
  showBack = true,
  scrollable = true,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Appbar.Header elevated mode="small">
        {showBack ? <Appbar.BackAction onPress={() => router.back()} /> : null}
        <Appbar.Content title={title} />
      </Appbar.Header>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
