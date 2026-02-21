AOS.init({
  duration: 850,
  once: true,
  offset: 80
})

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const id = link.getAttribute("href")
    const el = document.querySelector(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  })
})