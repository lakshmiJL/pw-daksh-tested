import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import AuthScreen from '../screens/AuthScreen';
const Stack=createNativeStackNavigator();
export default function AppNavigator({languageSelected}){
    return(
        <Stack.Navigator screenOptions={{headerShown:false}}>
            {!languageSelected &&(
            <>
            <Stack.Screen name="Welcome" component={WelcomeScreen}/>
            <Stack.Screen name='LanguageSelection'
            component={LanguageSelectionScreen}/>
            </>
            )}
            <Stack.Screen name="Auth" component={AuthScreen}/>
        </Stack.Navigator>
    );
}