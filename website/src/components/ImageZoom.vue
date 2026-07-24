<script setup lang="ts">
import type { Zoom } from 'medium-zoom'
import { useRoute } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'

interface ZoomableImage {
  image: HTMLImageElement
  keydown: (event: KeyboardEvent) => void
  tabindex: string | null
  role: string | null
  ariaLabel: string | null
}

const route = useRoute()
let zoom: Zoom | undefined
let zoomableImages: ZoomableImage[] = []
let attachmentVersion = 0

function restoreAttribute(
  element: HTMLElement,
  name: string,
  value: string | null,
) {
  if (value === null) {
    element.removeAttribute(name)
  } else {
    element.setAttribute(name, value)
  }
}

function detachZoom() {
  zoom?.detach()
  zoom = undefined

  for (const { image, keydown, tabindex, role, ariaLabel } of zoomableImages) {
    image.removeEventListener('keydown', keydown)
    restoreAttribute(image, 'tabindex', tabindex)
    restoreAttribute(image, 'role', role)
    restoreAttribute(image, 'aria-label', ariaLabel)
  }
  zoomableImages = []
}

async function attachZoom() {
  const version = ++attachmentVersion
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  const { default: mediumZoom } = await import('medium-zoom')
  if (version !== attachmentVersion) return

  detachZoom()

  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>(
      '.vp-doc img:not(.no-zoom):not([data-no-zoom])',
    ),
  ).filter((image) => !image.closest('a'))

  if (images.length === 0) return

  zoom = mediumZoom(images, {
    background: 'var(--vp-c-bg)',
    margin: 24,
    scrollOffset: 48,
  })

  zoomableImages = images.map((image) => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      void zoom?.toggle({ target: image })
    }

    const original = {
      tabindex: image.getAttribute('tabindex'),
      role: image.getAttribute('role'),
      ariaLabel: image.getAttribute('aria-label'),
    }

    image.tabIndex = 0
    image.setAttribute('role', 'button')
    image.setAttribute(
      'aria-label',
      `${image.alt || 'Image'} — activate to zoom`,
    )
    image.addEventListener('keydown', keydown)

    return { image, keydown, ...original }
  })
}

onMounted(() => void attachZoom())
watch(
  () => route.path,
  () => void attachZoom(),
)
onBeforeUnmount(() => {
  attachmentVersion++
  detachZoom()
})
</script>
