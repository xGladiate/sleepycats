import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type ActivitiesBeforeBedProp = {
  session: Session;
  date: Date;
};

const ActivitiesBeforeBedPicker: React.FC<ActivitiesBeforeBedProp> = ({ session, date }) => {
  const [activitiesBeforeBed, setActivitiesBeforeBed] = useState('');

  useEffect(() => {
    fetchActivitiesBeforeBed();
  }, [date]);

  const fetchActivitiesBeforeBed = async () => {
    const { data, error } = await supabase
      .from('sleep_diary')
      .select('activities_before_bed')
      .eq('user_id', session.user.id)
      .eq('date', date.toISOString());

    if (error) {
      console.error(error);
      return; 
    } else if (data && data[0] && data[0].activities_before_bed) {
      setActivitiesBeforeBed(data[0].activities_before_bed);
    } else {
      setActivitiesBeforeBed('')
    }
  };

  const handleActivitiesBeforeBedChange = async (text: string) => {
    setActivitiesBeforeBed(text);
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
          activities_before_bed: activitiesBeforeBed
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
            activities_before_bed: activitiesBeforeBed
          });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Activities an hour before bed:</Text>
      <TextInput
        style={styles.input}
        value={activitiesBeforeBed}
        onChangeText={handleActivitiesBeforeBedChange}
        placeholder="Record the activities you did an hour before bed..."
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

export default ActivitiesBeforeBedPicker;