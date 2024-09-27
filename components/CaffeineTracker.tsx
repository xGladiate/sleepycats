import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface CaffeineConsumptionTimePickerProps {
  session: Session;
  date: Date;
}

const caffeineConsumptionLabels = {
  0: 'Morning',
  1: 'Afternoon',
  2: 'Evening',
  3: 'Not Applicable', 
};

const CaffeineConsumptionTimePicker: React.FC<CaffeineConsumptionTimePickerProps> = ({ session, date }) => {
  const [caffeineConsumptionTime, setCaffeineConsumptionTime] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const caffeineConsumptionOptions = Array.from(Array(4), (_, i) => i.toString());

  const fetchCaffeineConsumptionTime = async () => {
    try {
      const { data, error } = await supabase
        .from('sleep_diary')
        .select('caffeine_consumption_time')
        .eq('user_id', session.user.id)
        .eq('date', date.toISOString());
  
      if (error) {
        console.error(error);
        return;
      }
  
      if (data.length > 0 && data[0].caffeine_consumption_time !== null) {
        setCaffeineConsumptionTime(data[0].caffeine_consumption_time);
      } else {
        setCaffeineConsumptionTime(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCaffeineConsumptionTime();
  }, [date, session.user.id]);

  const handleCaffeineConsumptionTimeChange = (itemValue: string) => {
    setCaffeineConsumptionTime(itemValue); 
    updateSleepDiary(itemValue);
  };

  const checkIfSleepDiaryExists = async (user_id: string, date: Date) => {
    const { data, error } = await supabase
      .from('sleep_diary')
      .select('user_id, date')
      .eq('user_id', user_id)
      .eq('date', date.toISOString());

    if (error) {
      console.error(error);
      return false;
    }

    return data.length > 0;
  };

  const updateSleepDiary = async (caffeineConsumptionTime: string) => {
    try {
      if (await checkIfSleepDiaryExists(session.user.id, date)) {
        console.log('The user-date combination exists!');
        const { data, error } = await supabase
          .from('sleep_diary')
          .update({
            caffeine_consumption_time: caffeineConsumptionTime,
          })
          .eq('user_id', session.user.id)
          .eq('date', date.toISOString());
        if (error) {
          console.error(error);
        }
      } else {
        console.log('The user-date combination does not exist.');
        await supabase
          .from('sleep_diary')
          .insert({
            user_id: session.user.id,
            date: date.toISOString(),
            caffeine_consumption_time: caffeineConsumptionTime,
          });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePress = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={handlePress}>
        <Text>
          {caffeineConsumptionTime === null ? 
              <Text>When was the last time you consume caffeine today? eg. coffee/tea</Text> : (
            caffeineConsumptionTime === "3" ? (
              <Text style={{ fontWeight: 'bold' }}>I did not drink caffeine today.</Text> 
            ) : (
              <Text>
                I last drank caffeine in the <Text style={{ fontWeight: 'bold' }}>{caffeineConsumptionLabels[caffeineConsumptionTime]}</Text> today.
              </Text>
            )
          )}
        </Text>
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Select Caffeine Consumption Time</Text>
          <Picker
            selectedValue={caffeineConsumptionTime === null ? '' : caffeineConsumptionTime}
            onValueChange={(itemValue) => handleCaffeineConsumptionTimeChange(itemValue)}
            style={{ width: 150 }}
          >
            {caffeineConsumptionOptions.map((time) => (
              <Picker.Item key={time} label={`${caffeineConsumptionLabels[time]}`} value={time} />
            ))}
          </Picker>
          <TouchableOpacity onPress={handleModalClose}>
            <Text>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CaffeineConsumptionTimePicker;