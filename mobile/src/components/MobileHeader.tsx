import { ReactNode, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, ChatIcon, FilesIcon, GroupsIcon, HomeIcon, LogoutIcon } from './AppSvgIcons';
import BrandMark from './BrandMark';

type NavIconName = 'home' | 'groups' | 'calendar' | 'chats' | 'files' | 'logout';

const navItems = [
  { name: 'Dashboard', label: 'Home', icon: 'home' as const },
  { name: 'Groups', label: 'Groups', icon: 'groups' as const },
  { name: 'Calendar', label: 'Calendar', icon: 'calendar' as const },
  { name: 'Chats', label: 'Chats', icon: 'chats' as const },
  { name: 'Files', label: 'Files', icon: 'files' as const },
];

function MenuIcon({
  kind,
  active = false,
}: {
  kind: NavIconName;
  active?: boolean;
}) {
  const color = active ? '#c3b8ff' : '#7f6ff5';

  if (kind === 'home') {
    return <HomeIcon size={20} color={color} />;
  }

  if (kind === 'groups') {
    return <GroupsIcon size={20} color={color} />;
  }

  if (kind === 'calendar') {
    return <CalendarIcon size={20} color={color} />;
  }

  if (kind === 'chats') {
    return <ChatIcon size={20} color={color} />;
  }

  if (kind === 'files') {
    return <FilesIcon size={20} color={color} />;
  }

  return <LogoutIcon size={20} color={color} />;
}

export default function MobileHeader({
  title,
  rightContent,
}: {
  title: string;
  rightContent?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { signOut, user } = useAuth();

  const initials = useMemo(() => {
    const name = user?.displayName?.trim() || 'User';
    return name.charAt(0).toUpperCase();
  }, [user?.displayName]);

  const isDashboard = route.name === 'Dashboard';

  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        <TouchableOpacity onPress={() => setOpen(true)} style={styles.menuButton} activeOpacity={0.85}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </TouchableOpacity>

        {isDashboard ? (
          <View style={styles.userWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.dashboardTitle}>Hey, {user?.displayName || 'User'}!</Text>
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      <View style={styles.rightRow}>{rightContent}</View>

      <Modal visible={open} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.menu}>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeButton} activeOpacity={0.85}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            <View style={styles.brandWrap}>
              <BrandMark compact />
            </View>

            <View style={styles.menuItems}>
              {navItems.map(item => {
                const active = route.name === item.name;

                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.menuItem, active && styles.menuItemActive]}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate(item.name);
                      setOpen(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.menuGlyph, active && styles.menuGlyphActive]}>
                      <MenuIcon kind={item.icon} active={active} />
                    </View>
                    <Text style={[styles.menuText, active && styles.menuTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.logoutRow}
              onPress={() => {
                signOut();
                setOpen(false);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.menuGlyph}>
                <MenuIcon kind="logout" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(7, 8, 22, 0.95)',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
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
  title: {
    color: '#b7b9d4',
    fontSize: 18,
    fontWeight: '700',
  },
  userWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#80d7d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  dashboardTitle: {
    color: '#aeb1cb',
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(2, 4, 14, 0.54)',
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    width: '74%',
    backgroundColor: '#060613',
    borderRightWidth: 1,
    borderRightColor: '#1f2243',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 28,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#7f6ff5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#7f6ff5',
    fontWeight: '800',
  },
  brandWrap: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 28,
  },
  menuItems: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },
  menuItemActive: {
    borderWidth: 1,
    borderColor: '#2f3561',
    backgroundColor: '#14182e',
  },
  menuGlyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGlyphActive: {
    backgroundColor: '#22284b',
  },
  menuText: {
    color: '#8a90b7',
    fontWeight: '700',
    fontSize: 15,
  },
  menuTextActive: {
    color: '#d9def7',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#7f88c2',
    fontWeight: '700',
    fontSize: 15,
  },
});
