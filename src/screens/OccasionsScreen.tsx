import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, FAB, Portal, Modal } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ClothingItem {
  id: string;
  imageUri: string;
  category: string;
  createdAt: string;
  position?: {
    x: number;
    y: number;
  };
}

interface SelfieItem {
  id: string;
  imageUri: string;
  createdAt: string;
  clothes: ClothingItem[];
}

const DraggableClothing: React.FC<{
  item: ClothingItem;
  onPositionChange: (id: string, x: number, y: number) => void;
}> = ({ item, onPositionChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPositionRef = React.useRef({ x: 0, y: 0 });
  const itemPositionRef = React.useRef({ x: item.position?.x || 0, y: item.position?.y || 0 });

  const handleStart = (pageX: number, pageY: number) => {
    setIsDragging(true);
    startPositionRef.current = {
      x: pageX - (item.position?.x || 0),
      y: pageY - (item.position?.y || 0)
    };
  };

  const handleMove = (pageX: number, pageY: number) => {
    if (isDragging) {
      const x = pageX - startPositionRef.current.x;
      const y = pageY - startPositionRef.current.y;
      onPositionChange(item.id, x, y);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: any) => {
    const touch = e.nativeEvent.touches[0];
    handleStart(touch.pageX, touch.pageY);
  };

  const handleTouchMove = (e: any) => {
    const touch = e.nativeEvent.touches[0];
    handleMove(touch.pageX, touch.pageY);
  };

  const handleMouseDown = (e: any) => {
    handleStart(e.pageX, e.pageY);
    
    const handleMouseMove = (e: any) => {
      handleMove(e.pageX, e.pageY);
    };

    const handleMouseUp = () => {
      handleEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <View
      style={[
        styles.draggableItem,
        {
          left: item.position?.x || 0,
          top: item.position?.y || 0,
          zIndex: isDragging ? 999 : 1,
        },
      ]}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={Platform.OS === 'web' ? handleMouseDown : undefined}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={styles.clothingImage}
        resizeMode="contain"
      />
    </View>
  );
};

const OccasionsScreen = () => {
  const [selfies, setSelfies] = useState<SelfieItem[]>([]);
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedSelfie, setSelectedSelfie] = useState<SelfieItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedSelfies = await AsyncStorage.getItem('selfies');
      const savedClothes = await AsyncStorage.getItem('wardrobe');
      
      if (savedSelfies) {
        setSelfies(JSON.parse(savedSelfies));
      }
      if (savedClothes) {
        setClothes(JSON.parse(savedClothes));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相机权限才能拍照！');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newSelfie: SelfieItem = {
        id: Date.now().toString(),
        imageUri: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        clothes: [],
      };

      const updatedSelfies = [...selfies, newSelfie];
      setSelfies(updatedSelfies);
      await AsyncStorage.setItem('selfies', JSON.stringify(updatedSelfies));
    }
  };

  const handleClothingPositionChange = (selfieId: string, clothingId: string, x: number, y: number) => {
    setSelfies(prevSelfies =>
      prevSelfies.map(selfie =>
        selfie.id === selfieId
          ? {
              ...selfie,
              clothes: selfie.clothes.map(cloth =>
                cloth.id === clothingId
                  ? { ...cloth, position: { x, y } }
                  : cloth
              ),
            }
          : selfie
      )
    );
  };

  const addClothingToSelfie = (selfie: SelfieItem, clothing: ClothingItem) => {
    const updatedSelfies = selfies.map(s =>
      s.id === selfie.id
        ? {
            ...s,
            clothes: [...s.clothes, { ...clothing, position: { x: 0, y: 0 } }],
          }
        : s
    );
    setSelfies(updatedSelfies);
    AsyncStorage.setItem('selfies', JSON.stringify(updatedSelfies));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.selfieList}>
        {selfies.map(selfie => (
          <View key={selfie.id} style={styles.selfieContainer}>
            <View style={styles.selfieImageContainer}>
              <Image
                source={{ uri: selfie.imageUri }}
                style={styles.selfieImage}
                resizeMode="cover"
              />
              {selfie.clothes.map((cloth, index) => (
                <DraggableClothing
                  key={`${cloth.id}-${index}`}
                  item={cloth}
                  onPositionChange={(clothId, x, y) =>
                    handleClothingPositionChange(selfie.id, clothId, x, y)
                  }
                />
              ))}
            </View>
            <ScrollView horizontal style={styles.clothingList}>
              {clothes.map(cloth => (
                <TouchableOpacity
                  key={cloth.id}
                  style={styles.clothingItem}
                  onPress={() => addClothingToSelfie(selfie, cloth)}
                >
                  <Image
                    source={{ uri: cloth.imageUri }}
                    style={styles.clothingThumbnail}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="camera"
        onPress={takeSelfie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selfieList: {
    flex: 1,
  },
  selfieContainer: {
    marginBottom: 20,
  },
  selfieImageContainer: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  clothingList: {
    height: 120,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  clothingItem: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  clothingThumbnail: {
    width: '100%',
    height: '100%',
  },
  draggableItem: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  clothingImage: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default OccasionsScreen;