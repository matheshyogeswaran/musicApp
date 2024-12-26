import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';

const Signin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Sign-In
  const handleSignIn = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('Signed in:', user.email);
        Alert.alert('Success', 'Signed in successfully!');
        navigation.navigate('HOME_SCREEN'); // Navigate to the Home screen
      })
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          Alert.alert('Error', 'No user found with this email!');
        } else if (error.code === 'auth/wrong-password') {
          Alert.alert('Error', 'Incorrect password!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'Invalid email address!');
        } else {
          Alert.alert('Error', error.message);
        }
        console.error('Sign-In Error:', error);
      });
  };

  // Navigate to Sign-Up Screen
  const handleGoToSignUp = () => {
    navigation.navigate('SIGN_UP');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={text => setPassword(text)}
        secureTextEntry
      />

      <Button title="Sign In" onPress={handleSignIn} />

      <TouchableOpacity onPress={handleGoToSignUp} style={styles.signup}>
        <Text style={styles.signupText}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signin;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  signup: {
    marginTop: 15,
  },
  signupText: {
    color: 'blue',
  },
});
