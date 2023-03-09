import React from 'react';
import {Action, Measure, fill, sizeActionItem} from './FloatButton';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {StyleProp, Text, ViewStyle} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

type ActionItemProps = {
  action: Action;
  onLayout: (event: Measure) => void;
  index: number;
  panX: Animated.SharedValue<number>;
  panY: Animated.SharedValue<number>;
  onPress: () => void;
  onPanComplete: () => void;
  style?: StyleProp<ViewStyle>;
};

const ActionItem = ({
  action,
  index,
  onLayout,
  panX,
  panY,
  onPress,
  style,
  onPanComplete,
}: ActionItemProps) => {
  const position = useSharedValue({x: 0, y: 0});
  const isPress = useSharedValue(1);

  const isPointOnTheElement = () => {
    'worklet';
    const x = position.value.x;
    const y = position.value.y;

    return panX.value > x && panX.value < x + sizeActionItem
      ? panY.value > y && panY.value < y + sizeActionItem
        ? true
        : false
      : false;
  };
  const isPoint = useDerivedValue(isPointOnTheElement);

  const handlePress = () => {
    onPress();
  };

  const tapGesture = Gesture.Tap().onEnd((e, success) => {
    isPress.value = withTiming(1.2, {duration: 100}, () => {
      runOnJS(handlePress)();
    });
  });

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onChange(event => {
      panX.value = event.absoluteX;
      panY.value = event.absoluteY;
    })
    .onFinalize((e, success) => {
      if (!success) {
        return;
      }
      runOnJS(onPanComplete)();
    });

  const scaleStyle = useAnimatedStyle(() => {
    'worklet';

    return {
      transform: [
        {
          scale: isPoint.value ? withTiming(1.2) : isPress.value,
        },
      ],
    };
  }, [panX.value, panY]);

  const gesture = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={event => {
          event.target.measure((x, y, width, height, pageX, pageY) => {
            onLayout({index, pageX, pageY});
            position.value = {x: pageX, y: pageY};
          });
        }}
        style={[
          {
            position: 'absolute',
            width: sizeActionItem,
            height: sizeActionItem,
            backgroundColor: fill,
            borderRadius: sizeActionItem,
            zIndex: 100,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
          scaleStyle,
        ]}>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
          }}>
          {action.icon}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
};

export default ActionItem;
