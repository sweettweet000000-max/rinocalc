<template>
  <div>
    <nav>
      <router-link to="/">ScenarioPlayer (View Mode)</router-link> |
      <router-link to="/edit">ScenarioEditor (Edit Mode)</router-link>
    </nav>
    <hr>
    
    <router-view></router-view>
  </div>
</template>

<script>
// No need for a lot of logic here, its main job is layout and routing.
export default {
  name: 'App',
};
</script>

<style>
/* Basic styling for demonstration */
nav {
  padding: 10px;
}
nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}
/* Highlight the active link */
nav a.router-link-exact-active {
  color: #42b983;
}
</style>