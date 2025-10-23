import { createRouter, createWebHistory } from 'vue-router';
// Import your components
import ScenarioPlayer from '../ScenarioPlayer.vue'; 
import ScenarioEditor from '../ScenarioEditor.vue'; // Assuming this component exists

const routes = [
  {
    path: '/',
    name: 'Player',
    component: ScenarioPlayer, // Route for the player view
  },
  {
    path: '/edit',
    name: 'Editor',
    component: ScenarioEditor, // Route for the editor view
  },
];

const router = createRouter({
  // Use HTML5 history mode (clean URLs)
  history: createWebHistory(), 
  routes,
});

export default router;