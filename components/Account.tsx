import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  //If session changes, we run the useEffect again
  useEffect(() => {
    if (session) getProfile()
  }, [session]) // dependency array specifies when the effect should re-run. 
                //In this case, the effect will run only when the session value changes.

  //get the details from supabase and put it into the state
  async function getProfile() {
    try {
      setLoading(true)
      //Throws and error if there is no user for the session
      if (!session?.user) throw new Error('No user on the session!')

        //Fetch a single record from the profiles table in Supabase based on the current user's ID stored in the session.
      const { data, error, status } = await supabase
        .from('profiles') //access profiles table from supabase
        .select(`username, website, avatar_url`) 
        .eq('id', session?.user.id) //check if current id is equals to the session user id
        .single()  
      if (error && status !== 406) {
        throw error
      }
      //check that if data exist, set "state" to the loaded information
      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }

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

  async function updateProfile({ //takes in object with three properties and of same type
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      //Sets a loading state to true at the beginning of the try block to indicate that an asynchronous operation is in progress
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      //upsert request to the profiles table in the Supabase database
      //upset - inserts a new row if it does not exist, or updates the existing row if it does
      //await - ensures that the code waits for the Supabase operation to complete before moving on
      //error - the response destructures the error property from the result of the upsert operation.
      const { error } = await supabase.from('profiles').upsert(updates)

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
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Website" value={website || ''} onChangeText={(text) => setWebsite(text)} />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  )
}

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
})