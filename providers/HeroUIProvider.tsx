import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";

declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NonNullable<
            Parameters<ReturnType<typeof useRouter>["push"]>[1]
        >;
    }
}

const provider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    return (
        <HeroUIProvider navigate={router.push}>
            {children}
        </HeroUIProvider>
    );
}

export default provider;