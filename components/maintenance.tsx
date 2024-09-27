import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("screen");

const MaintenanceMessage = () => {
    return (
        <View style={styles.background}>
            <Image
                source={require('../assets/assets/UnderMaintenanceInterface.png')}
                style={{ width: width, height: height }} 
                />
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MaintenanceMessage;