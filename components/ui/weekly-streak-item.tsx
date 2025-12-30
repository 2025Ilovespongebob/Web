import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const checkSvg = `
<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_81_74)">
<path d="M0.5 8.55005L3.23 12.06C3.32212 12.1797 3.44016 12.277 3.57525 12.3446C3.71034 12.4121 3.85898 12.4482 4.01 12.45C4.15859 12.4518 4.3057 12.4203 4.44063 12.3581C4.57555 12.2958 4.6949 12.2042 4.79 12.09L13.5 1.55005" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_81_74">
<rect width="14" height="14" fill="white"/>
</clipPath>
</defs>
</svg>
`;

const xSvg = `
<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_81_303)">
<path d="M13.5 0.5L0.5 13.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.5 0.5L13.5 13.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_81_303">
<rect width="14" height="14" fill="white"/>
</clipPath>
</defs>
</svg>
`;

export type StreakState = 'Past Failed' | 'Past Success' | 'Today Success' | 'Today Empty' | 'Future';

interface WeeklyStreakItemProps {
    state: StreakState;
    day: string; // "Mon", "Tue", etc.
}

export const WeeklyStreakItem: React.FC<WeeklyStreakItemProps> = ({ state, day }) => {
    const getStatusColor = () => {
        switch (state) {
            case 'Past Success':
            case 'Today Success':
                return colors.primary; // Blue
            case 'Past Failed':
                return colors.Gray4;
            case 'Today Empty':
                return "#E2E8F0"; // Light Gray placeholder
            case 'Future':
                return colors.Gray1; // Lighter Gray
            default:
                return colors.Gray1;
        }
    };

    const renderStatus = () => {
        return (
            <View style={[
                styles.statusCircle, 
                { backgroundColor: getStatusColor() },
                { borderWidth: 1, borderColor: colors.Border1 }
            ]}>
                {/* Checkmark icon for success states */}
                {(state === 'Past Success' || state === 'Today Success') && (
                    <SvgXml xml={checkSvg} width={14} height={14} />
                )}
                {/* X icon for failed state */}
                {state === 'Past Failed' && (
                    <SvgXml xml={xSvg} width={14} height={14} />
                )}
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Text style={styles.dayText}>{day}</Text>
            {renderStatus()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
    },
    dayText: {
        ...typography.miniMedium,
        color: colors.textSecondary,
    },
    statusCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        ...typography.miniMedium,
        color: colors.textSecondary,
    },
});
