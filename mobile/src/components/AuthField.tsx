import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { EyeIcon, LockIcon, MailIcon, UserIcon } from './AppSvgIcons';

function getIcon(icon: 'email' | 'user' | 'lock') {
  switch (icon) {
    case 'email':
      return <MailIcon />;
    case 'user':
      return <UserIcon />;
    case 'lock':
      return <LockIcon />;
    default:
      return null;
  }
}

export default function AuthField({
  icon,
  label,
  ...props
}: TextInputProps & { icon: 'email' | 'user' | 'lock'; label: string }) {
  const isPasswordField = Boolean(props.secureTextEntry);
  const [hidden, setHidden] = useState(isPasswordField);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <View style={styles.iconWrap}>{getIcon(icon)}</View>
        <TextInput
          {...props}
          secureTextEntry={isPasswordField ? hidden : props.secureTextEntry}
          style={[styles.input, props.style]}
          placeholderTextColor="#6f7797"
        />
        {isPasswordField ? (
          <TouchableOpacity
            style={styles.toggleWrap}
            onPress={() => setHidden(value => !value)}
            activeOpacity={0.85}
          >
            <EyeIcon off={hidden} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: 14,
  },
  label: {
    color: '#c8cee5',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#8e8cab',
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 14,
    paddingLeft: 10,
    paddingRight: 6,
    fontSize: 15,
  },
  toggleWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
