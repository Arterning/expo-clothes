import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { Text, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JournalEntry {
  id: string;
  type: 'outfit' | 'occasion';
  items: any[];
  createdAt: string;
  preview: string | null;
}

const CalendarScreen = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      const savedJournal = await AsyncStorage.getItem('fashion_journal');
      if (savedJournal) {
        const entries = JSON.parse(savedJournal);
        setJournalEntries(entries.sort((a: JournalEntry, b: JournalEntry) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('加载穿搭日记失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.grid}>
          {journalEntries.map(entry => (
            <TouchableOpacity
              key={entry.id}
              onPress={() => {
                setSelectedEntry(entry);
                setModalVisible(true);
              }}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.dateText}>{formatDate(entry.createdAt)}</Text>
                  <View style={styles.previewContainer}>
                    {entry.items.map((item, index) => (
                      <Image
                        key={index}
                        source={{ uri: item.imageUri }}
                        style={styles.previewImage}
                        resizeMode="contain"
                      />
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEntry && (
              <View style={styles.detailContainer}>
                <Text style={styles.dateText}>
                  {formatDate(selectedEntry.createdAt)}
                </Text>
                <ScrollView>
                  <View style={styles.itemsContainer}>
                    {selectedEntry.items.map((item, index) => (
                      <Image
                        key={index}
                        source={{ uri: item.imageUri }}
                        style={styles.detailImage}
                        resizeMode="contain"
                      />
                    ))}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text>关闭</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  grid: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 4,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    margin: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  detailContainer: {
    flex: 1,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  detailImage: {
    width: 150,
    height: 150,
    margin: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});

export default CalendarScreen;