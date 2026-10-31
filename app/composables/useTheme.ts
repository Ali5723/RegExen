export const useTheme = () => {
  const colorMode = useColorMode();

  const theme = useCookie<"light" | "dark">("theme", {
    default: () => "light",
  });

  const toggleTheme = () => {
    const nextTheme = theme.value === "dark" ? "light" : "dark";

    theme.value = nextTheme;
    colorMode.preference = nextTheme;
  };

  return {
    theme,
    toggleTheme,
  };
};
