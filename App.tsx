import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Pedometer } from 'expo-sensors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StepVisualizer } from './components/StepVisualizer';
import { StepStats } from './components/StepStats';
import { StepHistory } from './components/StepHistory';
import { Colors } from './constants/Colors';

const DAILY_GOAL = 10000;
const AVERAGE_STRIDE_LENGTH = 0.762;

export default function App() {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [currentSteps, setCurrentSteps] = useState<number>(0);
  const [pastSteps, setPastSteps] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [dailyHistory, setDailyHistory] = useState<Array<{ date: string; steps: number }>>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    initializePedometer();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  const initializePedometer = async () => {
    try {
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (!available) {
        Alert.alert(
          'Pedometer Not Available',
          Platform.OS === 'ios'
            ? 'Pedometer requires Motion & Fitness permission and a physical device with motion sensors.'
            : 'This device may not support step counting. Please test on a device with pedometer support.',
          [{ text: 'OK' }]
        );
        return;
      }

      const { status } = await Pedometer.getPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        const request = await Pedometer.requestPermissionsAsync();
        setPermissionStatus(request.status);

        if (request.status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Step counting requires Motion & Fitness permission. Please enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: async () => {
                  try {
                    if (Platform.OS === 'ios') {
                      await Linking.openURL('app-settings:');
                    } else {
                      await Linking.openSettings();
                    }
                  } catch (error) {
                    console.error('Failed to open settings:', error);
                  }
                },
              },
            ]
          );
          return;
        }
      }

      await loadTodaySteps();
      await loadWeeklyHistory();
      startMonitoring();
    } catch (error) {
      console.error('Pedometer initialization error:', error);
      Alert.alert('Error', 'Failed to initialize pedometer');
    }
  };

  const loadTodaySteps = async () => {
    try {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      if (Platform.OS === 'ios') {
        const result = await Pedometer.getStepCountAsync(start, end);
        setPastSteps(result.steps);
        setTotalSteps(result.steps);
      } else {
        setPastSteps(0);
        setTotalSteps(0);
      }
    } catch (error) {
      console.error('Error loading today steps:', error);
    }
  };

  const loadWeeklyHistory = async () => {
    try {
      if (Platform.OS !== 'ios') {
        return;
      }

      const history: Array<{ date: string; steps: number }> = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        try {
          const result = await Pedometer.getStepCountAsync(date, end);
          history.push({
            date: date.toISOString(),
            steps: result.steps,
          });
        } catch (error) {
          history.push({
            date: date.toISOString(),
            steps: 0,
          });
        }
      }

      setDailyHistory(history);
    } catch (error) {
      console.error('Error loading weekly history:', error);
    }
  };

  const startMonitoring = () => {
    if (!isAvailable || permissionStatus !== 'granted') {
      return;
    }

    try {
      subscriptionRef.current = Pedometer.watchStepCount((result) => {
        setCurrentSteps(result.steps);
        setTotalSteps(pastSteps + result.steps);
      });
      setIsMonitoring(true);
    } catch (error) {
      console.error('Error starting step monitoring:', error);
    }
  };

  const stopMonitoring = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsMonitoring(false);
  };

  const handleRequestPermission = async () => {
    try {
      const request = await Pedometer.requestPermissionsAsync();
      setPermissionStatus(request.status);

      if (request.status === 'granted') {
        await loadTodaySteps();
        await loadWeeklyHistory();
        startMonitoring();
      } else {
        Alert.alert(
          'Permission Required',
          'Step counting requires Motion & Fitness permission. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  if (Platform.OS === 'ios') {
                    await Linking.openURL('app-settings:');
                  } else {
                    await Linking.openSettings();
                  }
                } catch (error) {
                  console.error('Failed to open settings:', error);
                  Alert.alert('Error', 'Could not open settings. Please manually enable Motion & Fitness permission for this app.');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request permission. Please enable Motion & Fitness permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: async () => {
              try {
                if (Platform.OS === 'ios') {
                  await Linking.openURL('app-settings:');
                } else {
                  await Linking.openSettings();
                }
              } catch (err) {
                console.error('Failed to open settings:', err);
              }
            },
          },
        ]
      );
    }
  };

  const calculateDistance = (steps: number): number => {
    return (steps * AVERAGE_STRIDE_LENGTH) / 1000;
  };

  const calculateCalories = (steps: number): number => {
    return steps * 0.04;
  };

  const weeklyTotal = dailyHistory.reduce((sum, day) => sum + day.steps, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="directions-walk" size={32} color={Colors.steps} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Step Counter</Text>
            <Text style={styles.headerSubtitle}>Track your daily activity</Text>
          </View>
        </View>
        {isMonitoring && (
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isAvailable && (
          <View style={styles.warningCard}>
            <MaterialIcons name="warning" size={24} color={Colors.warning} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Pedometer Not Available</Text>
              <Text style={styles.warningText}>
                {Platform.OS === 'ios'
                  ? 'This feature requires Motion & Fitness permission and a physical device with motion sensors. Test on a real iOS device.'
                  : 'This device may not support step counting. Please test on a device with pedometer support.'}
              </Text>
            </View>
          </View>
        )}

        {isAvailable && permissionStatus !== 'granted' && (
          <View style={styles.permissionCard}>
            <MaterialIcons name="lock" size={24} color={Colors.warning} />
            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>Permission Required</Text>
              <Text style={styles.permissionText}>
                Step counting requires Motion & Fitness permission to track your activity.
              </Text>
              <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
                <MaterialIcons name="lock-open" size={20} color={Colors.text} />
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isAvailable && permissionStatus === 'granted' && (
          <>
            <StepVisualizer steps={totalSteps} goal={DAILY_GOAL} />

            <StepStats
              steps={totalSteps}
              distance={calculateDistance(totalSteps)}
              calories={calculateCalories(totalSteps)}
              activeMinutes={Math.floor(totalSteps / 100)}
            />

            {dailyHistory.length > 0 && (
              <StepHistory dailySteps={dailyHistory} weeklyTotal={weeklyTotal} />
            )}

            {!isMonitoring && (
              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={24} color={Colors.info} />
                <Text style={styles.infoText}>
                  Step monitoring is active. Walk around to see your step count increase in real-time.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={24} color={Colors.info} />
            <Text style={styles.infoTitle}>About Step Counter</Text>
          </View>
          <Text style={styles.infoText}>
            The pedometer uses your device's motion sensors to count steps. Step counting works best
            when your device is on your person (pocket, bag, or hand). Historical data is available
            on iOS for the past 7 days.
          </Text>
          {Platform.OS === 'web' && (
            <View style={styles.webWarning}>
              <MaterialIcons name="warning" size={20} color={Colors.warning} />
              <Text style={styles.webWarningText}>
                Pedometer API requires a physical device with motion sensors. Test on iOS or Android
                for full functionality.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: `${Colors.steps}20`,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.steps,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${Colors.warning}15`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  webWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: `${Colors.warning}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
    marginTop: 16,
  },
  webWarningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning,
    lineHeight: 18,
    fontWeight: '500',
  },
});
