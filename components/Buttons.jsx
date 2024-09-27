import { View, StyleSheet, Text } from "react-native";
import { useState } from "react"; 
import SleepButton from "./ButtonComponent/SleepButton";
import SleepStatsButton from "./ButtonComponent/SleepStatsButton";
import StoreButton from "./ButtonComponent/StoreButton";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Buttons = () => {
  
    const[numCoins, setCoins] = useState(0);
    const[hasSleep, setSleep] = useState(false);

    const buttons = () => [
      { name: "Sleep", path: "/home" }, 
      { name: "SleepStats", path: "/maintenance"}, 
      { name: "Store", path: "/store"}, 
    ];

    const handleMaintenance = () => {
        setHasShownUnderMaintenance(true);
        console.log("Under Construction");
    };

    return (
      <View style={styles.leftButtonsContainer}>
        <SleepButton  
          hasSleep={hasSleep}
          setSleep={setSleep}
          setCoins={setCoins}
          numCoins={numCoins}/>
          <Link href="/maintenance">
            <SleepStatsButton/>
          </Link>
          <Link href="/store">
            <StoreButton/>
          </Link>
      </View>
    ); 
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 10,
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
});  

export default Buttons; 