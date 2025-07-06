import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, Searchbar, Card, Chip, Portal, Modal, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingItem } from '../types';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

const WardrobeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [allClothes, setAllClothes] = useState<ClothingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  useEffect(() => {
    if (isFocused) {
      loadClothesFromStorage();
    }
  }, [isFocused]);

  const loadClothesFromStorage = async () => {
    try {
      const savedClothes = await AsyncStorage.getItem('wardrobe');
      if (savedClothes) {
        setAllClothes(JSON.parse(savedClothes));
      }
    } catch (error) {
      console.error('加载衣物数据失败:', error);
    }
  };

  const handleDelete = async (itemToDelete: ClothingItem) => {
    Alert.alert(
      "删除衣物",
      `你确定要删除 "${itemToDelete.name}" 吗?`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          onPress: async () => {
            try {
              // 1. Delete image from file system
              if (itemToDelete.image_url) {
                await FileSystem.deleteAsync(itemToDelete.image_url, { idempotent: true });
              }
              // 2. Remove item from AsyncStorage
              const updatedClothes = allClothes.filter(item => item.id !== itemToDelete.id);
              await AsyncStorage.setItem('wardrobe', JSON.stringify(updatedClothes));
              // 3. Update state
              setAllClothes(updatedClothes);
              setModalVisible(false);
              setSelectedItem(null);
            } catch (error) {
              console.error('删除衣物失败:', error);
              alert('删除失败，请重试');
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEdit = (itemToEdit: ClothingItem) => {
    setModalVisible(false);
    navigation.navigate('Wardrobe', { screen: 'EditClothing', params: { clothingItem: itemToEdit } });
  };

  const handleLongPress = (item: ClothingItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const filteredClothes = useMemo(() => {
    if (!searchQuery) {
      return allClothes;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allClothes.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(lowercasedQuery);
      const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery));
      const categoryMatch = item.category?.toLowerCase().includes(lowercasedQuery);
      return nameMatch || tagMatch || categoryMatch;
    });
  }, [allClothes, searchQuery]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索衣物..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <ScrollView>
        <View style={styles.grid}>
          {filteredClothes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.cardContainer}
              onPress={() => navigation.navigate('Wardrobe', { screen: 'ClothingDetail', params: { clothingItem: item } })}
              onLongPress={() => handleLongPress(item)}
            >
              <Card>
                <Card.Cover source={{ uri: item.image_url }} style={styles.cardImage} />
                <Card.Content>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.name || '未命名'}</Text>
                  <View style={styles.chipContainer}>
                    {item.tags?.slice(0, 2).map(tag => (
                      <Chip key={tag} style={styles.chip} small>{tag}</Chip>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Button icon="pencil" mode="contained" onPress={() => selectedItem && handleEdit(selectedItem)} style={styles.modalButton}>
            编辑
          </Button>
          <Button icon="delete" mode="contained" onPress={() => selectedItem && handleDelete(selectedItem)} style={styles.modalButton} buttonColor="#B00020">
            删除
          </Button>
          <Button mode="outlined" onPress={() => setModalVisible(false)}>
            取消
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Wardrobe', { screen: 'AddClothing' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchbar: {
    margin: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  cardContainer: {
    width: '50%',
    padding: 4,
  },
  cardImage: {
    height: 150,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 40,
    borderRadius: 8,
  },
  modalButton: {
    marginBottom: 10,
  },
});

export default WardrobeScreen;