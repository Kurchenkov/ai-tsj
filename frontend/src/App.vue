<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <h1>HouseHub</h1>
    <nav>
      <RouterLink to="/">Главная</RouterLink>
      <RouterLink to="/announcements">Объявления</RouterLink>
      <RouterLink to="/meters">Счётчики</RouterLink>
      <RouterLink to="/polls">Голосования</RouterLink>
      <RouterLink to="/login">Войти</RouterLink>
    </nav>
  </header>
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid #2c2c2c;
}
.app-header nav {
  display: flex;
  gap: 1rem;
}
.app-main {
  padding: 1.5rem 2rem;
}
</style>
