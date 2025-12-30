import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const chevronLeft = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 18L9 12L15 6" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const chevronRight = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 18L15 12L9 6" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

interface CalendarProps {
    markedDates?: string[]; // Array of 'YYYY-MM-DD' strings
    onDateSelect?: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ markedDates = [], onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        if (onDateSelect) {
            onDateSelect(dateStr);
        }
    };

    const renderDays = () => {
        const days = [];
        // Empty slots for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isMarked = markedDates.includes(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();

            days.push(
                <TouchableOpacity
                    key={i}
                    style={[
                        styles.dayCell,
                        isSelected && styles.selectedDayCell,
                        isToday && !isSelected && styles.todayCell
                    ]}
                    onPress={() => handleDateClick(i)}
                >
                    <Text style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isToday && !isSelected && styles.todayText
                    ]}>
                        {i}
                    </Text>
                    {isMarked && !isSelected && <View style={styles.dot} />}
                </TouchableOpacity>
            );
        }
        return days;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                    <SvgXml xml={chevronLeft} width={20} height={20} />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                    {year}년 {month + 1}월
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <SvgXml xml={chevronRight} width={20} height={20} />
                </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View style={styles.weekRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <Text key={day} style={[styles.weekDayText, index === 0 && styles.sundayText]}>
                        {day}
                    </Text>
                ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
                {renderDays()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 24, // More rounded
        paddingHorizontal: 16,
        paddingVertical: 12,
        height:360
    },
    header: {
        marginHorizontal:'auto',
        flexDirection: 'row',
        width : '65%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    monthTitle: {
        ...typography.h4,
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    navButton: {
        padding: 8,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    weekDayText: {
        ...typography.smallMedium,
        color: colors.Gray4, // Softer gray for weekdays
        width: 40,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
    sundayText: {
        color: colors.Red3,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectedDayCell: {
        backgroundColor: colors.Blue3, // Blue3 background
        borderRadius: 999, // Perfect circle
    },
    todayCell: {
        borderWidth: 1.5,
        borderColor: colors.Gray2, // Subtle border for today
        borderRadius: 999,
    },
    dayText: {
        ...typography.bodyRegular,
        color: colors.textPrimary,
        fontWeight: '500',
        fontSize: 16,
    },
    selectedDayText: {
        color: colors.background, // White text
        fontWeight: '800',
    },
    todayText: {
        color: colors.Blue3,
        fontWeight: '700',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.Blue3,
        position: 'absolute',
        bottom: 6,
    },
});
