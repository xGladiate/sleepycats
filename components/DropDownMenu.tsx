import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const data = [
  { label: 'All', value: 'All' },
  { label: 'Morning', value: 'Morning' },
  { label: 'Evening', value: 'Evening' },
];

const isSameDate = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const DropdownComponent = ({ onSelect, selectedDate }) => {
  const currentDate = new Date();
  const isToday = isSameDate(currentDate, selectedDate);
  const [value, setValue] = useState(''); // Initialize with an empty string

  useEffect(() => {
    const initialValue = isToday
     ? currentDate.getHours() < 16
       ? 'Morning'
        : 'Evening'
      : 'All';
    setValue(initialValue);
  }, [selectedDate]); 

  const handleChange = (item) => {
    setValue(item.value);
    onSelect(item.value);
  };

  return (
    <View style={styles.container}>
      <Dropdown
        style={styles.dropdown}
        data={data}
        labelField="label"
        valueField="value"
        value={value}
        onChange={handleChange}
        placeholder="Select time of day"
        selectedTextStyle={{ fontSize: 14, textAlign: 'center' }}
        itemTextStyle={{ fontSize: 14, height: 18 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
  },
  dropdown: {
    width: 88,
    height: 35,
    borderColor: 'gray',
    borderWidth: 1,
  },
});

export default DropdownComponent;