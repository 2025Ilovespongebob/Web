import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StreakState, WeeklyStreakItem } from './weekly-streak-item';
import { colors } from '../../styles/colors';

export const WeeklyStreak: React.FC = () => {
    // Mock data for the week
    const weekData: { day: string; date: number; state: StreakState }[] = [
        { day: 'Mon', date: 15, state: 'Past Success' },
        { day: 'Tue', date: 16, state: 'Past Success' },
        { day: 'Wed', date: 17, state: 'Past Failed' },
        { day: 'Thu', date: 18, state: 'Today Success' },
        { day: 'Fri', date: 19, state: 'Future' },
        { day: 'Sat', date: 20, state: 'Future' },
        { day: 'Sun', date: 21, state: 'Future' },
    ];

    return (
        <View style={styles.container}>
            {weekData.map((item, index) => (
                <WeeklyStreakItem
                    key={index}
                    day={item.day}
                    state={item.state}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: colors.Border3,
        borderRadius : 16,
        paddingHorizontal:16
    },
});
