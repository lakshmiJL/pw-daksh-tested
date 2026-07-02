import React from 'react';
import {View,Text,StyleSheet,TouchableOpacity, Image} from 'react-native';
const MenuCard=({
    item,
    isVendor,
    onEdit,
    onDelete
})=>{ const vegIndicatorColor=item.isVeg?'#4CAF50':'#E53935'
    return (
        <View style={styles.card}>
            {item.imageURL &&(
                <Image
                style={styles.image}
                source={{uri:item.imageURL}}
                resizeMode="cover"
                />
            )}
            <View style={styles.headerRow}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.indicator,{backgroundColor: vegIndicatorColor}]}></View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        {item.nutrition &&(
                            <View styles={styles.nutritionContainer}>
                                <Text style={styles.nutritionText}>{item.nutrition.calories} Cal</Text>
                                <Text style={styles.nutritionText}>{item.nutrition.protein}g Protein</Text>
                            </View>
                        )} 
                </View>
                {isVendor &&(
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={[styles.actionButton,{backgroundColor:'#FFC107'}]}
                        onPress={()=>onEdit(item)}>
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton,{backgroundColor:'#DC3545'}]}
                        onPress={()=>onDelete(item.id)}>
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    )
}
const styles=StyleSheet.create({
    card:{
        backgroundColor:'#fff',
        padding:15,
        borderRadius:10,
        marginVertical:8,
            marginHorizontal:16,
            shadowColor:'#000',
            shadowOffset:{width:0,height:2},
            shadowOpacity:0.1,
            shadowRadius:4,
            elevation:3,
    },
image:{
    width:'100%',
    height:150,
    borderRadius:8,
        marginBottom:10,
},
name:{
    fontSize:18,
    fontWeight:'bold',
    marginBottom:5,
},
price:{
    fontSize:16,
    color:'#007AFF',
    fontWeight:'600',
    marginBottom:5,
},
description:{
    fontSize:14,
    color:'#6c757d',
    marginBottom:10,
},
nutritionContainer:{
    flexDirection:'row',
    marginBottom:10,
},
nutritionText:{
    fontSize:12,
    color:'#388E3C',
    marginRight:10,
    fontWeight:'500',
},
actionContainer:{
    flexDirection:'row',
    justifyContent:'flex-end',
    marginTop:10,
    paddingTop:10,
    borderTopWidth:1,
    borderTopColor:'#eee'
},
actionButton:{
    paddingVertical:8,
    paddingHorizontal:12,
    borderRadius:5,
    marginLeft:10,
},
buttonText:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:14,
},
headerRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:5,
},
indicator:{
    width:10,
    height:10,
    borderRadius:5,
    borderWidth:1,
    borderColor:'#fff',
    shadowColor:'#000',
    shadowOpacity:0.3,
    shadowRadius:1,
    elevation:1,
}
})
export default MenuCard;