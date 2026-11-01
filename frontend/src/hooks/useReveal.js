import { useEffect, useState } from 'react'

const THRESHOLD = 0.15

function useReveal(ref) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = ref.current

    if (!target || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('in')
          setVisible(true)
          observer.unobserve(entry.target)
        })
      },
      { threshold: THRESHOLD }
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [ref])

  return [ref, visible]
}

export default useReveal
