import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface IntervalPickerProps {
  session: Session;
  date: Date;

}

const IntervalPicker: React.FC<IntervalPickerProps> = ({ session, date }) => {
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const hoursOptions = Array.from(Array(13), (_, i) => i.toString());
  const minutesOptions = Array.from(Array(60), (_, i) => i.toString());

  const fetchSleepDiary = async () => {
    try {
      const { data, error } = await supabase
       .from('sleep_diary')
       .select('time_taken_to_sleep')
       .eq('user_id', session.user.id)
       .eq('date', date.toISOString());
  
      if (error) {
        console.error(error);
        return;
      }
  
      if (data.length > 0) {
        const [hours, minutes, seconds] = data[0].time_taken_to_sleep.split(':').map(Number);
        console.log(`Updating hours and minutes to ${hours} and ${minutes}`);
        setHours(hours.toString());
        setMinutes(minutes.toString());
      } else {
        setHours(null); 
        setMinutes(null); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSleepDiary();
  }, [date, session.user.id]);

  const handleHoursChange = (itemValue: string) => {
    setHours(itemValue);
    if (minutes === null) {
      setMinutes("0"); 
    }
    updateSleepDiary(itemValue, minutes); 
  };

  const handleMinutesChange = (itemValue: string) => {
    setMinutes(itemValue);
    if (hours === null) {
      setHours("0"); 
    }
    updateSleepDiary(hours, itemValue);
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

  const updateSleepDiary = async (hours: string, minutes: string) => {
    try {
      const intervalString = `${hours} hour ${minutes} minute`; // create an interval string
      if (await checkIfSleepDiaryExists(session.user.id, date)) {
        console.log('The user-date combination exists!');
        const { data, error } = await supabase
        .from('sleep_diary')
        .update({
          time_taken_to_sleep: intervalString
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
            time_taken_to_sleep: intervalString
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
          { hours === null || minutes === null ? 
              <Text>How long did you take to fall asleep?</Text> : (
            hours === "0" && minutes === "0" ? (
              <Text style={{ fontWeight: 'bold', justifyContent: 'center' }}>I slept almost immediately.</Text>
            ) : hours === "0" ? (
              <Text>
                I was awake for{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {minutes} minute{minutes === "1" ? '' : 's'}
                </Text>{' '}
                before I fell asleep last night.
              </Text>
            ) : (
              <Text>
                I was awake for{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {hours === "1" ? `${hours} hour ` : `${hours} hours `}
                  {minutes} minute{minutes === "1" ? '' : 's'}
                </Text>{' '}
                before I fell asleep last night.
              </Text>
            )
          )}

      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Select Interval</Text>
          <View style={{ flexDirection: 'row' }}>
            <Picker
              selectedValue={hours}
              onValueChange={handleHoursChange}
              style={{ width: 150 }}
            >
              {hoursOptions.map((hour) => (
                <Picker.Item key={hour} label={`${hour} hours`} value={hour} />
              ))}
            </Picker>
            <Picker
              selectedValue={minutes}
              onValueChange={handleMinutesChange}
              style={{ width: 150 }}
            >
              {minutesOptions.map((minute) => (
                <Picker.Item key={minute} label={`${minute} minutes`} value={minute} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity onPress={handleModalClose}>
            <Text>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default IntervalPicker;