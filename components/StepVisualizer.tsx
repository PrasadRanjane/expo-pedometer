import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';

interface StepVisualizerProps {
  steps: number;
  goal: number;
}

export const StepVisualizer: React.FC<StepVisualizerProps> = ({ steps, goal }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progress = Math.min((steps / goal) * 100, 100);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1 + (steps % 10) * 0.01,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [steps, goal, progress, scaleAnim, pulseAnim, progressAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Today's Steps</Text>
      <View style={styles.visualizerContainer}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              opacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <MaterialIcons name="directions-walk" size={60} color={Colors.steps} />
          </View>
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressCircle,
                {
                  strokeDashoffset,
                },
              ]}
            />
          </View>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.stepValue}>{steps.toLocaleString()}</Text>
        <Text style={styles.goalText}>
          of {goal.toLocaleString()} steps
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? Colors.success : Colors.steps,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(0)}% Complete</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.steps,
  },
  circleContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${Colors.steps}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.steps,
    shadowColor: Colors.steps,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  progressContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
  },
  progressCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: Colors.steps,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  stepValue: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.steps,
    marginBottom: 4,
  },
  goalText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
