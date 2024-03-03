/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'
import './index.css'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import { useConfig } from './services/config.service'
import { businessLogicSheetDef } from './businesslogic/businessLogic'

useConfig().setSheetDef(businessLogicSheetDef);

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
