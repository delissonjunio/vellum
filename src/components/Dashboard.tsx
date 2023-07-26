import { type ProcessorStatistics } from '../types'
import React from 'react'

interface DashboardProps {
  statistics: ProcessorStatistics
}

const Dashboard = ({ statistics }: DashboardProps) => {
  return (
    <table className="w-full bg-white">
      <tbody>
        {
          Array.from(statistics.entries())
            .map(([key, value], index) => (
              <tr key={index}>
                <td className="px-2">{key}</td>
                <td className="px-2 text-right">{value}</td>
              </tr>
            ))}
      </tbody>
    </table>
  )
}

export default Dashboard
