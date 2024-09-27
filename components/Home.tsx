import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Text, Dimensions, Image } from 'react-native'
import { Session } from '@supabase/supabase-js'
import Cat from "./Cat"; 
import NavigationButton from './ButtonComponent/NavigationButton'
import { startSleepSession, endSleepSession } from './SleepSessions'
import RealTimeData from './Coins'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../type'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Store from './Store'
import SleepStats from './SleepStatistics'

const { width, height } = Dimensions.get("screen");
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  session: Session;
};

const HomeStack = createNativeStackNavigator();

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, session }) => {
  const [currentAccessory, setCurrentAccessory] = useState(null);

  return (
    <HomeStack.Navigator initialRouteName="HomeContent">
      <HomeStack.Screen name="HomeContent" options={{ headerShown: false }}>
        {props => <HomeContent {...props} session={session} currentAccessory={currentAccessory} />}
      </HomeStack.Screen>
      <HomeStack.Screen name="Store">
        {props => <Store {...props} session={session} setCurrentAccessory={setCurrentAccessory}/>}
      </HomeStack.Screen>
      <HomeStack.Screen name="Sleep Statistics">
        {props => <SleepStats {...props} session={session} />}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
};

type HomeContentProps = {
  navigation: any;
  session: Session;
  currentAccessory: any; 
};

const HomeContent: React.FC<HomeContentProps> = ({ navigation, session, currentAccessory }) => {

  const [loading, setLoading] = useState(true)
  const [coins, setCoins] = useState(0); 
  const [isSleeping, setIsSleeping] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Effect to log state changes
  useEffect(() => {
    console.log('isSleeping updated:', isSleeping);
  }, [isSleeping]);

  //If session changes, we run the useEffect again
  useEffect(() => {
    if (session) getCoins()
  }, [session]) // dependency array specifies when the effect should re-run. 
                //In this case, the effect will run only when the session value changes.

  //get the details from supabase and put it into the state
  async function getCoins() {
    try {
      setLoading(true)
      //Throws and error if there is no user for the session
      if (!session?.user) throw new Error('No user on the session!')

        //Fetch a single record from the profiles table in Supabase based on the current user's ID stored in the session.
      const { data, error, status } = await supabase
        .from('coins') //access profiles table from supabase
        .select(`coins`) 
        .eq('id', session?.user.id) //check if current id is equals to the session user id
        .single()  
      if (error && status !== 406) {
        throw error
      }
      //check that if data exist, set "state" to the loaded information
      if (data) {
        setCoins(data.coins)
      } // If no data found, set coins to 0
    } catch (error) {
      //error handling
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      //to indicate that the loading process is complete
      setLoading(false)
    }
  }

  const handleSleepButtonPress = async () => {
    if (isSleeping) {
      try {
        setIsSleeping(false);
        const result = await endSleepSession(sessionId);
        setSessionId('');
        Alert.alert(`You slept for ${result.durationMinutes} minutes and earned ${result.durationMinutes} coins.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error('handleSleepButtonPress: ', error); 
        }
      }
    } else {
      try {
        setIsSleeping(true); 
        const newSessionId = await startSleepSession(session.user.id);
        setSessionId(newSessionId);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message)
        }
      }
    }
  };

  async function updateCoins({ //takes in object with three properties and of same type
    coins
  }: {
    coins: BigInteger
  }) {
    try {
      //Sets a loading state to true at the beginning of the try block to indicate that an asynchronous operation is in progress
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        updated_at: new Date(),
      }

      //upsert request to the profiles table in the Supabase database
      //upset - inserts a new row if it does not exist, or updates the existing row if it does
      //await - ensures that the code waits for the Supabase operation to complete before moving on
      //error - the response destructures the error property from the result of the upsert operation.
      const { error } = await supabase.from('coins').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <View>
      <Image
        source={require('../assets/assets/HomeBackground.png')}
        style={{ width: width, height: height }} 
      />
        <View style={{position: 'absolute', height:'100%', width: '100%'}}>
          <View style={{ height:'35%' }}>
          <View style={styles.buttonContainer}>
            <View style={styles.leftButtonsContainer}>
                <View style={styles.leftButtonsContainer}>
                  <NavigationButton
                    title={isSleeping ? 'Awake' : 'Sleep'}
                    onPress={handleSleepButtonPress}
                  />
                  <NavigationButton
                    title="Sleep Statistics"
                    onPress={() => navigation.navigate('Sleep Statistics', { session })}
                  />
                  <NavigationButton
                    title="Store"
                    onPress={() => navigation.navigate('Store', { session })}
                  />
                  <NavigationButton title="Sign Out" onPress={() => supabase.auth.signOut()} />
                </View>
            </View>
            <View style={styles.rightButtonContainer}>
                <RealTimeData/>
            </View>
          </View>
          </View>
          <View style={{ height:'65%' }}>
            <Cat currentAccessory={currentAccessory}/>
          </View>
        </View>
    </View>
  )
}



export default HomeScreen; 

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  leftButtonsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingLeft: 5,
    paddingVertical: 10, 
  },
  rightButtonContainer: {
    paddingRight: 5,
    paddingTop: 10,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 10,
  },
})