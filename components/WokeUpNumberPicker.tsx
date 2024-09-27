import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface WokeUpNumberPickerProps {
  session: Session;
  date: Date;
}

const WokeUpNumberPicker: React.FC<WokeUpNumberPickerProps> = ({ session, date }) => {
  const [numTimes, setNumTimes] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const wokeUpNumberOptions = Array.from(Array(11), (_, i) => i.toString());

  const fetchNumTimesWokeUp = async () => {
    try {
      const { data, error } = await supabase
        .from('sleep_diary')
        .select('num_times_woke_up')
        .eq('user_id', session.user.id)
        .eq('date', date.toISOString());

      if (error) {
        console.error(error);
        return;
      }

      if (data.length > 0) {
        setNumTimes(data[0].num_times_woke_up);
      } else { 
        setNumTimes(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNumTimesWokeUp();
  }, [date, session.user.id]);

  const handleNumTimesWokeUp = (itemValue: string) => {
    setNumTimes(itemValue);
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

  const updateSleepDiary = async (numTimes: string) => {
    try {
      if (await checkIfSleepDiaryExists(session.user.id, date)) {
        console.log('The user-date combination exists!');
        const { data, error } = await supabase
          .from('sleep_diary')
          .update({
            num_times_woke_up: numTimes
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
            num_times_woke_up: numTimes
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
        {numTimes === null? 
          <Text>How many times have I woken up at night?</Text> : (
          numTimes === '0'? 
          <Text style={{ fontWeight: 'bold' }}>
            I did not wake up in the night.
          </Text>
          : (
          <Text>
            I have woken up <Text style={{ fontWeight: 'bold' }}>{numTimes} time{numTimes === "1" || numTimes === "0" ? '' : 's'}</Text> last night.
          </Text>
          )
        )}
        </Text>
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Select Number of Times Woken Up</Text>
          <Picker
            selectedValue={numTimes}
            onValueChange={handleNumTimesWokeUp}
            style={{ width: 150 }}
          >
            {wokeUpNumberOptions.map((numTimes) => (
              <Picker.Item key={numTimes} label={`${numTimes}`} value={numTimes} />
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

export default WokeUpNumberPicker;