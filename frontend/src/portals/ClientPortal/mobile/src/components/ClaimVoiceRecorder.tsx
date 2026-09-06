import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import {
  MicrophoneIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  CheckmarkIcon,
  VolumeIcon,
} from './GrommetIcons';

export interface VoiceRecordingData {
  id: string;
  filename: string;
  durationSeconds: number;
  durationFormatted: string;
  timestamp: string;
  transcriptSnippet?: string;
  size: string;
}

interface ClaimVoiceRecorderProps {
  onRecordingComplete: (recording: VoiceRecordingData) => void;
  onRemoveRecording?: () => void;
  existingRecording?: VoiceRecordingData | null;
  categoryTitle?: string;
}

export const ClaimVoiceRecorder: React.FC<ClaimVoiceRecorderProps> = ({
  onRecordingComplete,
  onRemoveRecording,
  existingRecording,
  categoryTitle = 'Incident',
}) => {
  const { colors, isDark } = useTheme();

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [recording, setRecording] = useState<VoiceRecordingData | null>(existingRecording || null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerIntervalRef = useRef<any>(null);
  const playbackIntervalRef = useRef<any>(null);

  // Pulse animation while recording
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => anim?.stop();
  }, [isRecording]);

  // Record timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= 120) {
            // max 2 minutes
            handleStopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      setPlaybackSeconds(0);
      const total = recording?.durationSeconds || recordSeconds || 12;
      playbackIntervalRef.current = setInterval(() => {
        setPlaybackSeconds(prev => {
          if (prev >= total) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    }
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isPlaying, recording, recordSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleStartRecording = () => {
    setIsPlaying(false);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const dur = Math.max(3, recordSeconds);
    const formatted = formatTime(dur);
    const newRecord: VoiceRecordingData = {
      id: `rec_${Date.now()}`,
      filename: `voice_statement_${categoryTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.m4a`,
      durationSeconds: dur,
      durationFormatted: formatted,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      transcriptSnippet: `“Incident occurred at current location with immediate impact. Audio statement captured for underwriter review.”`,
      size: `${(dur * 0.08 + 0.3).toFixed(1)} MB`,
    };
    setRecording(newRecord);
    onRecordingComplete(newRecord);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    setIsPlaying(false);
    setIsRecording(false);
    setRecording(null);
    setRecordSeconds(0);
    setPlaybackSeconds(0);
    onRemoveRecording?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f8fafc', borderColor: isDark ? '#2d2d2d' : '#e2e8f0' }]}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.micIconCircle, { backgroundColor: isRecording ? '#fee2e2' : (isDark ? '#262626' : '#edf2f7') }]}>
            <MicrophoneIcon color={isRecording ? '#d92820' : colors.text} size={18} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Voice Incident Statement</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Record spoken details, witness audio, or roadside summary
            </Text>
          </View>
        </View>

        {recording && !isRecording && (
          <View style={styles.attachedBadge}>
            <CheckmarkIcon color="#16a34a" size={13} />
            <Text style={styles.attachedBadgeText}>Audio Attached</Text>
          </View>
        )}
      </View>

      {/* State 1: Idle (No recording yet) */}
      {!isRecording && !recording && (
        <View style={styles.idleBox}>
          <TouchableOpacity
            style={styles.recordStartBtn}
            onPress={handleStartRecording}
            activeOpacity={0.85}
          >
            <Animated.View style={[styles.micPulseCircle, { transform: [{ scale: pulseAnim }] }]}>
              <MicrophoneIcon color="#ffffff" size={24} />
            </Animated.View>
            <View style={styles.btnTextCol}>
              <Text style={styles.recordStartText}>Tap to Record Voice Note</Text>
              <Text style={styles.recordStartSub}>Speak naturally · Up to 2:00 mins · Auto AI Transcribed</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* State 2: Active Recording */}
      {isRecording && (
        <View style={styles.recordingBox}>
          <View style={styles.recordingTopRow}>
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={styles.recordingTimer}>{formatTime(recordSeconds)} / 02:00</Text>
            <Text style={styles.recordingStatusText}>Recording in progress...</Text>
          </View>

          {/* Animated Waveform Simulation */}
          <View style={styles.waveformContainer}>
            {[35, 65, 40, 85, 95, 55, 75, 45, 90, 100, 60, 80, 40, 70, 90, 50, 65, 35].map((h, idx) => (
              <View
                key={idx}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.max(8, (h * (recordSeconds % 2 === 0 ? 0.9 : 0.6))),
                    backgroundColor: idx % 2 === 0 ? '#d92820' : '#ef4444',
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.stopBtn}
            onPress={handleStopRecording}
            activeOpacity={0.88}
          >
            <StopIcon color="#ffffff" size={18} />
            <Text style={styles.stopBtnText}>Done Recording (Save Note)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* State 3: Recorded & Ready / Playback */}
      {!isRecording && recording && (
        <View style={styles.recordedBox}>
          <View style={styles.playerRow}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={handleTogglePlay}
              activeOpacity={0.85}
            >
              {isPlaying ? (
                <StopIcon color="#ffffff" size={16} />
              ) : (
                <PlayIcon color="#ffffff" size={16} />
              )}
            </TouchableOpacity>

            <View style={styles.trackCol}>
              <View style={styles.filenameRow}>
                <VolumeIcon color="#d92820" size={14} />
                <Text style={[styles.audioFilename, { color: colors.text }]} numberOfLines={1}>
                  {recording.filename}
                </Text>
              </View>

              {/* Scrubber Bar */}
              <View style={[styles.scrubberTrack, { backgroundColor: isDark ? '#333' : '#e2e8f0' }]}>
                <View
                  style={[
                    styles.scrubberFill,
                    {
                      width: isPlaying
                        ? `${Math.min(100, (playbackSeconds / (recording.durationSeconds || 1)) * 100)}%`
                        : '100%',
                    },
                  ]}
                />
              </View>

              <View style={styles.timeInfoRow}>
                <Text style={styles.timeInfoText}>
                  {isPlaying ? formatTime(playbackSeconds) : recording.durationFormatted} ({recording.size})
                </Text>
                <Text style={styles.aiTag}>AI Transcribed ✓</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.trashBtn, { backgroundColor: isDark ? '#291414' : '#fee2e2' }]}
              onPress={handleDelete}
              activeOpacity={0.7}
              title="Delete and re-record"
            >
              <TrashIcon color="#d92820" size={16} />
            </TouchableOpacity>
          </View>

          {/* Transcript Preview */}
          {recording.transcriptSnippet && (
            <View style={[styles.transcriptBox, { backgroundColor: isDark ? '#212121' : '#f1f5f9' }]}>
              <Text style={styles.transcriptLabel}>AI AUDIO TRANSCRIPTION SUMMARY</Text>
              <Text style={[styles.transcriptText, { color: colors.textSecondary }]}>
                {recording.transcriptSnippet}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  micIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attachedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  idleBox: {
    marginTop: 4,
  },
  recordStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d92820',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  micPulseCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextCol: {
    flex: 1,
  },
  recordStartText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  recordStartSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10.5,
    marginTop: 2,
  },
  recordingBox: {
    backgroundColor: '#1f1313',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    alignItems: 'center',
  },
  recordingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  recordingTimer: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  recordingStatusText: {
    fontSize: 12,
    color: '#fca5a5',
    fontWeight: '600',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 48,
    width: '100%',
    marginVertical: 8,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d92820',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
    marginTop: 6,
  },
  stopBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  recordedBox: {
    marginTop: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#d92820',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCol: {
    flex: 1,
  },
  filenameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  audioFilename: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  scrubberTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: '#d92820',
    borderRadius: 3,
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfoText: {
    fontSize: 10.5,
    color: '#9ca3af',
    fontWeight: '600',
  },
  aiTag: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '700',
  },
  trashBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  transcriptLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#d92820',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  transcriptText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
