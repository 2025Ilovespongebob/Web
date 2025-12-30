import { TextStyle } from 'react-native';

export const typography = {
    h1: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 48,
        lineHeight: 48,
        letterSpacing: -1.5,
    } as TextStyle,
    h2: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 30,
        lineHeight: 30,
        letterSpacing: -1,
    } as TextStyle,
    h3: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 24,
        lineHeight: 28.8,
        letterSpacing: -1,
    } as TextStyle,
    h4: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 20,
        lineHeight: 24,
        letterSpacing: 0,
    } as TextStyle,

    // Body Text
    bodyRegular: {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
    } as TextStyle,
    bodyMedium: {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
    } as TextStyle,
    bodyBold: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
    } as TextStyle,

    // Small Text
    smallRegular: {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 21,
        letterSpacing: 0.5,
    } as TextStyle,
    smallMedium: {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 21,
        letterSpacing: 0.5,
    } as TextStyle,
    smallBold: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 21,
        letterSpacing: 0.5,
    } as TextStyle,

    // Mini Text
    miniRegular: {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 1.5,
    } as TextStyle,
    miniMedium: {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 1.5,
    } as TextStyle,
    miniBold: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 1.5,
    } as TextStyle,
};
