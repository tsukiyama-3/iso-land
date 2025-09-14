export const useDevice = () => {
  const isDesktop = ref(false)
  const isMobile = ref(false)
  const isTablet = ref(false)

  const updateDeviceType = () => {
    if (import.meta.client) {
      const width = window.innerWidth
      isDesktop.value = width >= 1024 // lg breakpoint
      isTablet.value = width >= 768 && width < 1024 // md breakpoint
      isMobile.value = width < 768
    }
  }

  onMounted(() => {
    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', updateDeviceType)
    }
  })

  return {
    isDesktop: readonly(isDesktop),
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
  }
}
