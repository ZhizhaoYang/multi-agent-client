"use client";


import * as React from "react";
import type { ThemeProviderProps } from "next-themes";
import { useRouter } from "next/navigation";

import HeroUIProvider from "./HeroUIProvider";
import ThemeProvider from "./ThemeProvider";
import StyledComponentsRegistry from './AntdRegistry';

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {

    return (
        <StyledComponentsRegistry>
            <HeroUIProvider>
                <ThemeProvider {...themeProps}>
                    {children}
                </ThemeProvider>
            </HeroUIProvider>
        </StyledComponentsRegistry>
    );
}
