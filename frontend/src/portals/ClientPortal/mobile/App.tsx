import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AppStage, Screen, AppNotification } from './src/types';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardScreen } from './src/screens/OnboardScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PortfolioScreen } from './src/screens/PortfolioScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { ClaimsScreen } from './src/screens/ClaimsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomNav } from './src/components/BottomNav';
import { PushNotificationBanner } from './src/components/PushNotificationBanner';
import { NotificationCenterModal, INITIAL_NOTIFICATIONS } from './src/components/NotificationCenterModal';

function MainApp() {
  const { colors, isDark } = useTheme();
  const [stage, setStage] = useState<AppStage>('splash');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activePush, setActivePush] = useState<AppNotification | null>(null);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSelectNotification = (notif: AppNotification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setNotifModalVisible(false);

    // Route to appropriate screen if specified
    if (notif.actionScreen) {
      setCurrentScreen(notif.actionScreen);
    }
  };

  const handlePushBannerAction = (notif: AppNotification) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.actionScreen) {
      setCurrentScreen(notif.actionScreen);
    } else {
      setNotifModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundDark }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.backgroundDark}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Real-Time Push Notification Top Drop Banner */}
        {stage === 'app' && (
          <PushNotificationBanner
            notification={activePush}
            onDismiss={() => setActivePush(null)}
            onPressAction={handlePushBannerAction}
          />
        )}

        {/* Splash Stage */}
        {stage === 'splash' && (
          <SplashScreen onDone={() => setStage('onboard')} />
        )}

        {/* Onboarding Stage */}
        {stage === 'onboard' && (
          <OnboardScreen
            onLogin={() => setStage('login')}
            onRegister={() => setStage('register')}
          />
        )}

        {/* Login Stage */}
        {stage === 'login' && (
          <LoginScreen
            onLogin={() => setStage('app')}
            onRegister={() => setStage('register')}
          />
        )}

        {/* Registration Stage */}
        {stage === 'register' && (
          <RegisterScreen
            onDone={() => setStage('login')}
            onLogin={() => setStage('login')}
          />
        )}

        {/* Main Authenticated App */}
        {stage === 'app' && (
          <View style={styles.appContainer}>
            <View style={styles.screenContent}>
              {currentScreen === 'home' && (
                <HomeScreen
                  onNavigateToClaims={() => setCurrentScreen('claims')}
                  onNavigateToGoals={() => setCurrentScreen('goals')}
                  onNavigateToPortfolio={() => setCurrentScreen('portfolio')}
                  onOpenNotifications={() => setNotifModalVisible(true)}
                  unreadNotificationsCount={unreadCount}
                />
              )}
              {currentScreen === 'portfolio' && <PortfolioScreen />}
              {currentScreen === 'goals' && <GoalsScreen />}
              {currentScreen === 'claims' && <ClaimsScreen />}
              {currentScreen === 'profile' && (
                <ProfileScreen onSignOut={() => setStage('login')} />
              )}
            </View>

            {/* Bottom Navigation Tab Bar */}
            <BottomNav active={currentScreen} onSelect={setCurrentScreen} />

            {/* Notification Center & Update History Modal */}
            <NotificationCenterModal
              visible={notifModalVisible}
              onClose={() => setNotifModalVisible(false)}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onSelectNotification={handleSelectNotification}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
});
