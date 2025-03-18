import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, StatusBar, Alert, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const MORSE_CODE: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': ' '
};

export default function TorchUI() {
  const [isSending, setIsSending] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [text, setText] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission || permission.status !== 'granted') {
      requestPermission();
    }
  }, [permission]);


  const isSendingRef = useRef(false);

  const sendMorse = async () => {
    if (!cameraReady || !permission || permission.status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to use the torch');
      return;
    }

    isSendingRef.current = true;
    setIsSending(true);

    const morseCode = text.toUpperCase().split('').map((char) => MORSE_CODE[char] || '').join(' ');
    console.log('Morse Code:', morseCode);

    for (const symbol of morseCode) {
      while (!cameraReady) {
        await new Promise(res => setTimeout(res, 500));
      }

      if (!isSendingRef.current) {
        console.log('Sending stopped');
        break;
      }

      setIsOn(true);
      await new Promise(res => setTimeout(res, symbol === '.' ? 1000 : 2000));

      setIsOn(false);
      await new Promise(res => setTimeout(res, 500));

      if (!isSendingRef.current) {
        console.log('Sending stopped');
        break;
      }
    }

    isSendingRef.current = false;
    setIsSending(false);
  };

  const stopSending = () => {
    console.log('Stopping Morse Code');
    isSendingRef.current = false;
    setIsSending(false);
  };

  if (!permission) {
    return <View />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isOn ? '#e8f5ff' : '#091e3e' }]}>
      <StatusBar barStyle={isOn ? 'dark-content' : 'light-content'} />

      <TextInput
        style={styles.input}
        placeholder="Enter text to send in Morse Code"
        placeholderTextColor="#ccc"
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={isSendingRef.current ? stopSending : sendMorse}
        disabled={!permission.granted || !cameraReady}
      >
        <View style={[styles.circle, { backgroundColor: isOn ? '#ffd966' : '#223b5e' }]}>
          <Text style={{ fontSize: 40 }}>{isOn ? '🔦' : '🔅'}</Text>
        </View>
        <Text style={[styles.text, { color: isOn ? '#333' : '#fff' }]}> {isSending ? 'Stop' : 'Send Morse Code'} </Text>
      </TouchableOpacity>

      {permission.granted && (
        <CameraView
          ref={cameraRef}
          style={styles.hiddenCamera}
          facing="back"
          enableTorch={isOn}
          onCameraReady={() => setCameraReady(true)}
          onMountError={(error) => console.error('Camera mount error', error)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 20,
  },
  button: {
    alignItems: 'center',
    marginTop: 20,
    zIndex: 10,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  hiddenCamera: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});