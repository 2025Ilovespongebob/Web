import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { GradeLevel } from './grade-tag';

interface TrashAreaProps {
    grade?: GradeLevel;
    style?: ViewStyle;
}

export const TrashArea: React.FC<TrashAreaProps> = ({ grade = '1', style }) => {
    const getGradeColor = () => {
        switch (grade) {
            case '1':
                return colors.Red3;
            case '2':
                return colors.Orange3;
            case '3':
                return colors.Blue3;
            default:
                return colors.Gray3;
        }
    };

    return (
        <View style={[styles.container, style]}>
            {/* Banner/Label Area */}
            <View style={[styles.banner, { backgroundColor: getGradeColor() }]}>
                <Text style={styles.title}>쓰레기 밀집 예상 {grade}등급</Text>
            </View>

            {/* Triangle/Pointer (visual flair from screenshot) */}
            <View style={[
                styles.triangle,
                { borderTopColor: getGradeColor() }
            ]} />

            {/* Circular Area Indicator (Semi-transparent) */}
            <View style={[
                styles.circleArea,
                { backgroundColor: getGradeColor() }
            ]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    banner: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginBottom: 0,
        zIndex: 2,
    },
    title: {
        ...typography.smallBold,
        color: '#FFFFFF',
        fontSize: 14,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        // borderTopColor set dynamically
        marginBottom: -4, // Overlap slightly with circle
        zIndex: 1,
    },
    circleArea: {
        width: 40,
        height: 40,
        borderRadius: 20,
        opacity: 0.4, // Semi-transparent effect
        marginTop: -4,
    },
});
