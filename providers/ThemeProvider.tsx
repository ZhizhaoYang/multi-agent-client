import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

const ThemeProvider = ({ children, themeProps }: { children: React.ReactNode, themeProps?: ThemeProviderProps }) => {
    return (
        <NextThemesProvider {...themeProps}>
            {children}
        </NextThemesProvider>
    );
}

export default ThemeProvider;