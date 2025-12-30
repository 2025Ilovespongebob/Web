import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const homeSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.856934 13.7143L11.9998 2.57144L23.1426 13.7143" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.28564 10.2857V21.4286H19.7142V10.2857" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const homeFillSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_111_2136)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.2122 2.21639C12.5427 1.54693 11.4573 1.54693 10.7878 2.21639L0.502102 12.5021C-0.167367 13.1716 -0.167367 14.257 0.502102 14.9265C1.17157 15.5959 2.25699 15.5959 2.92647 14.9265L3.42857 14.4244V22.2857C3.42857 23.2325 4.19609 24 5.14286 24H18.8571C19.8039 24 20.5714 23.2325 20.5714 22.2857V14.4244L21.0735 14.9265C21.743 15.5959 22.8285 15.5959 23.4979 14.9265C24.1673 14.257 24.1673 13.1716 23.4979 12.5021L13.2122 2.21639Z" fill="#F8FAFC"/>
</g>
</svg>
`;

const flashSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.7142 0.857147V9.42858H19.7142L10.2856 23.1429V14.5714H4.28564L13.7142 0.857147Z" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const flashFillSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_111_2142)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.5716 0.857115C14.5716 0.481662 14.3272 0.149909 13.9687 0.0385455C13.6101 -0.0728184 13.2208 0.0621303 13.0081 0.371519L3.57953 14.0858C3.3992 14.3481 3.37908 14.6887 3.52726 14.9704C3.67544 15.2522 3.96754 15.4286 4.28585 15.4286H9.42871V23.1429C9.42871 23.5183 9.67306 23.85 10.0316 23.9614C10.3902 24.0727 10.7795 23.9378 10.9922 23.6284L20.4207 9.91414C20.601 9.65184 20.6213 9.31121 20.473 9.0295C20.3249 8.74779 20.0328 8.57141 19.7144 8.57141H14.5716V0.857115Z" fill="#F8FAFC"/>
</g>
</svg>
`;

const calendarSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_111_2098)">
<path d="M2.57122 3.42859C2.11656 3.42859 1.68053 3.60921 1.35904 3.93069C1.03755 4.25218 0.856934 4.68821 0.856934 5.14287V21.4286C0.856934 21.8832 1.03755 22.3193 1.35904 22.6408C1.68053 22.9622 2.11656 23.1429 2.57122 23.1429H21.4284C21.883 23.1429 22.3191 22.9622 22.6405 22.6408C22.962 22.3193 23.1426 21.8832 23.1426 21.4286V5.14287C23.1426 4.68821 22.962 4.25218 22.6405 3.93069C22.3191 3.60921 21.883 3.42859 21.4284 3.42859H17.9998" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.856934 9.42859H23.1426" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 0.857147V6" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 0.857147V6" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 3.42859H14.5714" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>
`;

const calendarFillSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_111_2160)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.71429 1.71429C7.71429 0.767511 6.94677 0 6 0C5.05323 0 4.28571 0.767511 4.28571 1.71429V3.42857H2.57143C1.15127 3.42857 0 4.57983 0 6V8.57143H24V6C24 4.57983 22.8487 3.42857 21.4286 3.42857H19.7145V1.71429C19.7145 0.767511 18.947 0 18.0002 0C17.0534 0 16.2859 0.767511 16.2859 1.71429V3.42857H7.71429V1.71429ZM24 10.7143H0V21.4286C0 22.8487 1.15127 24 2.57143 24H21.4286C22.8487 24 24 22.8487 24 21.4286V10.7143Z" fill="#F8FAFC"/>
</g>
</svg>
`;

const userCircleSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_111_2120)">
<path d="M11.9996 13.7143C14.3665 13.7143 16.2853 11.7955 16.2853 9.42857C16.2853 7.06164 14.3665 5.14285 11.9996 5.14285C9.63265 5.14285 7.71387 7.06164 7.71387 9.42857C7.71387 11.7955 9.63265 13.7143 11.9996 13.7143Z" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.67969 20.4C5.44467 19.1443 6.51982 18.1065 7.80176 17.3865C9.0837 16.6663 10.5293 16.288 11.9997 16.288C13.47 16.288 14.9157 16.6663 16.1976 17.3865C17.4796 18.1065 18.5546 19.1443 19.3197 20.4" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.9998 23.1429C18.1539 23.1429 23.1426 18.1541 23.1426 12C23.1426 5.84598 18.1539 0.857147 11.9998 0.857147C5.84576 0.857147 0.856934 5.84598 0.856934 12C0.856934 18.1541 5.84576 23.1429 11.9998 23.1429Z" stroke="#020617" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>
`;

const userCircleFillSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_111_2163)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24 12C24 15.2175 22.7337 18.1392 20.6724 20.2941C18.4953 22.5698 15.4315 23.9901 12.0358 24C12.0239 24 12.0119 24 12 24C11.9881 24 11.9761 24 11.9642 24C8.56851 23.9901 5.50467 22.5698 3.32765 20.2941C1.26627 18.1392 0 15.2175 0 12C0 5.37259 5.37259 0 12 0C18.6274 0 24 5.37259 24 12ZM19.2734 18C17.5442 15.9059 14.9279 14.5714 12 14.5714C9.0721 14.5714 6.4559 15.9059 4.72654 18C6.4559 20.094 9.0721 21.4286 12 21.4286C14.9279 21.4286 17.5442 20.094 19.2734 18ZM12.0002 12.8571C14.3671 12.8571 16.2859 10.9383 16.2859 8.57138C16.2859 6.20445 14.3671 4.28566 12.0002 4.28566C9.63328 4.28566 7.71449 6.20445 7.71449 8.57138C7.71449 10.9383 9.63328 12.8571 12.0002 12.8571Z" fill="#F8FAFC"/>
</g>
</svg>
`;

interface NavBarProps {
    currentRoute: string;
    onNavigate: (route: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentRoute, onNavigate }) => {
    const navItems = [
        { route: 'index', label: '홈', icon: homeSvg, iconFill: homeFillSvg },
        { route: 'plogging', label: '플로깅', icon: flashSvg, iconFill: flashFillSvg },
        { route: 'report', label: '리포트', icon: calendarSvg, iconFill: calendarFillSvg },
        { route: 'my', label: '마이', icon: userCircleSvg, iconFill: userCircleFillSvg },
    ];

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                const isActive = currentRoute === item.route;
                return (
                    <TouchableOpacity
                        key={item.route}
                        style={[
                            styles.item,
                            isActive && styles.itemActive
                        ]}
                        onPress={() => onNavigate(item.route)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <SvgXml 
                                xml={isActive ? item.iconFill : item.icon} 
                                width={24} 
                                height={24}
                            />
                        </View>
                        <Text style={[
                            styles.label,
                            isActive ? styles.labelActive : styles.labelInactive
                        ]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 10,

  elevation: 5,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.Border2,
        paddingBottom: 24,
        paddingTop: 12,
        paddingHorizontal: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 12,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    itemActive: {
        backgroundColor: colors.primary,
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        ...typography.smallMedium,
        fontSize: 10,
        fontWeight: '500',
    },
    labelActive: {
        color: colors.background,
        fontWeight: '700',
    },
    labelInactive: {
        fontWeight:'700',
        color: colors.textPrimary,
    },
});
