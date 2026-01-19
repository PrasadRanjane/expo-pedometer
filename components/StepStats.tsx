import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';

interface StepStatsProps {
  steps: number;
  distance: number;
  calories: number;
  activeMinutes: number;
}

const AVERAGE_STRIDE_LENGTH = 0.762;
const CALORIES_PER_STEP = 0.04;
const STEPS_PER_MINUTE = 100;

export const StepStats: React.FC<StepStatsProps> = ({
  steps,
  distance,
  calories,
  activeMinutes,
}) => {
  const calculatedDistance = distance || steps * AVERAGE_STRIDE_LENGTH / 1000;
  const calculatedCalories = calories || steps * CALORIES_PER_STEP;
  const calculatedActiveMinutes = activeMinutes || Math.floor(steps / STEPS_PER_MINUTE);

  const stats = [
    {
      label: 'Distance',
      value: calculatedDistance.toFixed(2),
      unit: 'km',
      icon: 'straighten',
      color: Colors.distance,
    },
    {
      label: 'Calories',
      value: Math.round(calculatedCalories).toString(),
      unit: 'kcal',
      icon: 'local-fire-department',
      color: Colors.calories,
    },
    {
      label: 'Active Time',
      value: calculatedActiveMinutes.toString(),
      unit: 'min',
      icon: 'timer',
      color: Colors.active,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="analytics" size={24} color={Colors.primary} />
        <Text style={styles.title}>Activity Statistics</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
              <MaterialIcons name={stat.icon as any} size={28} color={stat.color} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statUnit}>{stat.unit}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});
