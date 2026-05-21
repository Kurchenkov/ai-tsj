<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { http } from '../api/http'

const health = ref<string>('проверяю...')

onMounted(async () => {
  try {
    const { data } = await http.get('/health')
    health.value = `API: ${data.status} (${data.timestamp})`
  } catch (e) {
    health.value = 'API недоступен'
  }
})
</script>

<template>
  <section>
    <h2>Добро пожаловать</h2>
    <p>Личный кабинет жильца многоквартирного дома.</p>
    <p class="health">{{ health }}</p>
  </section>
</template>

<style scoped>
.health {
  margin-top: 1rem;
  font-family: monospace;
  color: #888;
}
</style>
