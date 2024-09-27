import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface ExeriseTimePickerProps {
  session: Session;
  date: Date;
}

const exerciseTimeLabels = {
  0: 'Morning',
  1: 'Afternoon',
  2: 'Evening',
  3: 'Not Applicable', 
};

const ExerciseTimePicker: React.FC<ExeriseTimePickerProps> = ({ session, date }) => {
  const [exerciseTime, setExerciseTime] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const exerciseTimeOptions = Array.from(Array(4), (_, i) => i.toString());

  const fetchExerciseTime = async () => {
    try {
      const { data, error } = await supabase
        .from('sleep_diary')
        .select('exercise_time')
        .eq('user_id', session.user.id)
        .eq('date', date.toISOString());

      if (error) {
        console.error(error);
        return;
      }

      if (data.length > 0) {
        setExerciseTime(data[0].exercise_time);
      } else {
        setExerciseTime(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExerciseTime();
  }, [date, session.user.id]);

  const handleExerciseTimeChange = (itemValue: string) => {
    setExerciseTime(itemValue);
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

  const updateSleepDiary = async (exerciseTime: string) => {
    try {
      if (await checkIfSleepDiaryExists(session.user.id, date)) {
        console.log('The user-date combination exists!');
        const { data, error } = await supabase
          .from('sleep_diary')
          .update({
            exercise_time: exerciseTime,
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
            exercise_time: exerciseTime,
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
          {exerciseTime === null ? 
              <Text>When was the last time you exercised at least 20 mins today?</Text> : (
            exerciseTime === "3" ? (
              <Text style={{ fontWeight: 'bold' }}>I did not exercise at least 20 minutes today.</Text> 
            ) : (
              <Text>
                I last exercise in the <Text style={{ fontWeight: 'bold' }}>{exerciseTimeLabels[exerciseTime]}</Text>.
              </Text>
            )
          )}
        </Text>
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Select Caffeine Consumption Time</Text>
          <Picker
            selectedValue={exerciseTime === null ? '' : exerciseTime}
            onValueChange={(itemValue) => handleExerciseTimeChange(itemValue)}
            style={{ width: 150 }}
          >
            {exerciseTimeOptions.map((time) => (
              <Picker.Item key={time} label={`${exerciseTimeLabels[time]}`} value={time} />
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

export default ExerciseTimePicker;