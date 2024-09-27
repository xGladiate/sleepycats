import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';

const NavigationButton = ({ onPress, title }) => {
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        //paddingVertical: 12,
        //paddingHorizontal: 32,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1, 
        elevation: 3,
        backgroundColor: '#F7F7F7',
        borderColor: '#FFA500', 
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        color: '#FFA500',
    },
});

export default NavigationButton;