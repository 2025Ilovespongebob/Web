import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'blue';
export type ButtonSize = 'default' | 'sm' | 'lg';
export type ButtonShape = 'default' | 'rounded';

interface ButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children: string;
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'default',
    shape = 'default',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    onPress,
    style,
    textStyle,
}) => {
    const getBackgroundColor = () => {
        if (disabled) {
            if (variant === 'ghost' || variant === 'outline') return 'transparent';
            return colors.Gray2; // Disabled background
        }
        switch (variant) {
            case 'primary':
                return colors.primary;
            case 'secondary':
                return colors.Gray1;
            case 'blue':
                return colors.Blue1;
            case 'outline':
            case 'ghost':
                return 'transparent';
            default:
                return colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.Gray4;
        switch (variant) {
            case 'primary':
            case 'blue':
                return '#FFFFFF';
            case 'secondary':
                return colors.textPrimary;
            case 'outline':
            case 'ghost':
                return colors.primary;
            default:
                return '#FFFFFF';
        }
    };

    const getBorderColor = () => {
        if (disabled) return 'transparent';
        if (variant === 'outline') return colors.primary;
        return 'transparent';
    };

    const getPadding = () => {
        switch (size) {
            case 'sm':
                return { paddingVertical: 8, paddingHorizontal: 12 };
            case 'lg':
                return { paddingVertical: 16, paddingHorizontal: 24 };
            default:
                return { paddingVertical: 12, paddingHorizontal: 16 };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm':
                return typography.smallBold;
            case 'lg':
                return typography.bodyBold; // Assuming lg uses body font size but could be larger
            default:
                return typography.bodyBold;
        }
    };

    const getBorderRadius = () => {
        return shape === 'rounded' ? 999 : 8; // rounded is pill, default is 8px
    };

    const containerStyles: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
        borderWidth: variant === 'outline' ? 1 : 0,
        borderRadius: getBorderRadius(),
        opacity: disabled ? 0.6 : 1,
        ...getPadding(),
        ...style,
    };

    const labelStyles: TextStyle = {
        ...getFontSize(),
        color: getTextColor(),
        textAlign: 'center',
        ...textStyle,
    };

    return (
        <TouchableOpacity
            style={containerStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
                    <Text style={labelStyles}>{children}</Text>
                    {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
                </>
            )}
        </TouchableOpacity>
    );
};
