import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

//Session ID is to keep track of the sleep session to facilitate the joining of sleep and awake timings to attain the total sleep duration

export const startSleepSession = async (userId) => {
  const sleepTime = new Date().toISOString();
  const sessionId = await createSleepSessionInDatabase(userId, sleepTime);
  await AsyncStorage.setItem('sessionId', sessionId); //Utilizes AsyncStorage to persist session IDs locally.
  return sessionId;
};

//MAKE SURE THAT THE USER IS IN UUID INSTEAD OF TEXT!!!!

export const endSleepSession = async (sessionId) => {
    const wakeTime = new Date(); //Get the current time of awake
    const data = await fetchUserIdFromDatabase(sessionId);
    const userId = data.user_id;
    await updateSleepSessionInDatabase(userId, sessionId.toString(), wakeTime.toISOString());
    const sleepData = await fetchSleepTimeFromDatabase(sessionId); //Return the row data corresponding to the session ID
    const sleep = new Date(sleepData.sleep_time); 
    const awake = new Date(sleepData.wake_time); 
    const durationMinutes = await fetchDurationFromDatabase(sessionId);
    await updateCoinsBasedOnSleep(durationMinutes, userId); 
    await AsyncStorage.removeItem('sessionId');
    return { durationMinutes };
  };
//Create a Sleep Session by inserting userId and sleepTime into sleep_sessions table
async function createSleepSessionInDatabase(userId, sleepTime) {
    const sessionId = uuid.v4().toString();  
  try{
  const sleep_date = new Date(sleepTime).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('sleep_sessions')
    .insert({ id: sessionId, user_id: userId, sleep_time: sleepTime, date: sleep_date });
  if (error) throw error;
    return sessionId;
  } catch (error) {
    throw error;
  }
}

//Return the row data from sleep_session through the sessionId
async function fetchSleepTimeFromDatabase(sessionId) {
  const { data, error } = await supabase
    .from('sleep_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  return data;
}

async function fetchUserIdFromDatabase(sessionId) {
    const { data, error } = await supabase
      .from('sleep_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();
    if (error) throw error;
    return data;
}

async function fetchDurationFromDatabase(sessionId) {
  const { data, error } = await supabase
    .from('sleep_sessions')
    .select('total_sleep_duration')
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  console.log('data: ', convertIntervalToMinutes(data.total_sleep_duration)); 
  return convertIntervalToMinutes(data.total_sleep_duration);
}

async function updateSleepSessionInDatabase(userId, sessionId, wakeTime) {
  console.log('session ID at end: ', sessionId); 
  try{
      const { error } = await supabase
      .from('sleep_sessions')
      .update({ id: sessionId, user_id: userId, wake_time: wakeTime })
      .eq('id', sessionId)
      .eq('user_id', userId); 
      if (error) throw error;
      console.log('End session created successfully:', sessionId);
      return sessionId;
  } catch (error) {
      console.error('Error creating End session:', error.message);
  throw error;
  }
}

async function updateCoinsBasedOnSleep(durationMinutes, userId) {
    try {
      // Fetch current coins value for the user
      const { data: currentCoinsData, error: fetchError } = await supabase
        .from('coins')
        .select('coins')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      let currentCoins = currentCoinsData.coins;
  
      // Calculate new total coins
      const newCoins = currentCoins + durationMinutes;
  
      // Perform update operation
      const { error: updateError } = await supabase
        .from('coins')
        .update({ id: userId, coins: newCoins, updated_at: new Date()})
        .eq('id', userId);
        
      if (updateError) {
        throw updateError;
      }
      return newCoins; // Return the updated coins value
    } catch (error) {
      throw error; 
    }
  }

const convertIntervalToMinutes = (interval) => {
  const [hours, minutes, seconds] = interval.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + seconds / 60;
  return Math.round(totalMinutes);
};