import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type MedicationsProp = {
  session: Session;
  date: Date;
};

const Medications: React.FC<MedicationsProp> = ({ session, date }) => {
  const [medications, setMedications] = useState('');

  useEffect(() => {
    fetchMedications();
  }, [date]);

  const fetchMedications = async () => {
    const { data, error } = await supabase
      .from('sleep_diary')
      .select('medications')
      .eq('user_id', session.user.id)
      .eq('date', date.toISOString());

    if (error) {
      console.error(error);
      return; 
    } else if (data && data[0] && data[0].medications) {
      setMedications(data[0].medications);
    } else {
      setMedications('')
    }
  };

  const handleMedicationsChange = async (text: string) => {
    setMedications(text);
    await updateSleepDiary(text);
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

  const updateSleepDiary = async (medications: string) => {
    try {
      if (await checkIfSleepDiaryExists(session.user.id, date)) {
        console.log('The user-date combination exists!');
        const { data, error } = await supabase
        .from('sleep_diary')
        .update({
          medications: medications
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
            medications: medications
          });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medications:</Text>
      <TextInput
        style={styles.input}
        value={medications}
        onChangeText={handleMedicationsChange}
        placeholder="Input any medicine that you consumed today..."
        multiline={true}
        numberOfLines={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  label: {
    marginBottom: 10,
  },
  input: {
    height: 150,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 20,
  },
});

export default Medications;