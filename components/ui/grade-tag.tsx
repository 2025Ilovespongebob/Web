import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export type GradeLevel = '1' | '2' | '3';

interface GradeTagProps {
    grade?: GradeLevel;
    style?: ViewStyle;
}

export const GradeTag: React.FC<GradeTagProps> = ({ grade = '1', style }) => {
    const getGradeColor = () => {
        switch (grade) {
            case '1':
                return colors.Red3; // High density/risk
            case '2':
                return colors.Orange3; // Medium
            case '3':
                return colors.Blue3; // Low/Clean
            default:
                return colors.Gray3;
        }
    };

    const getLabel = () => `${grade}등급`;

    return (
        <View style={[styles.container, { backgroundColor: getGradeColor() }, style]}>
            <Text style={styles.text}>{getLabel()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        ...typography.smallMedium,
        color: '#FFFFFF',
        fontSize: 12, // Slight adjustment for tag size if needed
    },
});
