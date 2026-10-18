// SPDX-License-Identifier: MPL-2.0
/**
 * Rotates the Learn page's authored example cards and updates their controls.
 * Changes only presentation in the current document; makes no network requests.
 * It does not define or execute financial behavior or assess conformance.
 */
(() => {
  const carousel = document.querySelector('#examples')
  if (!carousel) return
  const cards = [...carousel.querySelectorAll('.example-card')]
  const controls = carousel.querySelector('.example-controls')
  if (cards.length < 2 || !controls) return

  const toggle = controls.querySelector('[data-carousel-action="toggle"]')
  const count = controls.querySelector('.example-count')
  const status = carousel.querySelector('[data-carousel-status]')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const interval = 8000
  let index = 0
  let timer
  let paused = motion.matches
  let hovered = false
  let focused = false
  let visible = !('IntersectionObserver' in window)

  function schedule() {
    window.clearTimeout(timer)
    if (paused || hovered || focused || !visible || document.hidden) return
    timer = window.setTimeout(() => show(index + 1), interval)
  }

  function updateToggle() {
    toggle.textContent = paused ? 'Play' : 'Pause'
    toggle.setAttribute('aria-label', paused ? 'Start automatic examples' : 'Pause automatic examples')
  }

  function show(next, manual = false, direction = 1) {
    index = (next + cards.length) % cards.length
    cards.forEach((card, position) => {
      card.hidden = position !== index
      card.inert = position !== index
      card.classList.remove('is-entering')
    })
    const active = cards[index]
    active.style.setProperty('--example-direction', direction < 0 ? '-14px' : '14px')
    // Restart the entry animation even after rapid previous/next clicks.
    void active.offsetWidth
    active.classList.add('is-entering')
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`
    if (manual) status.textContent = `Example ${index + 1} of ${cards.length}: ${active.querySelector('h2').textContent}`
    schedule()
  }

  controls.querySelector('[data-carousel-action="previous"]').addEventListener('click', () => show(index - 1, true, -1))
  controls.querySelector('[data-carousel-action="next"]').addEventListener('click', () => show(index + 1, true))
  toggle.addEventListener('click', () => {
    paused = !paused
    updateToggle()
    status.textContent = paused ? 'Automatic examples paused.' : 'Automatic examples enabled; rotation waits until you leave the card.'
    schedule()
  })

  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return
    hovered = true
    schedule()
  })
  carousel.addEventListener('pointerleave', () => {
    hovered = false
    schedule()
  })
  carousel.addEventListener('focusin', () => {
    focused = true
    schedule()
  })
  carousel.addEventListener('focusout', event => {
    focused = carousel.contains(event.relatedTarget)
    schedule()
  })
  document.addEventListener('visibilitychange', schedule)
  motion.addEventListener('change', event => {
    if (event.matches) paused = true
    updateToggle()
    schedule()
  })
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].intersectionRatio >= 0.5
      schedule()
    }, { threshold: [0, 0.5] })
    observer.observe(carousel)
  }

  carousel.classList.add('is-ready')
  controls.hidden = false
  updateToggle()
  schedule()
})()
