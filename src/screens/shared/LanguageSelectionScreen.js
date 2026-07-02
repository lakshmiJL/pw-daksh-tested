import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const LanguageSelectionScreen = ({ navigation }) => {
  const selectLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('userLanguage', lang);
      navigation.navigate('Auth');
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>अपनी भाषा चुनिए</Text>
      </View>
      
      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.langCard} 
          onPress={() => selectLanguage('en')}
          activeOpacity={0.7}
        >
          <View style={styles.langLeft}>
            <Text style={styles.langEmoji}>🇬🇧</Text>
            <View>
              <Text style={styles.langName}>English</Text>
              <Text style={styles.langSub}>Default</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.langCard}
          onPress={() => selectLanguage('hi')}
          activeOpacity={0.7}
        >
          <View style={styles.langLeft}>
            <Text style={styles.langEmoji}>🇮🇳</Text>
            <View>
              <Text style={styles.langName}>हिन्दी (Hindi)</Text>
              <Text style={styles.langSub}>Hindi</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.xxxl,
    paddingTop: SPACING.xxxl * 2,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
  cardsContainer: {
    paddingHorizontal: SPACING.xxxl,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langEmoji: {
    fontSize: 32,
    marginRight: SPACING.lg,
  },
  langName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  langSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
  },
  chevron: {
    fontSize: 28,
    color: COLORS.textTertiary,
    fontWeight: '300',
  },
});

export default LanguageSelectionScreen;