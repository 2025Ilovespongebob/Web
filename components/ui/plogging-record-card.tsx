import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { Button } from './button';

const flashFillBlueSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.5716 0.857084C14.5716 0.481632 14.3272 0.149879 13.9687 0.038515C13.6101 -0.0728489 13.2208 0.0620998 13.0081 0.371489L3.57953 14.0858C3.3992 14.3481 3.37908 14.6887 3.52726 14.9704C3.67544 15.2521 3.96754 15.4285 4.28585 15.4285H9.42871V23.1428C9.42871 23.5183 9.67306 23.85 10.0316 23.9614C10.3902 24.0727 10.7795 23.9378 10.9922 23.6283L20.4207 9.91411C20.601 9.6518 20.6213 9.31118 20.473 9.02947C20.3249 8.74776 20.0328 8.57138 19.7144 8.57138H14.5716V0.857084Z" fill="#155DFC"/>
</svg>
`;

interface PloggingRecordCardProps {
    location: string;
    distance: string;
    duration: string;
    onPressDetail?: () => void;
    style?: ViewStyle;
}

export const PloggingRecordCard: React.FC<PloggingRecordCardProps> = ({
    location,
    distance,
    duration,
    onPressDetail,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
            

  <View style={styles.row}>
                     
                
<View style={styles.iconContainer}>
                        <SvgXml xml={flashFillBlueSvg} width={28} height={28} />
                    </View>
            <View style={styles.content}>
                <Text style={styles.locationTitle}>{location}</Text>
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>{distance}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.statsText}>{duration}</Text>
                </View>
            </View>
</View>
            <Button
                    variant="secondary"
                    size="sm"
                    onPress={onPressDetail}
                    textStyle={styles.detailButtonText}
                    style={styles.detailButton}
                >
                    자세히보기
                </Button>
                </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingHorizontal:24,
        paddingVertical:16,
        borderBottomWidth: 2,
        borderColor: colors.Border2,
    },
    row:{
        flexDirection: 'row',
        alignItems:'center',
        gap:8
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        ...typography.bodyBold,
        color: colors.textSecondary,
    },
    detailButton: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        height: 'auto',
    },
    detailButtonText: {
        ...typography.smallMedium,
        color: colors.textPrimary,
        fontWeight: '700',
        paddingHorizontal:12,
        paddingVertical:8
    },
    content: {
        
    },
    locationTitle: {
        ...typography.bodyRegular,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statsText: {
        ...typography.bodyRegular,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: colors.Border3,
    },
});
