import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Alert, ImageSourcePropType } from "react-native";
import RealTimeData from './Coins';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface StoreProps {
  session: Session;
  setCurrentAccessory: (wearImage: any) => void;
}

interface Item {
  id: number;
  itemName: ImageSourcePropType;
  price: number;
  isBought: boolean;
  wearImage: ImageSourcePropType; 
}

const Store: React.FC<StoreProps> = ({ session, setCurrentAccessory }) => {
  return (
    <View style={{ backgroundColor: '#FFEDDC' }}>
      <View style={styles.rightButtonContainer}>
        <RealTimeData />
      </View>
      <ScrollView style={styles.storeContainer}>
        <Header />
        <Items session={session} setCurrentAccessory={setCurrentAccessory} />
      </ScrollView>
    </View>
  );
};

const Header: React.FC = () => {
  return (
    <View>
      <Text style={styles.Heading}>Store</Text>
    </View>
  );
};

interface ItemsProps {
  session: Session;
  setCurrentAccessory: (wearImage: any) => void;
}

const Items: React.FC<ItemsProps> = ({ session, setCurrentAccessory }) => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, itemName: require('../assets/assets/accessories/RedCollar.png'), price: 10, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeARedCollar.png') },
    { id: 2, itemName: require('../assets/assets/accessories/Yarn.png'), price: 10, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeAYarn.png') },
    { id: 3, itemName: require('../assets/assets/accessories/Frog.png'), price: 10, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeAFrog.png') },
    { id: 4, itemName: require('../assets/assets/accessories/GreenBandana.png'), price: 20, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeAGreenBandana.png') },
    { id: 5, itemName: require('../assets/assets/accessories/Scarf.png'), price: 25, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeAScarf.png') },
    { id: 6, itemName: require('../assets/assets/accessories/YellowBandana.png'), price: 20, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeAYellowBandana.png') },
    { id: 7, itemName: require('../assets/assets/accessories/CoolCat.png'), price: 30, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeACoolCat.png') },
    { id: 8, itemName: require('../assets/assets/accessories/Balloon.png'), price: 20, isBought: false, wearImage: require('../assets/assets/AwakeCatWithAccessories/OrangeABalloon.png') },
  ]);

  const [numCoins, setNumCoins] = useState<number>(0);

  useEffect(() => {
    const fetchCoins = async () => {
      const { data, error } = await supabase
        .from('coins')
        .select('coins')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching coins:', error);
      } else {
        setNumCoins(data.coins);
      }
    };

    const fetchUserItems = async () => {
      const { data, error } = await supabase
        .from('user_items')
        .select('item_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching user items:', error);
      } else {
        const boughtItemIds = data.map((item: any) => item.item_id);
        const updatedItems = items.map(item => ({
          ...item,
          isBought: boughtItemIds.includes(item.id)
        }));
        setItems(updatedItems);
      }
    };

    fetchCoins();
    fetchUserItems(); 
  }, [session.user.id]);

  const fetchCoins = async () => {
    const { data, error } = await supabase
      .from('coins')
      .select('coins')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching coins:', error);
    } else {
      setNumCoins(data.coins);
    }
  };
  
  const handleBuy = async (id: number, price: number) => {
    if (numCoins >= price) {
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, isBought: true } : item
      );
      setItems(updatedItems);

      const updatedCoins = numCoins - price;
      setNumCoins(updatedCoins);

      await supabase
      .from('coins')
      .update({ coins: updatedCoins })
      .eq('id', session.user.id);

      // Upsert the purchase status in 'user_items' table
    const { error } = await supabase
      .from('user_items')
      .update({ user_id: session.user.id, item_id: id, is_bought: true});

    if (error) {
      console.error('Error updating item status:', error);
    } else {
      fetchCoins(); 
    }
      
    } else {
      Alert.alert('Insufficient coins', 'You do not have enough coins to buy this item.');
    }
  };

  const handleWear = (wearImage: any) => {
    setCurrentAccessory(wearImage);
  };

  return (
    <View>
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          onBuy={() => handleBuy(item.id, item.price)}
          onWear={() => handleWear(item.wearImage)}
        />
      ))}
    </View>
  );
};

interface ItemProps {
  item: Item;
  onBuy: () => void;
  onWear: () => void;
}

const Item: React.FC<ItemProps> = ({ item, onBuy, onWear }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={{ flexDirection: 'row' }}>
        <Image source={item.itemName} style={styles.image} />
        {!item.isBought ? (
          <TouchableOpacity onPress={onBuy} style={styles.button}>
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onWear} style={styles.button}>
            <Text style={styles.buttonText}>Wear</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.priceText}>{item.price} coins</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  storeContainer: {
    borderWidth: 2,
    borderRadius: 20,
    borderColor: '#f0be8c',
    backgroundColor: '#f0be8c',
    margin: 15,
  },
  Heading: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#f0be8c',
    borderRadius: 20,
    backgroundColor: '#f0be8c',
    color: '#ffffff',
    textAlign: 'center',
  },
  rightButtonContainer: {
    paddingRight: 5,
    paddingTop: 10,
    alignSelf: 'flex-end',
  },
  text: {
    fontSize: 20,
    lineHeight: 21,
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 20,
    color: '#ffa857',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 130,
  },
  image: {
    height: 150,
    width: 150,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    margin: 15,
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#feabab',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 50,
    marginRight: 20,
    marginVertical: 50,
  },
  buttonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default Store;