import React from 'react'
import CurrentCard from './CurrentCard.jsx'
import HourlyCard from './HourlyCard.jsx'
import StatsGrid from './StatsGrid.jsx'
import WeeklyCard from './WeeklyCard.jsx'

function Dashboard({ weather, locationLabel }) {
  return (
    <>
      <div className="grid-main">
        <CurrentCard weather={weather} locationLabel={locationLabel} />
        <HourlyCard weather={weather} />
      </div>
      <StatsGrid current={weather.current} />
      <WeeklyCard weather={weather} />
    </>
  )
}

export default Dashboard
