// SPDX-License-Identifier: MPL-2.0
/**
 * Closes the mobile CoreDoc index after a reader selects a rule.
 * Changes only disclosure presentation; native links work without this script.
 * It does not define or execute financial behavior or make network requests.
 */
(() => {
  const index = document.querySelector('#core-mobile-index')
  if (!index) return
  index.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const link = event.target.closest('a[href^="#"]')
    if (link && index.contains(link)) index.open = false
  })
})()
