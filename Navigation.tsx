import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';

export type RootStackParamList = {
  Home: { session: Session }; // Adjust 'session' type as per your actual session object type
  'Sleep Statistics': { session: Session };
  Store: { session: Session }; // Adjust 'session' type as per your actual session object type
  Authentication: undefined; // Define Authentication screen with no parameters
};


export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type StatsProps = NativeStackScreenProps<RootStackParamList, 'Sleep Statistics'>;
export type StoreProps = NativeStackScreenProps<RootStackParamList, 'Store'>;
