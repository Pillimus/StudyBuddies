import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

const STARS = [
  { top: '6%', left: '8%', size: 2, opacity: 0.7 },
  { top: '10%', left: '22%', size: 3, opacity: 0.55 },
  { top: '18%', left: '60%', size: 2, opacity: 0.5 },
  { top: '24%', left: '86%', size: 3, opacity: 0.4 },
  { top: '31%', left: '12%', size: 2, opacity: 0.45 },
  { top: '38%', left: '70%', size: 2, opacity: 0.35 },
  { top: '48%', left: '28%', size: 3, opacity: 0.3 },
  { top: '54%', left: '80%', size: 2, opacity: 0.4 },
  { top: '66%', left: '16%', size: 2, opacity: 0.45 },
  { top: '72%', left: '52%', size: 3, opacity: 0.35 },
  { top: '83%', left: '75%', size: 2, opacity: 0.45 },
  { top: '90%', left: '36%', size: 3, opacity: 0.3 },
];

export default function AppBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={[styles.glow, styles.topGlow]} />
      <View style={[styles.glow, styles.bottomGlow]} />
      <View style={[styles.ring, styles.ringLarge]} />
      <View style={[styles.ring, styles.ringSmall]} />
      {STARS.map((star, index) => (
        <View
          key={`${star.top}-${star.left}-${index}`}
          style={[
            styles.star,
            {
              top: star.top as any,
              left: star.left as any,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060613',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#5045c8',
    opacity: 0.12,
  },
  topGlow: {
    width: 260,
    height: 260,
    right: -90,
    top: -30,
  },
  bottomGlow: {
    width: 220,
    height: 220,
    left: -80,
    bottom: -70,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(107, 119, 255, 0.12)',
    borderRadius: 999,
  },
  ringLarge: {
    width: 320,
    height: 320,
    right: -150,
    top: 70,
  },
  ringSmall: {
    width: 160,
    height: 160,
    left: -100,
    bottom: 80,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#cfd6ff',
    borderRadius: 999,
  },
});
