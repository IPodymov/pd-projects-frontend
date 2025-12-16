<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import { router } from './router'

const auth = useAuthStore()

onMounted(() => {
  if (auth.token && !auth.user) auth.fetchProfile()
})

router.beforeEach(async (to, _from, next) => {
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }

  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login' })
  }

  if (to.meta?.guestOnly && auth.isAuthenticated) {
    return next({ name: 'home' })
  }

  if (Array.isArray(to.meta?.roles) && to.meta.roles.length) {
    const allowed = to.meta.roles.some((r: string) => auth.roles.includes(r))
    if (!allowed) return next({ name: 'home' })
  }

  return next()
})
</script>

<template>
  <v-app>
    <NavBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
  
</template>

<style scoped>
</style>
