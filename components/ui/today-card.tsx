import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const rightArrowSvg = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.7732 8.60179C12.8256 8.65404 12.8672 8.71611 12.8955 8.78445C12.9239 8.85279 12.9385 8.92605 12.9385 9.00004C12.9385 9.07403 12.9239 9.14729 12.8955 9.21563C12.8672 9.28396 12.8256 9.34604 12.7732 9.39829L6.02322 16.1483C5.9176 16.2539 5.77434 16.3132 5.62497 16.3132C5.4756 16.3132 5.33234 16.2539 5.22672 16.1483C5.1211 16.0427 5.06176 15.8994 5.06176 15.75C5.06176 15.6007 5.1211 15.4574 5.22672 15.3518L11.5796 9.00004L5.22672 2.64829C5.1211 2.54267 5.06176 2.39941 5.06176 2.25004C5.06176 2.10067 5.1211 1.95741 5.22672 1.85179C5.33234 1.74617 5.4756 1.68683 5.62497 1.68683C5.77434 1.68683 5.9176 1.74617 6.02322 1.85179L12.7732 8.60179Z" fill="white" stroke="#F8FAFC"/>
</svg>
`;

export type TodayCardState = 'Default' | 'Active' | 'Inactive' | 'Success';

interface TodayCardProps {
    state?: TodayCardState;
    title: string;
    metric1?: string; // e.g. "거리 2.4km"
    metric2?: string; // e.g. "2시간 소요"
    onPress?: () => void;
}

export const TodayCard: React.FC<TodayCardProps> = ({
    state = 'Active',
    title,
    metric1,
    metric2,
    onPress
}) => {
    // Map 'Default' to 'Active' for backward compatibility
    const currentState = state === 'Default' ? 'Active' : state;
    const isInactive = currentState === 'Inactive';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isInactive && styles.cardInactive
            ]}
            onPress={!isInactive ? onPress : undefined}
            activeOpacity={0.8}
            disabled={isInactive}
        >
            <View style={styles.content}>
                <Text style={[
                    styles.title,
                    isInactive && styles.titleInactive
                ]}>{title}</Text>

                {currentState === 'Success' && (metric1 || metric2) && (
                    <View style={styles.metricsContainer}>
                        {metric1 && (
                            <View style={styles.metricTag}>
                                <Text style={styles.metricText}>{metric1}</Text>
                            </View>
                        )}
                        {metric2 && (
                            <View style={styles.metricTag}>
                                <Text style={styles.metricText}>{metric2}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Right Arrow Icon */}
            <View style={[
                styles.iconContainer,
                isInactive && styles.iconContainerInactive
            ]}>
                <SvgXml xml={rightArrowSvg} width={18} height={18} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.Border2,
        // Add shadow if needed based on design, usually common for cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardInactive: {
        backgroundColor: colors.Gray1,
        borderColor: colors.Border1,
        shadowOpacity: 0,
        elevation: 0,
    },
    content: {
        flex: 1,
        gap: 12,
    },
    title: {
        ...typography.h4,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    titleInactive: {
        color: colors.Gray3,
    },
    metricsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    metricTag: {
        backgroundColor: colors.Gray1, // slate/100
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    metricText: {
        ...typography.smallMedium,
        color: colors.textPrimary,
    },
    iconContainer: {
        width: 36,
        height: 36,
        backgroundColor: "#020617",
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    iconContainerInactive: {
        backgroundColor: colors.Gray3,
    },
});
