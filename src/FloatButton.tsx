import React, {useEffect} from 'react';
import {Dimensions, StyleProp, Text, View, ViewStyle} from 'react-native';
import {
  Gesture,
  GestureDetector,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Animated, {
  Keyframe,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import ActionItem from './ActionItem';

type Props = {
  onShow?: () => void;
  onHide?: () => void;
  actions?: Action[];
};

export type Action = {
  icon: string;
  onAction?: () => void;
};

export type Measure = {index: number; pageX: number; pageY: number};

const FloatButton = ({onHide, onShow, actions = []}: Props) => {
  const [isShow, setIsShow] = React.useState(false);
  const [isLongPress, setIsLongPress] = React.useState(false);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const scale = useSharedValue(1);
  const [measures, setMeasures] = React.useState<Measure[]>(
    actions.map((item, index) => ({
      index,
      pageX: 0,
      pageY: 0,
    })),
  );

  const hide = () => {
    setIsShow(false);
  };
  const toggle = () => {
    setIsShow(!isShow);
  };

  const longPress = () => {
    setIsLongPress(true);
  };
  const shortPress = () => {
    setIsLongPress(false);
  };

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(toggle)();
  });
  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      runOnJS(longPress)();
    });

  const handleComplete = () => {
    hide();
    shortPress();
    for (let i = 0; i < Object.values(measures).length; i++) {
      const item = measures[i];
      const onAction = actions[item.index].onAction;
      if (isPointOnTheElement({x: item.pageX, y: item.pageY})) {
        onAction?.();
        panX.value = 0;
        panY.value = 0;
        return;
      }
    }
  };

  const isPointOnTheElement = (position: {x: number; y: number}) => {
    const {x, y} = position;

    if (panX.value > x && panX.value < x + sizeActionItem) {
      if (panY.value > y && panY.value < y + sizeActionItem) {
        return true;
      }
    }
    return false;
  };
  const panGesture = Gesture.Pan()
    .onChange(event => {
      panX.value = event.absoluteX;
      panY.value = event.absoluteY;
    })
    .onFinalize((e, success) => {
      if (!success) {
        return;
      }
      runOnJS(handleComplete)();
    });

  useEffect(() => {
    if (isShow || isLongPress) {
      onShow && onShow();
      scale.value = withSequence(
        withTiming(1.1, {duration: 50}),
        withTiming(1, {duration: 200}),
      );
    } else {
      onHide && onHide();
      scale.value = withSequence(
        withTiming(0.9, {duration: 50}),
        withTiming(1, {duration: 100}),
      );
    }
  }, [isShow, longPress]);

  const gesture = Gesture.Simultaneous(
    ...[tapGesture, longPressGesture, panGesture],
  );

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        bottom: 0,
      }}>
      {isShow || isLongPress ? (
        <Animated.View
          exiting={keyframe.duration(300)}
          style={[
            {
              width: '100%',
            },
            scaleStyle,
          ]}>
          {actions.map((item, index) => {
            const angle = 180 / actions.length;

            const point = getPointOnCircle(
              0,
              0,
              sizeButton + actions.length * 7,
              -(180 + angle / 2) + -index * angle,
            );
            return (
              <ActionItem
                panX={panX}
                panY={panY}
                key={index}
                action={item}
                index={index}
                onLayout={measure => {
                  setMeasures(measures => {
                    measures[measure.index] = measure;
                    return [...measures];
                  });
                }}
                onPress={() => {
                  hide();
                  item.onAction && item.onAction();
                }}
                onPanComplete={handleComplete}
                style={{
                  bottom:
                    bottom + sizeButton / 2 - sizeActionItem / 2 + point.y,
                  left: width / 2 - sizeActionItem / 2 + point.x,
                }}
              />
            );
          })}
        </Animated.View>
      ) : null}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: sizeButton,
              height: sizeButton,
              backgroundColor: fill,
              borderRadius: sizeButton / 2,
              bottom: bottom,
              opacity: isLongPress ? 0 : 1,
              alignItems: 'center',
              justifyContent: 'center',
            },
            scaleStyle,
          ]}>
          <Text
            style={{
              color: 'white',
              fontSize: 36,
              fontWeight: 'bold',
            }}>
            {isShow ? 'X' : 'M'}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const bottom = 40;
const sizeButton = 80;
export const fill = '#FF024E';

export const sizeActionItem = 50;

const keyframe = new Keyframe({
  0: {
    transform: [{scale: 1}],
    opacity: 1,
  },
  50: {
    transform: [{scale: 0.7}],
    opacity: 0,
  },
  100: {
    transform: [{scale: 0}],
    opacity: 0,
  },
});

const width = Dimensions.get('screen').width;

function getPointOnCircle(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  var angleInRadians = (angleInDegrees * Math.PI) / 180;
  var x = centerX + radius * Math.cos(angleInRadians);
  var y = centerY + radius * Math.sin(angleInRadians);
  return {x: x, y: y};
}

export default FloatButton;
