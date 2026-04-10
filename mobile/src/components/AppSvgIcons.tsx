import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

function IconGradient({ id }: { id: string }) {
  return (
    <Defs>
      <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#5b8dee" />
        <Stop offset="55%" stopColor="#7c5cfc" />
        <Stop offset="100%" stopColor="#a78bfa" />
      </LinearGradient>
    </Defs>
  );
}

export function MailIcon({ size = 18, color = '#7d6fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v14H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M20 7l-8 6-8-6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function UserIcon({ size = 18, color = '#7d6fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4.5 20c0-3.5 3.4-6 7.5-6s7.5 2.5 7.5 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function LockIcon({ size = 18, color = '#7d6fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={11} width={14} height={10} rx={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M8 11V8a4 4 0 018 0v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function EyeIcon({ size = 18, color = '#7d6fff', off = false }: IconProps & { off?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} fill={color} />
      {off ? (
        <Path d="M4 20L20 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      ) : null}
    </Svg>
  );
}

export function HomeIcon({ size = 20, color = '#7f6ff5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9 21V12h6v9" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function GroupsIcon({ size = 20, color = '#7f6ff5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CalendarIcon({ size = 20, color = '#7f6ff5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={3} stroke={color} strokeWidth={1.8} />
      <Path d="M3 9h18M8 2v4M16 2v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CalendarSmallIcon({ size = 18, color = '#dfe3ff', gradient = false }: IconProps & { gradient?: boolean }) {
  const stroke = gradient ? 'url(#calendarSmallGradient)' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {gradient ? <IconGradient id="calendarSmallGradient" /> : null}
      <Rect x={3} y={4} width={18} height={18} rx={3} stroke={stroke} strokeWidth={1.8} />
      <Path d="M3 9h18M8 2v4M16 2v4" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ChatIcon({ size = 20, color = '#7f6ff5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function FilesIcon({ size = 20, color = '#7f6ff5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function LogoutIcon({ size = 20, color = '#7f6ff5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BellIcon({ size = 18, color = '#dfe3ff', gradient = false }: IconProps & { gradient?: boolean }) {
  const stroke = gradient ? 'url(#bellGradient)' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {gradient ? <IconGradient id="bellGradient" /> : null}
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MessageCircleIcon({ size = 15, color = '#a78bfa' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 11.5a8.5 8.5 0 01-8.5 8.5 8.7 8.7 0 01-3.8-.9L3 21l1.9-5.3a8.4 8.4 0 01-.9-4.2 8.5 8.5 0 1117 0z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function GoogleIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.805 10.023H12v3.955h5.615c-.242 1.273-.967 2.351-2.061 3.076v2.559h3.33c1.95-1.795 3.071-4.441 3.071-7.59 0-.664-.055-1.328-.15-2Z"
        fill="#4285F4"
      />
      <Path
        d="M12 22c2.805 0 5.168-.93 6.885-2.523l-3.33-2.559c-.928.633-2.116 1-3.555 1-2.715 0-5.017-1.832-5.838-4.297H2.723v2.64A9.997 9.997 0 0 0 12 22Z"
        fill="#34A853"
      />
      <Path
        d="M6.162 13.621A5.99 5.99 0 0 1 5.835 12c0-.563.096-1.109.327-1.621v-2.64H2.723A9.997 9.997 0 0 0 2 12c0 1.604.383 3.121 1.061 4.262l3.101-2.41Z"
        fill="#FBBC05"
      />
      <Path
        d="M12 6.082c1.528 0 2.897.526 3.977 1.56l2.974-2.974C17.162 2.991 14.8 2 12 2a9.997 9.997 0 0 0-8.939 5.738l3.101 2.64c.82-2.464 3.123-4.296 5.838-4.296Z"
        fill="#EA4335"
      />
    </Svg>
  );
}
