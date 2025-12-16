import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

// Иконки MDI (требует пакет @mdi/font)
import "@mdi/font/css/materialdesignicons.css";

export const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#1E88E5",
          secondary: "#03A9F4",
          surface: "#FFFFFF",
        },
      },
    },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
});
