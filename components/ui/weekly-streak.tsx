import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StreakState, WeeklyStreakItem } from './weekly-streak-item';
import { colors } from '../../styles/colors';
import { WeeklyRecord } from '@/types/main-report';

interface WeeklyStreakProps {
  weeklyRecords: WeeklyRecord[];
}

export const WeeklyStreak: React.FC<WeeklyStreakProps> = ({ weeklyRecords }) => {
    // API 데이터를 WeeklyStreakItem 형식으로 변환
    const weekData = weeklyRecords.map((record) => {
        let state: StreakState = 'Future';
        
        // status에 따라 state 결정
        if (record.status === 'COMPLETED') {
          state = 'Past Success';
        } else if (record.status === 'FAILED') {
          state = 'Past Failed';
        } else if (record.status === 'TODAY') {
          state = record.trashCount > 0 ? 'Today Success' : 'Today Empty';
        } else if (record.status === 'FUTURE') {
          state = 'Future';
        }
        
        return {
          day: record.dayOfWeek,
          state,
        };
    });

    // 데이터가 없으면 기본 7일 표시
    const defaultWeekData = [
        { day: 'Mon', state: 'Future' as StreakState },
        { day: 'Tue', state: 'Future' as StreakState },
        { day: 'Wed', state: 'Future' as StreakState },
        { day: 'Thu', state: 'Future' as StreakState },
        { day: 'Fri', state: 'Future' as StreakState },
        { day: 'Sat', state: 'Future' as StreakState },
        { day: 'Sun', state: 'Future' as StreakState },
    ];

    const displayData = weekData.length > 0 ? weekData : defaultWeekData;

    return (
        <View style={styles.container}>
            {displayData.map((item, index) => (
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
