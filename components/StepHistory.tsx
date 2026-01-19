import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';

interface StepHistoryProps {
  dailySteps: Array<{ date: string; steps: number }>;
  weeklyTotal: number;
}

export const StepHistory: React.FC<StepHistoryProps> = ({ dailySteps, weeklyTotal }) => {
  const maxSteps = Math.max(...dailySteps.map((d) => d.steps), 1);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (dailySteps.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="history" size={24} color={Colors.primary} />
          <Text style={styles.title}>Step History</Text>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="bar-chart" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No history data</Text>
          <Text style={styles.emptySubtext}>Historical step data will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="history" size={24} color={Colors.primary} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Step History</Text>
          <Text style={styles.weeklyTotal}>{weeklyTotal.toLocaleString()} steps this week</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartContainer}>
        <View style={styles.chart}>
          {dailySteps.map((day, index) => {
            const height = (day.steps / maxSteps) * 120;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 4),
                        backgroundColor:
                          day.steps >= 10000 ? Colors.success : day.steps >= 5000 ? Colors.warning : Colors.error,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{formatDate(day.date)}</Text>
                <Text style={styles.barValue}>{day.steps.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  weeklyTotal: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: -20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    height: 180,
    gap: 12,
  },
  barContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 40,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
