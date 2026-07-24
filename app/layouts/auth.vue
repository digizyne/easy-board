<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
    <NuxtLink to="/" class="flex items-center">
      <EasyLogo class="text-3xl" />
    </NuxtLink>
    <div class="w-full max-w-sm">
      <slot />
    </div>
  </div>
</template>
