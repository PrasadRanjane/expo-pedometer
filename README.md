# Expo Pedometer - Step Counter

A professional React Native app demonstrating step counting using `expo-sensors` Pedometer API. Track steps, distance, calories, and view daily/weekly statistics.

## Features

- ✅ **Step Counting** - Real-time step tracking
- ✅ **Distance Calculation** - Calculate distance traveled from steps
- ✅ **Calories Estimation** - Estimate calories burned
- ✅ **Daily Goal** - Track progress toward daily step goal (10,000 steps)
- ✅ **Weekly History** - View step history for the past 7 days (iOS)
- ✅ **Real-time Updates** - Live step count updates as you walk
- ✅ **Modern UI** - Beautiful dark theme with smooth animations

## Installation

```bash
npx expo install expo-sensors @expo/vector-icons
```

## Usage

### Basic Step Counting

```tsx
import { Pedometer } from 'expo-sensors';

const available = await Pedometer.isAvailableAsync();
if (available) {
  const subscription = Pedometer.watchStepCount((result) => {
    console.log('Steps:', result.steps);
  });
  
  subscription.remove();
}
```

### Check Availability

```tsx
const isAvailable = await Pedometer.isAvailableAsync();
```

### Request Permissions

```tsx
const { status } = await Pedometer.getPermissionsAsync();
if (status !== 'granted') {
  const request = await Pedometer.requestPermissionsAsync();
}
```

### Get Historical Steps (iOS)

```tsx
const start = new Date();
start.setHours(0, 0, 0, 0);
const end = new Date();

const result = await Pedometer.getStepCountAsync(start, end);
console.log('Today steps:', result.steps);
```

## API Reference

### Methods

- `isAvailableAsync()` - Check if pedometer is available
- `getPermissionsAsync()` - Get current permission status
- `requestPermissionsAsync()` - Request motion permissions
- `watchStepCount(callback)` - Listen to step count changes
- `getStepCountAsync(start, end)` - Get step count for date range (iOS)

### Data Structure

```typescript
interface StepCountResult {
  steps: number;
}
```

## Components

### StepVisualizer

Animated visual representation of current steps with progress toward goal.

```tsx
<StepVisualizer steps={steps} goal={10000} />
```

### StepStats

Display distance, calories, and active time statistics.

```tsx
<StepStats
  steps={steps}
  distance={distance}
  calories={calories}
  activeMinutes={activeMinutes}
/>
```

### StepHistory

Visualize daily step history for the past week.

```tsx
<StepHistory dailySteps={dailySteps} weeklyTotal={weeklyTotal} />
```

## Calculations

### Distance
```
distance (km) = steps × average_stride_length (0.762m) / 1000
```

### Calories
```
calories = steps × 0.04 kcal/step
```

### Active Time
```
active_minutes = steps / 100 steps_per_minute
```

## Platform Considerations

### iOS
- Requires Motion & Fitness permission (`NSMotionUsageDescription`)
- Historical step data available for past 7 days
- Works best on physical device (simulator has limited support)
- Real-time step counting works well

### Android
- Requires `ACTIVITY_RECOGNITION` permission (Android 10+)
- Historical step data may not be available (date range queries not fully supported)
- Real-time step counting works on supported devices
- Some devices may not have pedometer support

### Web
- Pedometer API is not available on web
- App will show availability warning

## Configuration

Add to your `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMotionUsageDescription": "This app needs access to motion sensors to count your steps."
      }
    },
    "android": {
      "permissions": ["android.permission.ACTIVITY_RECOGNITION"]
    },
    "plugins": [
      [
        "expo-sensors",
        {
          "motionPermission": "Allow $(PRODUCT_NAME) to access your device motion"
        }
      ]
    ]
  }
}
```

## Use Cases

- **Fitness Apps** - Track daily activity and steps
- **Health Apps** - Monitor physical activity levels
- **Wellness Apps** - Encourage daily movement goals
- **Activity Tracking** - Monitor walking and running
- **Gamification** - Step challenges and achievements

## Try It

[Open in Expo Snack](https://snack.expo.dev/@prasadranjane/expo-pedometer)

## License

MIT
