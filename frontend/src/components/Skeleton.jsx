import React from 'react'

function skeletonBars() {
  return Array.from({ length: 4 })
}

function skeletonDays() {
  return Array.from({ length: 7 })
}

function Skeleton({ variant = 'panel' }) {
  if (variant !== 'panel') {
    return null
  }

  return (
    <>
      <div className="grid-main">
        <section
          className="card current"
          aria-busy="true"
          aria-label="Temperatura atual"
        >
          <div className="current-top">
            <span className="loc"><span className="sk" /></span>
            <span className="updated"><span className="sk" /></span>
          </div>
          <div className="current-main">
            <span className="sk temp-circle" aria-hidden="true" />
            <div className="temp-block">
              <span className="sk" />
              <span className="sk" />
            </div>
          </div>
          <div className="current-foot">
            <span className="chip hot"><span className="sk" /></span>
            <span className="chip cold"><span className="sk" /></span>
            <span className="chip plain"><span className="sk" /></span>
          </div>
        </section>
        <section
          className="card"
          aria-busy="true"
          aria-label="Previsão por hora"
        >
          <div className="card-head">
            <div>
              <h2><span className="sk" /></h2>
              <div className="sub"><span className="sk" /></div>
            </div>
            <span className="chip plain"><span className="sk dotline" /></span>
          </div>
          <div className="chart-wrap">
            <span className="sk chart-rect" aria-hidden="true" />
          </div>
        </section>
      </div>
      <div className="grid-stats">
        {skeletonBars().map((_, i) => (
          <div className="card stat" key={i} aria-busy="true">
            <div className="stat-top">
              <span className="stat-ico"><span className="sk" /></span>
              <span className="stat-label"><span className="sk" /></span>
            </div>
            <div className="stat-val"><span className="sk" /></div>
            <div className="bar"><i className="sk" /></div>
          </div>
        ))}
      </div>
      <section
        className="card"
        aria-busy="true"
        aria-label="Próximos sete dias"
      >
        <div className="card-head">
          <div>
            <h2><span className="sk" /></h2>
            <div className="sub"><span className="sk" /></div>
          </div>
        </div>
        <div className="weekly-grid">
          {skeletonDays().map((_, i) => (
            <div className="day" key={i}>
              <span className="d-name"><span className="sk" /></span>
              <span className="d-date"><span className="sk" /></span>
              <span className="sk d-ico" aria-hidden="true" />
              <div className="d-temps"><span className="sk" /></div>
              <div className="d-rain"><span className="sk" /></div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Skeleton
