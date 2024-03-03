/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
//import '@/styles/main.scss'

// Composables
import { createVuetify } from 'vuetify';
import colors from 'vuetify/util/colors';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          background: colors.grey.lighten5,
          surface: colors.grey.lighten5,
          primary: colors.grey.darken4,
          secondary: colors.grey.lighten4,
          error: colors.red.base,
          info: colors.blue.base,
          success: colors.green.base,
          warning: colors.yellow.base,
        },
      },
      dark: {
        colors: {
          background: "#141414",
          surface: colors.grey.darken3,
          primary: colors.grey.darken3,
          secondary: colors.grey.darken4,
          error: colors.red.base,
          info: colors.blue.base,
          success: colors.green.base,
          warning: colors.yellow.base,
        },
      },
    },
  },
})