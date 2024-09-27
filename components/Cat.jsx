import { View, Text, Image, StyleSheet } from 'react-native'; 
import React from 'react';

const Cat = ({ currentAccessory }) => {
  return (
      <View>
          <Image source={currentAccessory 
            ? currentAccessory 
            : require('../assets/assets/OrangeCatAwake.png')} 
          style={styles.catImage} 
          />
      </View>
  );
};

const styles = StyleSheet.create({
  catImage: {
    alignSelf:"center",
    justifyContent:"center",
    resizeMode: 'contain',
    marginTop: 150,
    maxWidth: 230, 
    height: 230,
  }, 
}); 

export default Cat; 