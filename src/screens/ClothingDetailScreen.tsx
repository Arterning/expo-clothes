import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Title, Card, Chip, Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ClothingItem } from '../types';

type ClothingDetailScreenRouteProp = RouteProp<{ params: { clothingItem: ClothingItem } }, 'params'>;

const ClothingDetailScreen = () => {
  const route = useRoute<ClothingDetailScreenRouteProp>();
  const { clothingItem } = route.params;

  const renderDetailRow = (label: string, value?: string | number) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: clothingItem.image_url }} />
        <Card.Content>
          <Title style={styles.title}>{clothingItem.name || '未命名'}</Title>
          <View style={styles.chipContainer}>
            {clothingItem.tags?.map(tag => (
              <Chip key={tag} style={styles.chip} icon="tag">{tag}</Chip>
            ))}
          </View>
          <Divider style={styles.divider} />
          {renderDetailRow('类别', clothingItem.category)}
          {renderDetailRow('颜色', clothingItem.color)}
          {renderDetailRow('季节', clothingItem.season)}
          {renderDetailRow('品牌', clothingItem.brand)}
          {renderDetailRow('尺寸', clothingItem.size)}
          {renderDetailRow('价格', clothingItem.price)}
          {renderDetailRow('购买日期', clothingItem.purchase_date)}
          {renderDetailRow('存放位置', clothingItem.storage_location)}
          {renderDetailRow('洗涤方式', clothingItem.washing_method)}
          {renderDetailRow('链接', clothingItem.link)}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: '#e0e0e0',
  },
  divider: {
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
});

export default ClothingDetailScreen;
