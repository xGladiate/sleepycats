import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface MorningFeelingPickerProps {
  session: Session;
  date: Date;
}

const morningFeelngLabels = {
  0: 'Fatigue',
  1: 'Somewhat refreshed',
  2: 'Refreshed',
};

const MorningFeelingPicker: React.FC<MorningFeelingPickerProps> = ({ session, date }) => {
  const [morningFeeling, setMorningFeeling] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const morningFeelingOptions = Array.from(Array(3), (_, i) => i.toString());

  const fetchMorningFeeling = async () => {
    try {
      const { data, error } = await supabase
        .from('sleep_diary')
        .select('morning_feeling')
        .eq('user_id', session.user.id)
        .eq('date', date.toISOString());

      if (error) {
        console.error(error);
        return;
      }

      if (data.length > 0) {
        setMorningFeeling(data[0].morning_feeling);
      } else {
        setMorningFeeling(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMorningFeeling();
  }, [date, session.user.id]);

  const handleMorningFeelingChange = (itemValue: string) => {
    setMorningFeeling(itemValue);
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

  const updateSleepDiary = async (morningFeeling: string) => {
    try {
      if (await checkIfSleepDiaryExists(session.user.id, date)) {
        console.log('The user-date combination exists!');
        const { data, error } = await supabase
          .from('sleep_diary')
          .update({
            morning_feeling: morningFeeling
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
            morning_feeling: morningFeeling
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
          {morningFeeling === null ? 'How do you feel when you wake up in the morning?' : (
            <Text>
              I feel <Text style={{ fontWeight: 'bold' }}>{morningFeelngLabels[morningFeeling]}</Text> in the morning.
            </Text>
          )}
        </Text>
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Select Energy Level</Text>
            <Picker
              selectedValue={morningFeeling === null ? '' : morningFeeling.toString()}
              onValueChange={(itemValue) => handleMorningFeelingChange(itemValue)}
              style={{ width: 150 }}
            >
              {morningFeelingOptions.map((moodLevel) => (
                <Picker.Item key={moodLevel} label={`${morningFeelngLabels[moodLevel]}`} value={moodLevel} />
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

export default MorningFeelingPicker;