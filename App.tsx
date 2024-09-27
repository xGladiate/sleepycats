import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Home from './components/Home'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamList } from './type'
import HomeScreen from './components/Home'

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session || !session.user) {
    // Render a loading screen or a login screen
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Authentication" component={Auth} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" options={{ headerShown: false }}>
        {props => <HomeScreen {...props} session={session} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}