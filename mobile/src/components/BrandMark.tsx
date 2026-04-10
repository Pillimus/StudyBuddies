import { Image, StyleSheet, View } from 'react-native';

export default function BrandMark({ compact = false, size }: { compact?: boolean; size?: number }) {
  const dimension = size ?? (compact ? 58 : 88);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Image
        source={require('../assets/logo.png')}
        style={[
          styles.logo,
          {
            width: dimension,
            height: dimension,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  wrapCompact: {
    alignItems: 'flex-start',
  },
  logo: {
    opacity: 0.95,
  },
});
