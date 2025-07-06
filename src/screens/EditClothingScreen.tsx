import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Title, Card, IconButton } from 'react-native-paper';
import { ClothingItem } from '../types';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type EditClothingScreenRouteProp = RouteProp<{ params: { clothingItem: ClothingItem } }, 'params'>;

const EditClothingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditClothingScreenRouteProp>();
  const { clothingItem } = route.params;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [season, setSeason] = useState('');
  const [storage_location, setStorageLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [link, setLink] = useState('');
  const [purchase_date, setPurchaseDate] = useState('');
  const [washing_method, setWashingMethod] = useState('');

  useEffect(() => {
    if (clothingItem) {
      setName(clothingItem.name || '');
      setCategory(clothingItem.category || '');
      setColor(clothingItem.color || '');
      setImageUrl(clothingItem.image_url || '');
      setTags(clothingItem.tags?.join(', ') || '');
      setSeason(clothingItem.season || '');
      setStorageLocation(clothingItem.storage_location || '');
      setBrand(clothingItem.brand || '');
      setPrice(clothingItem.price?.toString() || '');
      setSize(clothingItem.size || '');
      setLink(clothingItem.link || '');
      setPurchaseDate(clothingItem.purchase_date || '');
      setWashingMethod(clothingItem.washing_method || '');
    }
  }, [clothingItem]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const fileName = result.assets[0].uri.split('/').pop();
      const newPath = FileSystem.documentDirectory + fileName;
      try {
        await FileSystem.moveAsync({ from: result.assets[0].uri, to: newPath });
        setImageUrl(newPath);
      } catch (e) {
        console.error("Error moving image", e);
        alert('图片处理失败');
      }
    }
  };

  const handleUpdate = async () => {
    const updatedItem: ClothingItem = {
      ...clothingItem,
      name,
      category,
      color,
      image_url,
      tags: tags.split(',').map(tag => tag.trim()),
      updated_at: new Date().toISOString(),
      season,
      storage_location,
      brand,
      price: parseFloat(price) || undefined,
      size,
      link,
      purchase_date,
      washing_method,
    };

    try {
      const existingClothes = await AsyncStorage.getItem('wardrobe');
      const clothes: ClothingItem[] = existingClothes ? JSON.parse(existingClothes) : [];
      const updatedClothes = clothes.map(item =>
        item.id === clothingItem.id ? updatedItem : item
      );
      await AsyncStorage.setItem('wardrobe', JSON.stringify(updatedClothes));
      navigation.goBack();
    } catch (error) {
      console.error('更新衣物数据失败:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>编辑衣物信息</Title>
          
          {image_url ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image_url }} style={styles.image} />
              <View style={styles.imageActions}>
                <IconButton icon="pencil" onPress={pickImage} />
                <IconButton icon="delete" onPress={() => setImageUrl('')} />
              </View>
            </View>
          ) : (
            <Button icon="camera" mode="contained" onPress={pickImage} style={styles.button}>
              选择图片
            </Button>
          )}

          <TextInput label="名称" value={name} onChangeText={setName} style={styles.input} />
          <TextInput label="类别" value={category} onChangeText={setCategory} style={styles.input} />
          <TextInput label="颜色" value={color} onChangeText={setColor} style={styles.input} />
          <TextInput label="标签 (用逗号分隔)" value={tags} onChangeText={setTags} style={styles.input} />
          <TextInput label="季节" value={season} onChangeText={setSeason} style={styles.input} />
          <TextInput label="存放位置" value={storage_location} onChangeText={setStorageLocation} style={styles.input} />
          <TextInput label="品牌" value={brand} onChangeText={setBrand} style={styles.input} />
          <TextInput label="价格" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
          <TextInput label="尺寸" value={size} onChangeText={setSize} style={styles.input} />
          <TextInput label="链接" value={link} onChangeText={setLink} style={styles.input} />
          <TextInput label="购买日期" value={purchase_date} onChangeText={setPurchaseDate} style={styles.input} />
          <TextInput label="洗涤方式" value={washing_method} onChangeText={setWashingMethod} style={styles.input} />
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleUpdate} style={styles.button}>
            更新
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            取消
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 8,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    margin: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default EditClothingScreen;
