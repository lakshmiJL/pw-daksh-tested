import React from 'react';
import { TextInput,StyleSheet } from 'react-native';
const CustomInput= ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType='default',
})=>{
    return(
        <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor='#aaa'
        autoCapitalise="none"
        />
    )
}
const styles=StyleSheet.create({
    input:{
        width:'80%',
        padding:15,
        marginVertical:10,
        backgroundColor:'#fff',
        borderRadius:8,
        borderWidth:1,
        borderColor:"#fff",
        fontSize:16,
    },
})
export default CustomInput;