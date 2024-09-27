import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
import uuid from 'react-native-uuid';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SleepSessionPickerProps {
  session: Session;
  date: Date;
  onAddSleepSession: () => void;
}

const SleepSessionPicker: React.FC<SleepSessionPickerProps> = ({ session, date, onAddSleepSession }) => {
  const [showModal, setShowModal] = useState(false);
  const [sleepHour, setSleepHour] = useState(1);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [sleepAmPm, setSleepAmPm] = useState('AM');
  const [wakeHour, setWakeHour] = useState(5);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [wakeAmPm, setWakeAmPm] = useState('AM');
  const [sleepDateAttained, setSleepDateAttained] = useState(new Date());
  const [wakeDateAttained, setWakeDateAttained] = useState(new Date());
  const [showSleepDatePicker, setShowSleepDatePicker] = useState(false);
  const [showWakeDatePicker, setShowWakeDatePicker] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const checkDuplicateSleepTimes = async () => {
    const { data, error } = await supabase.rpc(
      'SELECT sleep_time, wake_time FROM sleep_sessions WHERE user_id = $session.user.id GROUP BY sleep_time, wake_time HAVING COUNT(*) > 0',
      [session.user.id]
    );
  
    if (error) {
      console.error(error);
    } else if (data.length > 0) {
      // throw an alert or handle duplicate sleep times
      alert('Duplicate sleep times found!');
    }
  };

  const handleSleepSessionChange = async () => {
    try {
      const sessionId = uuid.v4().toString();
      const sleepDate = sleepDateAttained;
      sleepDate.setHours(sleepHour);
      sleepDate.setMinutes(sleepMinute);
      sleepDate.setSeconds(0);
  
      const wakeDate = wakeDateAttained;
      wakeDate.setHours(wakeHour);
      wakeDate.setMinutes(wakeMinute);
      wakeDate.setSeconds(0);
  
      const sleepTime = sleepDate.toISOString();
      const wakeTime = wakeDate.toISOString();
      // Check if wake time is after sleep time
      if (wakeDate.getTime() <= sleepDate.getTime()) {
        alert('Wake time must be after sleep time');
        return;
      }

      // Check if dates are at most 1 day apart
      const oneDay = 24 * 60 * 60 * 1000;
      if (Math.abs(wakeDate.getTime() - sleepDate.getTime()) > oneDay) {
        alert('Dates must be at most 1 day apart');
        return;
      }

      //checkDuplicateSleepTimes(); 

      // const existingSession = await supabase
      //   .from('sleep_sessions')
      //   .select('id')
      //   .eq('user_id', session.user.id)
      //   .eq('sleep_date', sleepDate.toISOString().split('T')[0])
      //   .eq('wake_date', wakeDate.toISOString().split('T')[0])
      //   .single();

      // if (existingSession !== null) {
      //   alert('A sleep session with the same date already exists');
      //   return;
      // }

      const { data, error } = await supabase
        .from('sleep_sessions')
        .insert([{ 
            id: sessionId,
            user_id: session.user.id, 
            date: date.toISOString(), 
            sleep_time: sleepTime, 
            wake_time: wakeTime }]);
    
      onAddSleepSession();
  
      if (error) {
        console.error(error);
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
    <View style={styles.container}>
      <TouchableOpacity style={{ marginVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 5,}} onPress={handlePress}>
        <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10}}>
            <MaterialIcons name="add-circle" size={17} color="gray" />
            <Text style={{ fontSize: 17, marginLeft: 5, color: 'gray', }}>Add Sleep Session</Text>
        </View>
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
            <View style={{ marginBottom: 50, borderWidth: 1, borderRadius: 5, borderColor: 'gray' }}>
                <Text style={{ fontSize: 18, margin: 20}}>Select Sleep Session</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Sleep Date & Time:</Text>
              <TouchableOpacity onPress={() => setShowSleepDatePicker(true)} style={{ marginTop: 30, marginBottom: 0 }}>
                <Text style={styles.dateText}>{sleepDateAttained.toLocaleDateString('en-SG').split('T')[0]}</Text>
              </TouchableOpacity>
              {showSleepDatePicker && (
                <DateTimePicker
                  value={sleepDateAttained}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || sleepDateAttained;
                    setSleepDateAttained(currentDate);
                    setShowSleepDatePicker(false);
                  }}
                  style={{ width: '100%', padding: 10 }}
                />
              )}
            </View>
          <View style={styles.pickerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 50 }}>
                <Picker
                selectedValue={sleepHour}
                onValueChange={(itemValue) => setSleepHour(itemValue)}
                style={styles.picker}
                >
                {hours.map((hour) => (
                    <Picker.Item key={hour} label={hour.toString()} value={hour} />
                ))}
                </Picker>
                <Picker
                selectedValue={sleepMinute}
                onValueChange={(itemValue) => setSleepMinute(itemValue)}
                style={styles.picker}
                >
                {minutes.map((minute) => (
                    <Picker.Item key={minute} label={minute.toString().padStart(2, '0')} value={minute} />
                ))}
                </Picker>
                <Picker
                selectedValue={sleepAmPm}
                onValueChange={(itemValue) => setSleepAmPm(itemValue)}
                style={styles.picker}
                >
                <Picker.Item label="AM" value="AM" />
                <Picker.Item label="PM" value="PM" />
                </Picker>
            </View>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Wake Date & Time:</Text>
            <TouchableOpacity onPress={() => setShowWakeDatePicker(true)} style={{ marginTop: 30, marginBottom: 0 }}>
              <Text style={styles.dateText}>{wakeDateAttained.toLocaleDateString('en-SG').split('T')[0]}</Text>
            </TouchableOpacity>
            {showWakeDatePicker && (
              <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              style={{ width: '100%', padding: 10 }}
            />
            )}
          </View>
          <View style={styles.pickerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 50 }}>
                <Picker
                selectedValue={wakeHour}
                onValueChange={(itemValue) => setWakeHour(itemValue)}
                style={styles.picker}
                >
                {hours.map((hour) => (
                    <Picker.Item key={hour} label={hour.toString()} value={hour} />
                ))}
                </Picker>
                <Picker
                selectedValue={wakeMinute}
                onValueChange={(itemValue) => setWakeMinute(itemValue)}
                style={styles.picker}
                >
                {minutes.map((minute) => (
                    <Picker.Item key={minute} label={minute.toString().padStart(2, '0')} value={minute} />
                ))}
                </Picker>
                <Picker
                selectedValue={wakeAmPm}
                onValueChange={(itemValue) => setWakeAmPm(itemValue)}
                style={styles.picker}
                >
                <Picker.Item label="AM" value="AM" />
                <Picker.Item label="PM" value="PM" />
                </Picker>
            </View>
          </View>
            <View style={{ flexDirection: 'row'}}>
                <TouchableOpacity style={styles.saveButton} onPress={() => { handleSleepSessionChange(); handleModalClose(); }}>
                    <Text style={styles.saveButtonText}>Save Sleep Session</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={() => { handleModalClose(); }}>
                    <Text style={styles.saveButtonText}>Exit</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
};

export default SleepSessionPicker;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: 20,
    },
    pickerContainer: {
      alignItems: 'center', 
    },
    dateText: {
      fontSize: 16, 
    },
    picker: {
      width: '33%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 3,
      borderRadius: 5,
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: '#FED8B2',
      padding: 10,
      borderRadius: 5,
      marginHorizontal: 30, 
    },
    exitButton: {
        backgroundColor: '#FED8B2', 
        padding: 10, 
        borderRadius: 5, 
    },
    saveButtonText: {
      fontSize: 18,
      color: 'black',
      marginHorizontal: 10, 
      marginVertical: 5, 
    },
  });

