import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

type NotesProp = {
  session: Session;
  date: Date;
};

const Notes: React.FC<NotesProp> = ({ session, date }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [date]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('sleep_diary')
      .select('notes')
      .eq('user_id', session.user.id)
      .eq('date', date.toISOString());

    if (error) {
      console.error(error);
      return; 
    } else if (data && data[0] && data[0].notes) {
      setNotes(data[0].notes);
    } else {
      setNotes('')
    }
  };

  const handleNotesChange = async (text: string) => {
    setNotes(text);
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

  const updateSleepDiary = async (notes: string) => {
    try {
      if (await checkIfSleepDiaryExists(session.user.id, date)) {
        console.log('The user-date combination exists!');
        const { data, error } = await supabase
        .from('sleep_diary')
        .update({
          notes: notes
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
            notes: notes
          });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sleep Disturbance:</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={handleNotesChange}
        placeholder="Record any sleep disturbance you faced last night..."
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

export default Notes;