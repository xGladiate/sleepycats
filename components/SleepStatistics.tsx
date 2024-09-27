import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { parseISO, addHours, format, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import IntervalPicker from './IntervalPicker'
import CaffeineConsumptionTimePicker from './CaffeineTracker';
import ExerciseTimePicker from './ExerciseTracker';
import WokeUpNumberPicker from './WokeUpNumberPicker';
import Notes from './SleepDisturbance';
import DropdownMenu from './DropDownMenu';
import MorningFeelingPicker from './MorningFeelingPicker';
import Medications from './Medications';
import AddSleepSession from './AddSleepSession';
import { isSameDay } from 'date-fns';
import ActivitiesBeforeBedPicker from './ActivitiesBeforeBed';

type SleepStatsProp = {
  session: Session;
};

const SleepStats: React.FC<SleepStatsProp> = ({ session }) => {
  const userID: string = session.user.id;
  // const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sleepData, setSleepData] = useState<Array<{ sleep_time: string, wake_time: string }>>([]);
  const [selectedeDropDownValue, setSelectedeDropDownValue] = useState(null);
  const today = new Date();

  const onDayPress = (day: any) => {
    setSelectedDate(new Date(day.dateString));
  };

  const handleSelect = (value) => {
    setSelectedeDropDownValue(value);
  };

  const fetchSleepData = async () => {
    try {
      //Get the start and end time of a day in Singapore
      const startOfSingaporeDay = startOfDay(addHours(selectedDate, 8)); 
      const endOfSingaporeDay = endOfDay(addHours(selectedDate, 8)); 

      /*Get the Sleep Time of the date
          Eg. Slept at 10pm on 10 June and wake up 11am on 11June
          Get this sleep session when 10June is pressed on the calendar*/
      const { data, error } = await supabase
        .from('sleep_sessions')
        .select('sleep_time, wake_time')
        .eq('user_id', userID)
        .gte('sleep_time', startOfSingaporeDay.toISOString()) // Check that the sleep time is after the start of the day
        .lt('sleep_time', endOfSingaporeDay.toISOString()); // Check that the sleep time is before the end of the day

      if (error) {
        console.error('Error fetching sleep data:', error.message);
      } else {
        setSleepData(data || []);
      }
    } catch (error) {
      console.error('Error fetching sleep data:', error);
    }
  };

  //Format time from timestamptz to XX:XX am/pm format
  const formatTime = (time: string) => { 
    try {
      const date = parseISO(time);
      return format(date, 'hh:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  //Filter Sleep Data not to include short intervals of less than 5 minutes
  const filterSleepData = (data: Array<{ sleep_time: string, wake_time: string }>) => {
    return data.filter(item => {
      if (item.wake_time) {
        const sleepTime = parseISO(item.sleep_time);
        const wakeTime = parseISO(item.wake_time);
        const difference = differenceInMinutes(wakeTime, sleepTime);
        return difference >= 5; // Ensure at least 5 minutes difference
      }
      return false; // Do not include items without wake time
    });
  };

  //Style the sleep sessions into proper container & design
  const renderSleepItem = (item: { sleep_time: string, wake_time: string | null }) => (
    <View style={styles.sleepItem} key={item.sleep_time}>
      <Text>Sleep Time: {formatTime(item.sleep_time)}</Text>
      {item.wake_time && <Text>Wake Time: {formatTime(item.wake_time)}</Text>}
    </View>
  );

  //Show the rows added in the additional information, format is based on the variable - renderAdditionalRow
  const additionalRows = [
    { type: 'intervalPicker' },
    { type: 'wokeUpTimes' },
    { type: 'morningFeeling' }, 
    { type: 'sleepDisturbance' },  
    { type: 'caffeine' }, 
    { type: 'exercise' }, 
    { type: 'medications' }, 
    { type: 'activitiesBeforeBed' }, 
  ];

  //Formatter for the Additional Information container
  const renderAdditionalRow = (item: { type: string; }, index: number) => (
    <View style={styles.sleepItem} key={index}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
        {item.type === 'intervalPicker' ? (
          <IntervalPicker 
            session={session} 
            date={selectedDate} 
          />
        ) : item.type === 'morningFeeling' ? (
          <MorningFeelingPicker session={session} date={selectedDate} />
        ) : item.type === 'caffeine' ? (
          <CaffeineConsumptionTimePicker session={session} date={selectedDate} />
        ) : item.type === 'exercise' ? (
          <ExerciseTimePicker session={session} date={selectedDate} />
        ) : item.type === 'activitiesBeforeBed' ? (
          <ActivitiesBeforeBedPicker session={session} date={selectedDate} />
        ) : item.type === 'medications' ? (
          <Medications session={session} date={selectedDate} />
        ) : item.type === 'wokeUpTimes' ? (
          <WokeUpNumberPicker session={session} date={selectedDate} />
        ) : item.type === 'sleepDisturbance' ? (
          <Notes session={session} date={selectedDate} />
        ) : (
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => {}}
          />
        )}
      </View>
    </View>
  );

  const handleSleepSessionRefresh = () => {
    fetchSleepData();
  };

  useEffect(() => {
    //Fetch the Sleep Data and store the sleep data in "sleepData", and store time taken to sleep in "timeTakenToSleep"
    fetchSleepData();
    

  }, [selectedDate, userID]);

  useEffect(() => {
    const currentDate = new Date(selectedDate);
    const hours = today.getHours();
    if ( isSameDay(currentDate, today) ) {
      if (hours < 16) {
        setSelectedeDropDownValue('Morning');
      } else {
        setSelectedeDropDownValue('Evening');
      }
    } else {
      setSelectedeDropDownValue('All'); 
    }
  }, [selectedDate]);

  const morningRows = additionalRows.filter((item) => ['intervalPicker', 'wokeUpTimes', 'morningFeeling', 'sleepDisturbance'].includes(item.type));
  const eveningRows = additionalRows.filter((item) => ['energyLevel', 'caffeine', 'exercise', 'medications', 'activitiesBeforeBed'].includes(item.type));

  const rowsToRender = selectedeDropDownValue === 'Morning' ? morningRows : selectedeDropDownValue == 'Evening' ? eveningRows : additionalRows; 

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{

            [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, marked: true, selectedColor: '#FDC892' },
          }}
          style={{ borderRadius: 5 }}
        />
            {filterSleepData(sleepData).length > 0 && (
              <>
                <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={styles.sectionTitle}>Sleep Session</Text>
                </View>
                {filterSleepData(sleepData).map(renderSleepItem)}
              </>
            )}
            {/* <AddSleepSession session={session} date={selectedDate} onAddSleepSession={handleSleepSessionRefresh}/> */}
            <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={styles.sectionTitle}>Sleep Diary</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <DropdownMenu onSelect={handleSelect} selectedDate={selectedDate}/>
              </View>
            </View>
            {rowsToRender.map(renderAdditionalRow)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FED8B2',
    padding: 20,
  },
  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  }, 
  dropdownMenu: {
    flex: 1, 
  },
  dropdown: {
    position: 'absolute',
    top: 20,
    right: 0,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
    zIndex: 1, 
  },
  item: {
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  dateButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDateTime: {
    marginTop: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
  },
  sleepItem: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  image: {
    width: 370,
    height: 500,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FDC892',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  button: {
    height: 30,
    width: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
  },
  textInput: {
    padding: 10,
    backgroundColor: '#FDC892',
    borderRadius: 5,
    flex: 1,
    fontSize: 16,
  },
  rowButton: {
    padding: 10,
    backgroundColor: '#FDC892',
    borderRadius: 5,
    marginLeft: 10,
  },
  rowButtonText: {
    fontSize: 16,
    color: 'black',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    backgroundColor:'white',
    paddingRight: 30, // to ensure the text is never behind the icon    
  },
});

export default SleepStats;