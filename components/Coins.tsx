import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

const RealTimeData = () => {
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    const fetchInitialCoins = async () => {
      const { data, error } = await supabase
        .from('coins')
        .select('coins')
        .single();

      if (error) {
        console.error('Error fetching initial coins:', error);
      } else {
        setCoins(data?.coins || 0);
      }
    };

    fetchInitialCoins();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Listening to 'UPDATE' events only
          schema: 'public', // The schema you want to listen to
          table: 'coins' // The table you want to listen to
        },
        payload => {
          console.log('Change received!', payload.new.coins);
          setCoins(payload.new.coins);
        }
      )
      .subscribe();

    // Cleanup subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (coins === null) {
    return (
      <View style={styles.button}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.button}>
      <Text style={styles.text}>
        {coins} Coins
      </Text>
    </View>
  );
};

export default RealTimeData;

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.5,
    color: 'white',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
    elevation: 3,
    backgroundColor: 'grey',
  },
});
