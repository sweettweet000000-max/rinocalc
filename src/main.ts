import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue'; // ① App.vue をルートコンポーネントに変更
import router from './router'; // ② router/index.jsからルーター設定をインポート

const pinia = createPinia(); 

const app = createApp(App);

app.use(pinia); 
app.use(router); // ③ ルーターを使用

app.mount('#app');