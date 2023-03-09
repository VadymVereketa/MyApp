/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FloatButton from './src/FloatButton';
import {BlurView} from '@react-native-community/blur';

const App = () => {
  const [text, setText] = React.useState('');
  const [isShow, setIsShow] = React.useState(true);

  return (
    <View
      style={{
        flexGrow: 1,
      }}>
      <Text
        style={{
          marginTop: 100,
          textAlign: 'center',
          fontSize: 20,
        }}>
        Action {text}
      </Text>
      {isShow ? (
        <BlurView
          blurType="light"
          blurAmount={5}
          style={{
            ...StyleSheet.absoluteFillObject,
          }}
        />
      ) : null}
      <FloatButton
        onShow={() => {
          setIsShow(true);
        }}
        onHide={() => {
          setIsShow(false);
        }}
        actions={[1, 2, 3, 4, 5].map(item => ({
          icon: item.toString(),
          onAction: () => {
            setText(item.toString());
          },
        }))}
      />
    </View>
  );
};

export default App;
