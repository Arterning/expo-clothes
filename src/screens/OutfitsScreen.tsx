import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
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

const DraggableItem: React.FC<{
  item: ClothingItem;
  index: number;
  onPositionChange: (id: string, x: number, y: number) => void;
}> = ({ item, index, onPositionChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const itemPositionRef = useRef({ x: item.position?.x || 0, y: item.position?.y || 0 });

  const handleStart = (pageX: number, pageY: number) => {
    setIsDragging(true);
    startPositionRef.current = {
      x: pageX - (item.position?.x || 0),
      y: pageY - (item.position?.y || 0)
    };
    itemPositionRef.current = {
      x: item.position?.x || 0,
      y: item.position?.y || 0
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

  // 处理触摸事件
  const handleTouchStart = (e: any) => {
    const touch = e.nativeEvent.touches[0];
    handleStart(touch.pageX, touch.pageY);
  };

  const handleTouchMove = (e: any) => {
    const touch = e.nativeEvent.touches[0];
    handleMove(touch.pageX, touch.pageY);
  };

  // 处理鼠标事件
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
        styles.canvasItem,
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
        style={styles.canvasImage}
        resizeMode="contain"
      />
    </View>
  );
};

const OutfitsScreen = () => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('未分类');
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    loadClothesFromStorage();
  }, []);

  const handlePositionChange = (id: string, x: number, y: number) => {
    setSelectedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, position: { x, y } } : item
      )
    );
  };

  // 加载衣橱数据
  useEffect(() => {
    loadClothesFromStorage();
  }, []);

  const loadClothesFromStorage = async () => {
    try {
      const savedClothes = await AsyncStorage.getItem('wardrobe');
      if (savedClothes) {
        setClothes(JSON.parse(savedClothes));
      }
    } catch (error) {
      console.error('加载衣物数据失败:', error);
    }
  };

  // 分类列表
  const categories = ['上衣', '裤子', '裙子', '鞋子', '包包', '配饰', '未分类'];

  // 添加衣物到画布
  const addItemToCanvas = (item: ClothingItem) => {
    setSelectedItems([
      ...selectedItems,
      { ...item, position: { x: 0, y: 0 } }
    ]);
  };

  // 渲染分类选择器
  const renderCategories = () => (
    <ScrollView horizontal style={styles.categoryScroll}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => setSelectedCategory(category)}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.selectedCategory,
          ]}
        >
          <Text style={selectedCategory === category ? styles.selectedCategoryText : styles.categoryText}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // 渲染衣物列表
  const renderClothingList = () => (
    <ScrollView horizontal style={styles.clothingScroll}>
      {clothes
        .filter((item) => item.category === selectedCategory)
        .map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.clothingItem}
            onPress={() => addItemToCanvas(item)}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={styles.clothingImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
    </ScrollView>
  );

  // 渲染画布
  // 修改渲染画布的函数
  const renderCanvas = () => (
    <View style={styles.canvas}>
      {selectedItems.map((item, index) => (
        <DraggableItem
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          onPositionChange={handlePositionChange}
        />
      ))}
    </View>
  );

  const saveToJournal = async () => {
    try {
      const journalEntry = {
        id: Date.now().toString(),
        type: 'outfit',
        items: selectedItems,
        createdAt: new Date().toISOString(),
        preview: null // 这里可以后续添加预览图功能
      };

      const savedJournal = await AsyncStorage.getItem('fashion_journal');
      const journalEntries = savedJournal ? JSON.parse(savedJournal) : [];
      journalEntries.push(journalEntry);
      await AsyncStorage.setItem('fashion_journal', JSON.stringify(journalEntries));
      alert('搭配已保存到穿搭日记');
    } catch (error) {
      console.error('保存到穿搭日记失败:', error);
      alert('保存失败');
    }
  };

  return (
    <View style={styles.container}>
      {renderCanvas()}
      <View style={styles.bottomPanel}>
        {renderCategories()}
        {renderClothingList()}
        <Button 
          mode="contained" 
          onPress={saveToJournal}
          style={styles.saveButton}
          disabled={selectedItems.length === 0}
        >
          保存到穿搭日记
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  bottomPanel: {
    height: 200,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  categoryScroll: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    padding: 10,
    marginHorizontal: 5,
    height: 40,
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 5,
  },
  selectedCategory: {
    backgroundColor: '#FF69B4',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  clothingScroll: {
    padding: 10,
  },
  clothingItem: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  clothingImage: {
    width: '100%',
    height: '100%',
  },
  canvasItem: {
    position: 'absolute',
    width: 150,
    height: 150,
    zIndex: 1,
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    margin: 10,
    backgroundColor: '#FF69B4'
  }
});

export default OutfitsScreen;