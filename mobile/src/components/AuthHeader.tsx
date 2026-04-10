import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BrandMark from './BrandMark';

export default function AuthHeader({ navigation }: { navigation: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <View style={styles.row}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setOpen(true)} activeOpacity={0.85}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </TouchableOpacity>
        <BrandMark size={74} />
      </View>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.menuCard}>
            <TouchableOpacity onPress={() => { navigation.navigate('Login'); setOpen(false); }} style={styles.menuItem}>
              <Text style={styles.menuText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { navigation.navigate('SignUp'); setOpen(false); }} style={styles.menuItem}>
              <Text style={styles.menuText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { navigation.navigate('ForgotPassword'); setOpen(false); }} style={styles.menuItem}>
              <Text style={styles.menuText}>Forgot Password</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 18,
    right: 22,
    top: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2d57',
    backgroundColor: 'rgba(18, 20, 44, 0.95)',
    justifyContent: 'center',
    paddingHorizontal: 11,
    gap: 4,
  },
  bar: {
    height: 2,
    borderRadius: 2,
    backgroundColor: '#7f6ff5',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,4,14,0.54)',
    paddingTop: 92,
    paddingLeft: 18,
    paddingRight: 18,
  },
  menuCard: {
    width: 190,
    backgroundColor: '#121126',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2e5f',
    paddingVertical: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    color: '#d7daf1',
    fontWeight: '700',
  },
});
