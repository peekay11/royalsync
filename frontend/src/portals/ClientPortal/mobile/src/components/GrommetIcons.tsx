import React from 'react';
import Svg, { Path, Circle, Rect, Polyline, Line, Polygon } from 'react-native-svg';

export interface IconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

const defaultProps: IconProps = {
  color: '#ffffff',
  size: 20,
  strokeWidth: 2,
};

export const HomeIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

export const GroupIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="9" cy="7" r="4" />
    <Path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <Path d="M21 21v-2a4 4 0 0 0-3-3.87" />
  </Svg>
);

export const TargetIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="9" />
    <Circle cx="12" cy="12" r="5" />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

export const DocumentTextIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Polyline points="14 2 14 8 20 8" />
    <Line x1="16" y1="13" x2="8" y2="13" />
    <Line x1="16" y1="17" x2="8" y2="17" />
    <Line x1="10" y1="9" x2="8" y2="9" />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="8" r="4" />
    <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
);

export const NotificationIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export const CarIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 11l2-5h10l2 5H5z" />
    <Rect x="3" y="11" width="18" height="6" rx="2" />
    <Circle cx="7.5" cy="17.5" r="2" />
    <Circle cx="16.5" cy="17.5" r="2" />
  </Svg>
);

export const AnalyticsIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="20" x2="18" y2="10" />
    <Line x1="12" y1="20" x2="12" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="14" />
    <Line x1="3" y1="20" x2="21" y2="20" />
  </Svg>
);

export const MailIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="16" rx="2" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

export const IdCardIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="16" rx="2" />
    <Circle cx="8" cy="11" r="3" />
    <Path d="M14 9h4" />
    <Path d="M14 13h4" />
    <Path d="M5 18a3 3 0 0 1 6 0" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

export const OrganizationIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="4" y="2" width="16" height="20" rx="2" />
    <Line x1="9" y1="6" x2="9" y2="6.01" />
    <Line x1="15" y1="6" x2="15" y2="6.01" />
    <Line x1="9" y1="10" x2="9" y2="10.01" />
    <Line x1="15" y1="10" x2="15" y2="10.01" />
    <Line x1="9" y1="14" x2="9" y2="14.01" />
    <Line x1="15" y1="14" x2="15" y2="14.01" />
    <Path d="M9 22v-4h6v4" />
  </Svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="2" y1="12" x2="22" y2="12" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

export const BriefcaseIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="7" width="20" height="14" rx="2" />
    <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Svg>
);

export const CycleIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 4v6h-6" />
    <Path d="M1 20v-6h6" />
    <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Svg>
);

export const CheckmarkIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

export const AlertIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const FormViewIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

export const HideIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

export const ReceiptIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <Line x1="8" y1="8" x2="16" y2="8" />
    <Line x1="8" y1="12" x2="16" y2="12" />
    <Line x1="8" y1="16" x2="12" y2="16" />
  </Svg>
);

export const CreditCardIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="1" y="4" width="22" height="16" rx="2" />
    <Line x1="1" y1="10" x2="23" y2="10" />
  </Svg>
);

export const AddIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const CakeIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <Path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <Line x1="2" y1="21" x2="22" y2="21" />
    <Line x1="12" y1="11" x2="12" y2="8" />
    <Circle cx="12" cy="5" r="1.5" fill={color} />
  </Svg>
);

export const SunIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="5" />
    <Line x1="12" y1="1" x2="12" y2="3" />
    <Line x1="12" y1="21" x2="12" y2="23" />
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <Line x1="1" y1="12" x2="3" y2="12" />
    <Line x1="21" y1="12" x2="23" y2="12" />
    <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </Svg>
);

export const MoonIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);

export const ChatIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

export const HeartIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <Line x1="12" y1="19" x2="12" y2="23" />
    <Line x1="8" y1="23" x2="16" y2="23" />
  </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 3l14 9-14 9V3z" />
  </Svg>
);

export const StopIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="4" y="4" width="16" height="16" rx="2" />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="3 6 5 6 21 6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <Line x1="10" y1="11" x2="10" y2="17" />
    <Line x1="14" y1="11" x2="14" y2="17" />
  </Svg>
);

export const TimerIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

export const VolumeIcon: React.FC<IconProps> = ({ color = defaultProps.color, size = defaultProps.size, strokeWidth = defaultProps.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} />
    <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Svg>
);


