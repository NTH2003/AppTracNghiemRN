import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TopicCard = ({ topic, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.title,
        selected && styles.selectedTitle
      ]}>
        {topic.name}
      </Text>
      {topic.description && (
        <Text style={[
          styles.description,
          selected && styles.selectedDescription
        ]}>
          {topic.description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedContainer: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedTitle: {
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  selectedDescription: {
    color: '#fff',
  },
});

export default TopicCard; 