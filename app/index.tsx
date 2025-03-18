import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, StatusBar, Alert } from 'react-native';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';

export default function TorchUI() {
  const [isOn, setIsOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    //if camera already ready then return
    if (cameraReady) {
      return;
    }
    // Request permission if not granted
    if (!permission || permission.status !== 'granted') {
      requestPermission();
    }
  }, [permission])

  const toggleTorch = async () => {
    // Check permissions
    if (!permission || permission.status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to use the torch');
      await requestPermission();
      return;
    }

    // Check if the camera is ready
    if (!cameraReady) {
      return;
    }

    // Toggle the torch
    setIsOn((prev) => !prev);
  };


  if (!permission) {
    return <View />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isOn ? '#e8f5ff' : '#091e3e' }]}>
      <StatusBar barStyle={isOn ? 'dark-content' : 'light-content'} />

      <TouchableOpacity
        style={styles.button}
        onPress={toggleTorch}
        disabled={!permission.granted || !cameraReady}
      >
        <View style={[styles.circle, { backgroundColor: isOn ? '#ffd966' : '#223b5e' }]}>
          <Text style={{ fontSize: 40 }}>{isOn ? '🔦' : '🔅'}</Text>
        </View>
        <Text style={[styles.text, { color: isOn ? '#333' : '#fff' }]}>
          {isOn ? 'Torch is On' : 'Torch is Off'}
        </Text>
      </TouchableOpacity>

      {permission.granted && (
        <CameraView
          ref={cameraRef}
          style={styles.hiddenCamera}
          facing="back"
          enableTorch={isOn}
          mode='video'
          flash='on'
          onCameraReady={() => {
            if (!cameraReady) {
            setCameraReady(true);
            }
        
          }}
          onMountError={(error) => console.error('Camera mount error', error)}
        />
      )}

      {!permission.granted && (
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={[styles.text, { color: '#fff' }]}>
            Request Camera Permission
          </Text>
        </TouchableOpacity>
      )}

      {isOn && <View style={styles.lightBeam} />}
    </View>
  );
}
// Keep the existing StyleSheet

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  button: {
    alignItems: 'center',
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
  lightBeam: {
    position: 'absolute',
    top: 0,
    width: 250,
    height: '50%',
    backgroundColor: '#ffffff90',
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    transform: [{ scaleY: 2 }],
  },
  hiddenCamera: {
    width: 1,
    height: 1,
    opacity: 0,
    backgroundColor: 'red',
  },
});

